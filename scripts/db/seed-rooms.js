const { resolveAppUser, withDb } = require('./db-client');

const standardRooms = [
  { name: 'LR', state: 'clean', is_shared: true },
  { name: 'DR', state: 'needs_attention', is_shared: true },
  { name: 'Bathroom', state: 'messy', is_shared: true },
  { name: 'Bedroom', state: 'critical', is_shared: false },
];

const syncExisting = process.argv.includes('--sync');

withDb(async (client) => {
  const { appUser, profiles } = await resolveAppUser(client);
  const results = [];

  await client.query('begin');
  try {
    for (let index = 0; index < standardRooms.length; index += 1) {
      const seed = standardRooms[index];
      const assignedProfileId = profiles[index % Math.max(profiles.length, 1)]?.id ?? null;
      const { rows } = await client.query(
        `select id, name, state, is_shared, assigned_profile_id
         from rooms
         where app_user_id = $1 and lower(name) = lower($2) and archived_at is null
         order by created_at asc
         limit 1`,
        [appUser.id, seed.name]
      );

      let room = rows[0];
      let status = 'already_exists';

      if (!room) {
        const inserted = await client.query(
          `insert into rooms (app_user_id, name, state, is_shared, assigned_profile_id)
           values ($1, $2, $3, $4, $5)
           returning id, name, state, is_shared, assigned_profile_id`,
          [appUser.id, seed.name, seed.state, seed.is_shared, assignedProfileId]
        );
        room = inserted.rows[0];
        status = 'created';
      } else if (syncExisting) {
        const updated = await client.query(
          `update rooms
           set state = $1,
               is_shared = $2,
               assigned_profile_id = $3,
               updated_at = current_timestamp
           where id = $4
           returning id, name, state, is_shared, assigned_profile_id`,
          [seed.state, seed.is_shared, assignedProfileId, room.id]
        );
        room = updated.rows[0];
        status = 'synced';
      }

      await client.query(
        `insert into credit_accounts (app_user_id, owner_type, room_id)
         values ($1, 'room', $2)
         on conflict do nothing`,
        [appUser.id, room.id]
      );

      results.push({ ...room, status });
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  const { rows: summary } = await client.query(
    `select r.name,
            r.state,
            r.is_shared,
            mp.name as assigned_profile,
            ca.balance::text as balance
     from rooms r
     left join managed_profiles mp on mp.id = r.assigned_profile_id
     left join credit_accounts ca on ca.room_id = r.id and ca.owner_type = 'room'
     where r.app_user_id = $1 and r.archived_at is null
     order by case r.name
       when 'LR' then 1
       when 'DR' then 2
       when 'Bathroom' then 3
       when 'Bedroom' then 4
       else 5
     end, r.name`,
    [appUser.id]
  );

  console.log(JSON.stringify({
    selectedAppUserId: appUser.id,
    profileCount: profiles.length,
    seedResults: results,
    rooms: summary,
  }, null, 2));
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
