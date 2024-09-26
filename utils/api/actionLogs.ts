import { createClient } from '@/utils/supabase/client';

export const createActionLog = async (actionLog: {
  profile_id: string;
  action_id: string;
  timestamp: string;
  base_xp: number;
  bonus_xp?: number;
}) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('action_logs')
    .insert(actionLog)
    .select()
    .single();

  if (error) throw error;
  return data;
};