const { resolveAppUser, withDb } = require('./db-client');

withDb(async (client) => {
  const { appUser, profiles } = await resolveAppUser(client);
  const results = [];

  await client.query('begin');
  try {
    for (const profile of profiles) {
      const { rows } = await client.query(
        `insert into credit_accounts (app_user_id, owner_type, profile_id)
         values ($1, 'profile', $2)
         on conflict do nothing
         returning id, profile_id, balance::text`,
        [appUser.id, profile.id]
      );

      if (rows[0]) {
        results.push({
          profile: profile.name,
          profile_id: profile.id,
          account_id: rows[0].id,
          balance: rows[0].balance,
          status: 'created',
        });
      } else {
        const existing = await client.query(
          `select id, balance::text
           from credit_accounts
           where owner_type = 'profile' and profile_id = $1
           limit 1`,
          [profile.id]
        );
        results.push({
          profile: profile.name,
          profile_id: profile.id,
          account_id: existing.rows[0]?.id ?? null,
          balance: existing.rows[0]?.balance ?? null,
          status: 'already_exists',
        });
      }
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  console.log(JSON.stringify({
    selectedAppUserId: appUser.id,
    profileCount: profiles.length,
    results,
  }, null, 2));
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
