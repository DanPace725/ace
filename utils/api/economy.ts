import { createClient } from '@/utils/supabase/client';
import {
  CreditAccount,
  CreditEvent,
  CreditEventType,
  CreditOwnerType,
  Room,
  RoomState,
  RoomWithAccount,
} from '@/types/app';
import { calculateProjectedRoomBalance } from '@/utils/economyConfig';

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

const normalizeCreditAccount = (account: CreditAccount): CreditAccount => ({
  ...account,
  balance: Number(account.balance),
});

const normalizeRoomWithAccount = (room: Room, accounts: CreditAccount[]): RoomWithAccount => ({
  ...room,
  credit_account: accounts.find((account) => account.room_id === room.id) ?? null,
});

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

  return createCreditEvent({
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
};
