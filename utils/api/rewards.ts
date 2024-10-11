import { createClient } from '@/utils/supabase/client';
import { Reward } from '@/types/app';

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