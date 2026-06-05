const fs = require('fs');
const path = require('path');
const { projectRoot, withDb } = require('./db-client');

const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');

const hasUnsafeStatement = (sql) => {
  const unsafePatterns = [
    /^\s*drop\s+/im,
    /^\s*delete\s+from\s+/im,
    /^\s*truncate\s+/im,
    /^\s*alter\s+table\b.*\bdrop\b/im,
    /^\s*alter\s+table\b.*\brename\b/im,
    /^\s*create\s+table\s+(?!if\s+not\s+exists)/im,
  ];

  return unsafePatterns.some((pattern) => pattern.test(sql));
};

const getTargetMigrationNames = () => {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');
  const explicitFile = fileIndex >= 0 ? args[fileIndex + 1] : null;
  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (explicitFile) {
    const matched = files.find((file) => file === explicitFile || file.includes(explicitFile));
    if (!matched) throw new Error(`Could not find migration matching ${explicitFile}.`);
    return [matched];
  }

  return files;
};

const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

withDb(async (client) => {
  const targetMigrationNames = getTargetMigrationNames();
  const results = [];

  for (const migrationName of targetMigrationNames) {
    const migrationPath = path.join(migrationsDir, migrationName);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const unsafe = hasUnsafeStatement(sql);

    if (unsafe && !force) {
      results.push({
        migration: migrationName,
        status: 'skipped',
        reason: 'contains non-idempotent or destructive-looking SQL; pass --file and --force only after review',
      });
      continue;
    }

    if (dryRun) {
      results.push({ migration: migrationName, status: 'would_apply' });
      continue;
    }

    await client.query('begin');
    try {
      await client.query(sql);
      await client.query('commit');
      results.push({ migration: migrationName, status: 'applied' });
    } catch (error) {
      await client.query('rollback');
      throw new Error(`${migrationName} failed: ${error.message}`);
    }
  }

  console.log(JSON.stringify(results, null, 2));
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
