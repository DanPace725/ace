import { createClient } from '@/utils/supabase/client';
import { ManagedProfile, RecentTask, EarnedReward } from '@/types/app';

export const fetchManagedProfiles = async (appUserId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('managed_profiles')
    .select('*')
    .eq('app_user_id', appUserId);

  if (error) throw error;
  return data as ManagedProfile[];
};

export const fetchProfileData = async (profileId: string): Promise<ManagedProfile> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('managed_profiles')
    .select('*, app_users(id)')
    .eq('id', profileId)
    .single();

  if (error) throw error;
  return {
    ...data,
    app_user_id: data.app_users.id
  } as ManagedProfile;
};


export const fetchRecentTasks = async (profileId: string, limit = 5): Promise<RecentTask[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('action_logs')
    .select(`
      id,
      timestamp,
      bonus_xp,
      actions (
        id,
        name,
        base_xp
      )
    `)
    .eq('profile_id', profileId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(task => ({
    id: task.id,
  actions: {
    name: task.actions.name,
  },
  base_xp: task.actions.base_xp,
  bonus_xp: task.bonus_xp,
  timestamp: task.timestamp
  })) as RecentTask[];
};

  export const fetchEarnedRewards = async (profileId: string, limit = 5): Promise<EarnedReward[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profile_rewards')
      .select('*, rewards(name)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);
  
    if (error) throw error;
    return data as EarnedReward[];
  };