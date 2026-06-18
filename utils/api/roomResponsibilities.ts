import { createClient } from '@/utils/supabase/client';
import { RoomResponsibilityStatus, RoomResponsibilityWithDetails, RoomState } from '@/types/app';

interface RoomResponsibilityInput {
  app_user_id: string;
  room_id: string;
  assigned_profile_id: string;
  assigned_by?: string | null;
  due_at?: string | null;
  grace_hours: number;
  starting_room_state?: RoomState | null;
  starting_room_balance?: number | null;
}

const normalizeResponsibility = (
  responsibility: RoomResponsibilityWithDetails
): RoomResponsibilityWithDetails => ({
  ...responsibility,
  grace_hours: Number(responsibility.grace_hours),
  starting_room_balance: responsibility.starting_room_balance === null
    ? null
    : Number(responsibility.starting_room_balance),
});

export const fetchRoomResponsibilities = async (
  appUserIds: string | string[]
): Promise<RoomResponsibilityWithDetails[]> => {
  const supabase = createClient();
  const ids = Array.isArray(appUserIds) ? appUserIds : [appUserIds];
  const query = supabase
    .from('room_responsibilities')
    .select(`
      *,
      rooms (
        name,
        state,
        is_shared
      ),
      managed_profiles (
        name
      )
    `)
    .order('created_at', { ascending: false });

  const { data, error } = ids.length > 1
    ? await query.in('app_user_id', ids)
    : await query.eq('app_user_id', ids[0]);

  if (error) throw error;
  return ((data ?? []) as RoomResponsibilityWithDetails[]).map(normalizeResponsibility);
};

export const createRoomResponsibility = async (
  responsibility: RoomResponsibilityInput
): Promise<RoomResponsibilityWithDetails> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('room_responsibilities')
    .insert({
      app_user_id: responsibility.app_user_id,
      room_id: responsibility.room_id,
      assigned_profile_id: responsibility.assigned_profile_id,
      assigned_by: responsibility.assigned_by ?? null,
      due_at: responsibility.due_at ?? null,
      grace_hours: responsibility.grace_hours,
      starting_room_state: responsibility.starting_room_state ?? null,
      starting_room_balance: responsibility.starting_room_balance ?? null,
    })
    .select(`
      *,
      rooms (
        name,
        state,
        is_shared
      ),
      managed_profiles (
        name
      )
    `)
    .single();

  if (error) throw error;
  return normalizeResponsibility(data as RoomResponsibilityWithDetails);
};

export const updateRoomResponsibilityStatus = async (
  responsibilityId: string,
  status: RoomResponsibilityStatus
): Promise<RoomResponsibilityWithDetails> => {
  const supabase = createClient();
  const shouldStampReview = ['approved', 'denied', 'rescued', 'cancelled'].includes(status);
  const { data, error } = await supabase
    .from('room_responsibilities')
    .update({
      status,
      reviewed_at: shouldStampReview ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', responsibilityId)
    .select(`
      *,
      rooms (
        name,
        state,
        is_shared
      ),
      managed_profiles (
        name
      )
    `)
    .single();

  if (error) throw error;
  return normalizeResponsibility(data as RoomResponsibilityWithDetails);
};
