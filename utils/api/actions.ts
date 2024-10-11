import { createClient } from '@/utils/supabase/client';
import { Action } from '@/types/app';

export const fetchActions = async (userId: string): Promise<Action[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('app_user_id', userId);

  if (error) throw error;
  return data as Action[];
};

export const createAction = async (action: Omit<Action, 'id' | 'created_at' | 'updated_at'>): Promise<Action> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('actions')
    .insert(action)
    .select()
    .single();

  if (error) throw error;
  return data as Action;
};

export const updateAction = async (id: string, updates: Partial<Action>): Promise<Action> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('actions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Action;
};

export const deleteAction = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('actions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};