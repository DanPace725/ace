const { getTableColumns, resolveAppUser, withDb } = require('./db-client');

withDb(async (client) => {
  const appUserColumns = await getTableColumns(client, 'app_users');
  const { appUser, appUserCount, lookupIds, profiles } = await resolveAppUser(client);

  console.log(JSON.stringify({
    appUserCount,
    selectedAppUserId: appUser.id,
    appUserColumns,
    lookupIds,
    profileCount: profiles.length,
    profiles: profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      app_user_id: profile.app_user_id,
    })),
  }, null, 2));
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
