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

export const fetchProfileData = async (profileId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('managed_profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) throw error;
  return data as ManagedProfile;
};

export const fetchRecentTasks = async (profileId: string, limit = 5): Promise<RecentTask[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('action_logs')
      .select('*, actions(name)')
      .eq('profile_id', profileId)
      .order('timestamp', { ascending: false })
      .limit(limit);
  
    if (error) throw error;
    return data as RecentTask[];
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