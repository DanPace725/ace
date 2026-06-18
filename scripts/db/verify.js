const { getExistingTables, getTableColumns, resolveAppUser, withDb } = require('./db-client');

const expectedTables = [
  'app_users',
  'managed_profiles',
  'pending_action_logs',
  'rooms',
  'credit_accounts',
  'credit_events',
  'room_responsibilities',
  'room_state_events',
  'admin_pin_settings',
];

const countedTables = [
  'managed_profiles',
  'pending_action_logs',
  'rooms',
  'credit_accounts',
  'credit_events',
  'room_responsibilities',
  'room_state_events',
  'admin_pin_settings',
];

withDb(async (client) => {
  const existingTables = await getExistingTables(client, expectedTables);
  const appUserColumns = existingTables.has('app_users')
    ? await getTableColumns(client, 'app_users')
    : [];
  const roomResponsibilityColumns = existingTables.has('room_responsibilities')
    ? await getTableColumns(client, 'room_responsibilities')
    : [];
  const missingTables = expectedTables.filter((table) => !existingTables.has(table));

  let identity = null;
  if (existingTables.has('app_users') && existingTables.has('managed_profiles')) {
    const resolved = await resolveAppUser(client);
    identity = {
      appUserCount: resolved.appUserCount,
      selectedAppUserId: resolved.appUser.id,
      lookupIds: resolved.lookupIds,
      profileCount: resolved.profiles.length,
      profiles: resolved.profiles.map((profile) => profile.name),
    };
  }

  const counts = [];
  for (const table of countedTables) {
    if (!existingTables.has(table)) continue;
    const { rows } = await client.query(`select count(*)::int as count from ${table}`);
    counts.push({ table, rows: rows[0].count });
  }

  let creditAccounts = null;
  if (existingTables.has('credit_accounts')) {
    const { rows } = await client.query(
      `select owner_type, count(*)::int as count
       from credit_accounts
       group by owner_type
       order by owner_type`
    );
    creditAccounts = rows;
  }

  const warnings = [];
  if (appUserColumns.includes('auth_id') && !appUserColumns.includes('auth_user_id')) {
    warnings.push('app_users has auth_id but not auth_user_id; use the shared resolver for scripts and schema checks.');
  }
  if (missingTables.length > 0) {
    warnings.push(`Missing tables: ${missingTables.join(', ')}`);
  }
  if (existingTables.has('room_responsibilities') && !roomResponsibilityColumns.includes('grace_hours')) {
    warnings.push('room_responsibilities is missing grace_hours; apply migration 006_room_responsibility_grace.sql.');
  }

  console.log(JSON.stringify({
    status: missingTables.length === 0 ? 'ok' : 'needs_migration',
    appUserColumns,
    roomResponsibilityColumns,
    identity,
    counts,
    creditAccounts,
    warnings,
  }, null, 2));
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
