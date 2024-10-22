import { createClient } from '@/utils/supabase/client';
import { Reward, EarnedReward } from '@/types/app';

export const fetchRewards = async (): Promise<Reward[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rewards')
    .select('*');

  if (error) throw error;
  return data as Reward[];
};

export const createReward = async (reward: Omit<Reward, 'id' | 'created_at' | 'updated_at'>): Promise<Reward> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rewards')
    .insert(reward)
    .select()
    .single();

  if (error) throw error;
  return data as Reward;
};

export const updateReward = async (id: string, updates: Partial<Reward>): Promise<Reward> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rewards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Reward;
};

export const deleteReward = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const earnReward = async (profileId: string, rewardId: string): Promise<EarnedReward> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profile_rewards')
    .insert({ profile_id: profileId, reward_id: rewardId })
    .select('*, rewards(name)')
    .single();

  if (error) throw error;
  return data as EarnedReward;
};

export const claimReward = async (profileId: string, rewardId: string): Promise<EarnedReward> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profile_rewards')
    .update({ is_claimed: true })
    .eq('profile_id', profileId)
    .eq('reward_id', rewardId)
    .select('*, rewards(name)')
    .single();

  if (error) throw error;
  return data as EarnedReward;
};

export const fetchUnclaimedRewards = async (profileId: string): Promise<EarnedReward[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profile_rewards')
    .select('*, rewards(*)')
    .eq('profile_id', profileId)
    .eq('is_claimed', false);

  if (error) throw error;
  return data as EarnedReward[];
};

export const fetchClaimedRewards = async (profileId: string, limit = 5): Promise<EarnedReward[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profile_rewards')
    .select('*, rewards(*)')
    .eq('profile_id', profileId)
    .eq('is_claimed', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as EarnedReward[];
};


export const fetchLevelReward = async (level: number): Promise<Reward | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('level_rewards')
    .select('*, rewards(*)')
    .eq('level_number', level)
    .single();

  if (error) throw error;
  return data ? data.rewards as Reward : null;
};

export const fetchRandomReward = async (): Promise<Reward | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('type', 'Random')
    .order('RANDOM()')
    .limit(1)
    .single();

  if (error) throw error;
  return data as Reward | null;
};