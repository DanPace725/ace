import { createClient } from '@/utils/supabase/client';
import {
  CreditAccount,
  CreditEvent,
  CreditEventType,
  CreditOwnerType,
  ManagedProfile,
  ProfileWithAccount,
  Room,
  RoomState,
  RoomWithAccount,
} from '@/types/app';
import { calculateProjectedRoomBalance, economyRates } from '@/utils/economyConfig';

interface CreditAccountInput {
  app_user_id: string;
  owner_type: CreditOwnerType;
  profile_id?: string | null;
  room_id?: string | null;
}

interface RoomInput {
  app_user_id: string;
  name: string;
  state: RoomState;
  is_shared: boolean;
  assigned_profile_id?: string | null;
}

interface CreditEventInput {
  app_user_id: string;
  account_id: string;
  event_type: CreditEventType;
  amount: number;
  source_type?: string | null;
  source_id?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
  created_by?: string | null;
}

interface CreditAdjustmentInput {
  room: RoomWithAccount;
  amount: number;
  note?: string | null;
  created_by?: string | null;
}

interface ProfileCreditAdjustmentInput {
  app_user_id: string;
  profile: ProfileWithAccount | ManagedProfile;
  amount: number;
  note?: string | null;
  created_by?: string | null;
}

interface ProfileTaskCreditInput {
  app_user_id: string;
  profile_id: string;
  action_id: string;
  action_log_id?: string | null;
  base_xp: number;
  bonus_xp?: number | null;
  created_by?: string | null;
}

interface ProfileDividendTarget {
  profile: ManagedProfile;
  account: CreditAccount;
}

export interface RoomCreditTimelinePoint {
  timestamp: string;
  balance: number;
  event_type: CreditEventType | 'initial' | 'projected';
}

export interface RoomCreditTimeline {
  room: RoomWithAccount;
  points: RoomCreditTimelinePoint[];
}

const normalizeCreditAccount = (account: CreditAccount): CreditAccount => ({
  ...account,
  balance: Number(account.balance),
});

const normalizeRoomWithAccount = (room: Room, accounts: CreditAccount[]): RoomWithAccount => ({
  ...room,
  credit_account: accounts.find((account) => account.room_id === room.id) ?? null,
});

const normalizeProfileWithAccount = (
  profile: ManagedProfile,
  accounts: CreditAccount[]
): ProfileWithAccount => ({
  ...profile,
  credit_account: accounts.find((account) => account.profile_id === profile.id) ?? null,
});

const minimumLedgerAmount = 0.0001;
const floorLedgerAmount = (value: number) => Math.floor(value * 10000) / 10000;
const roundLedgerAmount = (value: number) => Number(value.toFixed(4));

export const getProjectedRoomCredit = (room: RoomWithAccount, now?: Date) => calculateProjectedRoomBalance({
  balance: room.credit_account?.balance,
  state: room.state,
  lastSettledAt: room.credit_account?.last_settled_at,
  now,
});

export const ensureCreditAccount = async (input: CreditAccountInput): Promise<CreditAccount> => {
  const supabase = createClient();
  let query = supabase
    .from('credit_accounts')
    .select('*')
    .eq('app_user_id', input.app_user_id)
    .eq('owner_type', input.owner_type);

  if (input.owner_type === 'profile' && input.profile_id) {
    query = query.eq('profile_id', input.profile_id);
  }

  if (input.owner_type === 'room' && input.room_id) {
    query = query.eq('room_id', input.room_id);
  }

  const { data: existingAccount, error: existingError } = await query.maybeSingle();
  if (existingError) throw existingError;
  if (existingAccount) return normalizeCreditAccount(existingAccount as CreditAccount);

  const { data, error } = await supabase
    .from('credit_accounts')
    .insert({
      app_user_id: input.app_user_id,
      owner_type: input.owner_type,
      profile_id: input.profile_id ?? null,
      room_id: input.room_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return normalizeCreditAccount(data as CreditAccount);
};

export const ensureProfileCreditAccount = async (
  appUserId: string,
  profileId: string
): Promise<CreditAccount> => ensureCreditAccount({
  app_user_id: appUserId,
  owner_type: 'profile',
  profile_id: profileId,
});

export const ensureProfileCreditAccounts = async (
  appUserId: string,
  profileIds: string[]
): Promise<CreditAccount[]> => {
  const uniqueProfileIds = Array.from(new Set(profileIds)).filter(Boolean);
  const accounts: CreditAccount[] = [];

  for (const profileId of uniqueProfileIds) {
    accounts.push(await ensureProfileCreditAccount(appUserId, profileId));
  }

  return accounts;
};

export const fetchCreditAccountsForProfiles = async (profileIds: string[]): Promise<CreditAccount[]> => {
  const supabase = createClient();
  const ids = Array.from(new Set(profileIds)).filter(Boolean);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('credit_accounts')
    .select('*')
    .eq('owner_type', 'profile')
    .in('profile_id', ids);

  if (error) throw error;
  return (data ?? []).map((account) => normalizeCreditAccount(account as CreditAccount));
};

export const fetchProfilesWithCreditAccounts = async (appUserIds: string | string[]): Promise<ProfileWithAccount[]> => {
  const supabase = createClient();
  const ids = Array.isArray(appUserIds) ? appUserIds : [appUserIds];
  const query = supabase
    .from('managed_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: profiles, error } = ids.length > 1
    ? await query.in('app_user_id', ids)
    : await query.eq('app_user_id', ids[0]);

  if (error) throw error;
  if (!profiles?.length) return [];

  const accounts = await fetchCreditAccountsForProfiles(profiles.map((profile) => profile.id));
  return (profiles as ManagedProfile[]).map((profile) => normalizeProfileWithAccount(profile, accounts));
};

const fetchProfileDividendTargets = async (appUserId: string): Promise<ProfileDividendTarget[]> => {
  const supabase = createClient();
  const { data: accountRows, error: accountsError } = await supabase
    .from('credit_accounts')
    .select('*')
    .eq('app_user_id', appUserId)
    .eq('owner_type', 'profile')
    .not('profile_id', 'is', null);

  if (accountsError) throw accountsError;

  const accounts = (accountRows ?? []).map((account) => normalizeCreditAccount(account as CreditAccount));
  const profileIds = accounts
    .map((account) => account.profile_id)
    .filter((profileId): profileId is string => Boolean(profileId));

  if (profileIds.length === 0) {
    const profiles = await fetchProfilesWithCreditAccounts(appUserId);
    if (profiles.length === 0) return [];

    const createdAccounts = await ensureProfileCreditAccounts(appUserId, profiles.map((profile) => profile.id));
    return profiles.map((profile) => ({
      profile,
      account: createdAccounts.find((account) => account.profile_id === profile.id) as CreditAccount,
    })).filter((target) => Boolean(target.account));
  }

  const { data: profileRows, error: profilesError } = await supabase
    .from('managed_profiles')
    .select('*')
    .in('id', profileIds);

  if (profilesError) throw profilesError;

  const profilesById = ((profileRows ?? []) as ManagedProfile[]).reduce<Record<string, ManagedProfile>>((lookup, profile) => {
    lookup[profile.id] = profile;
    return lookup;
  }, {});

  return accounts
    .map((account) => {
      const profile = account.profile_id ? profilesById[account.profile_id] : null;
      return profile ? { profile, account } : null;
    })
    .filter((target): target is ProfileDividendTarget => Boolean(target));
};

export const fetchRooms = async (appUserIds: string | string[]): Promise<RoomWithAccount[]> => {
  const supabase = createClient();
  const ids = Array.isArray(appUserIds) ? appUserIds : [appUserIds];
  const roomQuery = supabase
    .from('rooms')
    .select('*')
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  const { data: rooms, error: roomsError } = ids.length > 1
    ? await roomQuery.in('app_user_id', ids)
    : await roomQuery.eq('app_user_id', ids[0]);

  if (roomsError) throw roomsError;
  if (!rooms?.length) return [];

  const roomIds = rooms.map((room) => room.id);
  const { data: accounts, error: accountsError } = await supabase
    .from('credit_accounts')
    .select('*')
    .eq('owner_type', 'room')
    .in('room_id', roomIds);

  if (accountsError) throw accountsError;
  const normalizedAccounts = (accounts ?? []).map((account) => normalizeCreditAccount(account as CreditAccount));

  return (rooms as Room[]).map((room) => normalizeRoomWithAccount(room, normalizedAccounts));
};

export const fetchRoomCreditTimelines = async (appUserIds: string | string[]): Promise<RoomCreditTimeline[]> => {
  const supabase = createClient();
  const rooms = await fetchRooms(appUserIds);
  const accounts = rooms
    .map((room) => room.credit_account)
    .filter((account): account is CreditAccount => Boolean(account));

  if (accounts.length === 0) {
    return rooms.map((room) => ({
      room,
      points: [{
        timestamp: room.created_at,
        balance: 0,
        event_type: 'initial',
      }],
    }));
  }

  const accountIds = accounts.map((account) => account.id);
  const { data, error } = await supabase
    .from('credit_events')
    .select('account_id, event_type, balance_after, created_at')
    .in('account_id', accountIds)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const eventsByAccountId = (data ?? []).reduce<Record<string, RoomCreditTimelinePoint[]>>((lookup, event) => {
    const accountId = String(event.account_id);
    lookup[accountId] = lookup[accountId] ?? [];
    lookup[accountId].push({
      timestamp: String(event.created_at),
      balance: Number(event.balance_after ?? 0),
      event_type: event.event_type as CreditEventType,
    });
    return lookup;
  }, {});

  return rooms.map((room) => {
    const account = room.credit_account;
    const projected = getProjectedRoomCredit(room);
    const initialTimestamp = account?.created_at ?? room.created_at;
    const eventPoints = account ? eventsByAccountId[account.id] ?? [] : [];

    return {
      room,
      points: [
        {
          timestamp: initialTimestamp,
          balance: 0,
          event_type: 'initial',
        },
        ...eventPoints,
        {
          timestamp: new Date().toISOString(),
          balance: projected.balance,
          event_type: 'projected',
        },
      ],
    };
  });
};

export const createRoom = async (room: RoomInput): Promise<RoomWithAccount> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      ...room,
      assigned_profile_id: room.assigned_profile_id || null,
    })
    .select()
    .single();

  if (error) throw error;

  const createdRoom = data as Room;
  const creditAccount = await ensureCreditAccount({
    app_user_id: createdRoom.app_user_id,
    owner_type: 'room',
    room_id: createdRoom.id,
  });

  return {
    ...createdRoom,
    credit_account: creditAccount,
  };
};

export const updateRoom = async (
  room: RoomWithAccount,
  updates: Pick<RoomInput, 'name' | 'state' | 'is_shared' | 'assigned_profile_id'>,
  changedBy: string
): Promise<Room> => {
  const supabase = createClient();
  const stateChanged = updates.state !== room.state;

  if (stateChanged && room.credit_account) {
    await settleRoomCredits(room, changedBy);
  }

  const { data, error } = await supabase
    .from('rooms')
    .update({
      name: updates.name,
      state: updates.state,
      is_shared: updates.is_shared,
      assigned_profile_id: updates.assigned_profile_id || null,
      state_changed_at: stateChanged ? new Date().toISOString() : room.state_changed_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', room.id)
    .select()
    .single();

  if (error) throw error;

  if (stateChanged) {
    const { error: stateEventError } = await supabase
      .from('room_state_events')
      .insert({
        room_id: room.id,
        from_state: room.state,
        to_state: updates.state,
        changed_by: changedBy,
      });

    if (stateEventError) throw stateEventError;
  }

  return data as Room;
};

export const archiveRoom = async (roomId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('rooms')
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (error) throw error;
};

export const createCreditEvent = async (event: CreditEventInput): Promise<CreditEvent> => {
  const supabase = createClient();
  const { data: account, error: accountError } = await supabase
    .from('credit_accounts')
    .select('*')
    .eq('id', event.account_id)
    .single();

  if (accountError) throw accountError;

  const currentBalance = Number((account as CreditAccount).balance);
  const balanceAfter = Math.max(currentBalance + event.amount, 0);

  const { data, error } = await supabase
    .from('credit_events')
    .insert({
      app_user_id: event.app_user_id,
      account_id: event.account_id,
      event_type: event.event_type,
      amount: event.amount,
      balance_after: balanceAfter,
      source_type: event.source_type ?? null,
      source_id: event.source_id ?? null,
      note: event.note ?? null,
      metadata: event.metadata ?? {},
      created_by: event.created_by ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: updateError } = await supabase
    .from('credit_accounts')
    .update({
      balance: balanceAfter,
      last_settled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', event.account_id);

  if (updateError) throw updateError;
  return data as CreditEvent;
};

export const adjustProfileCredits = async ({
  app_user_id,
  profile,
  amount,
  note,
  created_by,
}: ProfileCreditAdjustmentInput): Promise<CreditEvent> => {
  const profileWithAccount = profile as ProfileWithAccount;
  const account = profileWithAccount.credit_account ?? await ensureProfileCreditAccount(app_user_id, profile.id);

  return createCreditEvent({
    app_user_id,
    account_id: account.id,
    event_type: 'admin_adjustment',
    amount,
    source_type: 'profile',
    source_id: profile.id,
    note: note || null,
    metadata: {
      profile_name: profile.name,
    },
    created_by,
  });
};

export const calculateProfileTaskCredits = (baseXp: number, bonusXp = 0) => {
  const totalXp = Math.max(Number(baseXp) + Number(bonusXp || 0), 0);
  return Number((totalXp * economyRates.profile.taskCreditPerXp).toFixed(2));
};

export const awardProfileTaskCredits = async ({
  app_user_id,
  profile_id,
  action_id,
  action_log_id,
  base_xp,
  bonus_xp,
  created_by,
}: ProfileTaskCreditInput): Promise<CreditEvent | null> => {
  const amount = calculateProfileTaskCredits(base_xp, bonus_xp ?? 0);
  if (amount <= 0) return null;

  const account = await ensureProfileCreditAccount(app_user_id, profile_id);
  const supabase = createClient();

  if (action_log_id) {
    const { data: existingEvent, error: existingEventError } = await supabase
      .from('credit_events')
      .select('*')
      .eq('account_id', account.id)
      .eq('event_type', 'task_reward')
      .eq('source_type', 'action_log')
      .eq('source_id', action_log_id)
      .maybeSingle();

    if (existingEventError) throw existingEventError;
    if (existingEvent) return existingEvent as CreditEvent;
  }

  return createCreditEvent({
    app_user_id,
    account_id: account.id,
    event_type: 'task_reward',
    amount,
    source_type: action_log_id ? 'action_log' : 'action',
    source_id: action_log_id ?? action_id,
    note: 'Task reward credits',
    metadata: {
      profile_id,
      action_id,
      action_log_id: action_log_id ?? null,
      base_xp,
      bonus_xp: bonus_xp ?? 0,
      credit_per_xp: economyRates.profile.taskCreditPerXp,
    },
    created_by,
  });
};

export const adjustRoomCredits = async ({
  room,
  amount,
  note,
  created_by,
}: CreditAdjustmentInput): Promise<CreditEvent> => {
  let account = room.credit_account ?? await ensureCreditAccount({
    app_user_id: room.app_user_id,
    owner_type: 'room',
    room_id: room.id,
  });

  await settleRoomCredits({ ...room, credit_account: account }, created_by);

  account = await ensureCreditAccount({
    app_user_id: room.app_user_id,
    owner_type: 'room',
    room_id: room.id,
  });

  return createCreditEvent({
    app_user_id: room.app_user_id,
    account_id: account.id,
    event_type: 'admin_adjustment',
    amount,
    source_type: 'room',
    source_id: room.id,
    note: note || null,
    metadata: {
      room_name: room.name,
      room_state: room.state,
    },
    created_by,
  });
};

export const settleSharedRoomDividend = async (
  room: RoomWithAccount,
  settledEvent: CreditEvent,
  createdBy?: string | null
): Promise<CreditEvent[]> => {
  if (!room.is_shared || settledEvent.amount <= 0) return [];

  const roomAccountId = room.credit_account?.id ?? settledEvent.account_id;
  const dividendTargets = await fetchProfileDividendTargets(room.app_user_id);
  if (dividendTargets.length === 0) return [];

  const supabase = createClient();
  const { data: existingEvents, error: existingEventsError } = await supabase
    .from('credit_events')
    .select('id')
    .eq('event_type', 'house_dividend')
    .eq('source_type', 'room_settlement')
    .eq('source_id', settledEvent.id)
    .limit(1);

  if (existingEventsError) throw existingEventsError;
  if ((existingEvents ?? []).length > 0) return [];

  const totalDividend = roundLedgerAmount(settledEvent.amount * economyRates.house.dividendRate);
  const perProfileDividend = floorLedgerAmount(totalDividend / dividendTargets.length);
  if (perProfileDividend < minimumLedgerAmount) return [];

  const distributedAmount = roundLedgerAmount(perProfileDividend * dividendTargets.length);
  if (distributedAmount < minimumLedgerAmount) return [];

  const sharedMetadata = {
    room_id: room.id,
    room_name: room.name,
    settled_event_id: settledEvent.id,
    settlement_amount: settledEvent.amount,
    dividend_rate: economyRates.house.dividendRate,
    profile_count: dividendTargets.length,
    per_profile_dividend: perProfileDividend,
    distributed_amount: distributedAmount,
  };

  const events: CreditEvent[] = [];
  events.push(await createCreditEvent({
    app_user_id: room.app_user_id,
    account_id: roomAccountId,
    event_type: 'house_dividend',
    amount: -distributedAmount,
    source_type: 'room_settlement',
    source_id: settledEvent.id,
    note: `Shared room dividend paid from ${room.name}`,
    metadata: {
      ...sharedMetadata,
      direction: 'room_debit',
    },
    created_by: createdBy,
  }));

  for (const target of dividendTargets) {
    events.push(await createCreditEvent({
      app_user_id: room.app_user_id,
      account_id: target.account.id,
      event_type: 'house_dividend',
      amount: perProfileDividend,
      source_type: 'room_settlement',
      source_id: settledEvent.id,
      note: `Shared room dividend from ${room.name}`,
      metadata: {
        ...sharedMetadata,
        direction: 'profile_credit',
        profile_id: target.profile.id,
        profile_name: target.profile.name,
      },
      created_by: createdBy,
    }));
  }

  return events;
};

export const settleRoomCredits = async (
  room: RoomWithAccount,
  createdBy?: string | null
): Promise<CreditEvent | null> => {
  const account = room.credit_account;
  if (!account) return null;

  const projection = getProjectedRoomCredit(room);
  const amount = Number(projection.delta.toFixed(4));

  if (Math.abs(amount) < 0.0001) {
    return null;
  }

  const settledEvent = await createCreditEvent({
    app_user_id: room.app_user_id,
    account_id: account.id,
    event_type: amount >= 0 ? 'maintenance_interest' : 'messiness_tax',
    amount,
    source_type: 'room',
    source_id: room.id,
    note: `Settled ${room.state} room projection`,
    metadata: {
      room_name: room.name,
      room_state: room.state,
      elapsed_hours: projection.elapsedHours,
      hourly_rate: projection.rate,
      projected_balance: projection.balance,
    },
    created_by: createdBy,
  });

  await settleSharedRoomDividend(room, settledEvent, createdBy);
  return settledEvent;
};
