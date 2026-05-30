import { createClient } from '@/utils/supabase/client';
import { PendingActionLog, ReviewStatus } from '@/types/app';

interface PendingActionLogInput {
  profile_id: string;
  action_id: string;
  timestamp: string;
  base_xp: number;
  bonus_xp?: number;
}

export const createPendingActionLog = async (actionLog: PendingActionLogInput): Promise<PendingActionLog> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pending_action_logs')
    .insert({
      ...actionLog,
      bonus_xp: actionLog.bonus_xp ?? 0,
    })
    .select('*, managed_profiles(name), actions(name)')
    .single();

  if (error) throw error;
  return data as PendingActionLog;
};

export const fetchPendingActionLogs = async (appUserIds: string | string[]): Promise<PendingActionLog[]> => {
  const supabase = createClient();
  const ids = Array.isArray(appUserIds) ? appUserIds : [appUserIds];
  const query = supabase
    .from('pending_action_logs')
    .select('*, managed_profiles!inner(name, app_user_id), actions(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const { data, error } = ids.length > 1
    ? await query.in('managed_profiles.app_user_id', ids)
    : await query.eq('managed_profiles.app_user_id', ids[0]);

  if (error) throw error;
  return data as PendingActionLog[];
};

export const updatePendingActionLogStatus = async (
  pendingLogId: string,
  status: Exclude<ReviewStatus, 'pending'>,
  reviewedBy: string,
  reviewNote?: string
): Promise<PendingActionLog> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pending_action_logs')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pendingLogId)
    .select('*, managed_profiles(name), actions(name)')
    .single();

  if (error) throw error;
  return data as PendingActionLog;
};
