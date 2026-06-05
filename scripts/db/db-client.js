const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const projectRoot = path.resolve(__dirname, '..', '..');

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return env;

      const separatorIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      env[key] = rawValue.replace(/^['"]|['"]$/g, '');
      return env;
    }, {});
};

const loadEnv = () => ({
  ...parseEnvFile(path.join(projectRoot, '.env.local')),
  ...process.env,
});

const getConnectionOptions = () => {
  const env = loadEnv();
  const connectionString = env.DATABASE_URL || env.SUPABASE_DB_URL;

  if (connectionString) {
    return {
      connectionString,
      ssl: env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    };
  }

  const projectId = env.PROJECT_ID;
  const password = env.dbpass || env.DB_PASSWORD || env.POSTGRES_PASSWORD;

  if (!projectId || !password) {
    throw new Error('Missing DB connection settings. Set DATABASE_URL, or PROJECT_ID and dbpass in .env.local.');
  }

  return {
    host: env.SUPABASE_DB_HOST || 'aws-0-us-west-1.pooler.supabase.com',
    port: Number(env.SUPABASE_DB_PORT || 6543),
    database: env.SUPABASE_DB_NAME || 'postgres',
    user: env.SUPABASE_DB_USER || `postgres.${projectId}`,
    password,
    ssl: env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  };
};

const withDb = async (callback) => {
  const client = new Client(getConnectionOptions());
  await client.connect();

  try {
    return await callback(client);
  } finally {
    await client.end();
  }
};

const getTableColumns = async (client, tableName) => {
  const { rows } = await client.query(
    `select column_name
     from information_schema.columns
     where table_schema = 'public' and table_name = $1
     order by ordinal_position`,
    [tableName]
  );

  return rows.map((row) => row.column_name);
};

const getExistingTables = async (client, tableNames) => {
  const { rows } = await client.query(
    `select table_name
     from information_schema.tables
     where table_schema = 'public' and table_name = any($1::text[])`,
    [tableNames]
  );

  return new Set(rows.map((row) => row.table_name));
};

const resolveAppUser = async (client) => {
  const env = loadEnv();
  const requestedAppUser = env.ACE_APP_USER_ID || env.APP_USER_ID;
  const { rows } = await client.query('select * from app_users order by created_at asc');

  if (rows.length === 0) {
    throw new Error('No app_users rows found.');
  }

  const identityColumns = ['id', 'auth_id', 'auth_user_id', 'app_user_id'];
  const getIdentityValues = (row) => identityColumns
    .map((column) => row[column])
    .filter(Boolean);

  const appUser = requestedAppUser
    ? rows.find((row) => getIdentityValues(row).includes(requestedAppUser))
    : rows.length === 1
      ? rows[0]
      : null;

  if (!appUser) {
    throw new Error(
      rows.length > 1
        ? 'Multiple app_users rows found. Set ACE_APP_USER_ID in .env.local or the shell before running this command.'
        : `Could not find app user matching ACE_APP_USER_ID=${requestedAppUser}.`
    );
  }

  const lookupIds = Array.from(new Set(getIdentityValues(appUser)));
  const { rows: profiles } = await client.query(
    `select id, name, app_user_id
     from managed_profiles
     where app_user_id = any($1::uuid[])
     order by created_at asc, name asc`,
    [lookupIds]
  );

  return {
    appUser,
    lookupIds,
    profiles,
    appUserCount: rows.length,
  };
};

module.exports = {
  getExistingTables,
  getTableColumns,
  loadEnv,
  projectRoot,
  resolveAppUser,
  withDb,
};
