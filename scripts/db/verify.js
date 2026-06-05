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
];

const countedTables = [
  'managed_profiles',
  'pending_action_logs',
  'rooms',
  'credit_accounts',
  'credit_events',
  'room_responsibilities',
  'room_state_events',
];

withDb(async (client) => {
  const existingTables = await getExistingTables(client, expectedTables);
  const appUserColumns = existingTables.has('app_users')
    ? await getTableColumns(client, 'app_users')
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

  const warnings = [];
  if (appUserColumns.includes('auth_id') && !appUserColumns.includes('auth_user_id')) {
    warnings.push('app_users has auth_id but not auth_user_id; use the shared resolver for scripts and schema checks.');
  }
  if (missingTables.length > 0) {
    warnings.push(`Missing tables: ${missingTables.join(', ')}`);
  }

  console.log(JSON.stringify({
    status: missingTables.length === 0 ? 'ok' : 'needs_migration',
    appUserColumns,
    identity,
    counts,
    warnings,
  }, null, 2));
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
