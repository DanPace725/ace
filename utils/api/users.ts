// utils/api/users.ts

import { createClient } from '@/utils/supabase/client';
import { ManagedProfile } from '@/types/app';


export const createManagedProfile = async (name: string, appUserId: string) => {
  const supabase = createClient();
  console.log('Starting createManagedProfile with name:', name, 'and appUserId:', appUserId);
  try {
    const { data, error } = await supabase
      .from('managed_profiles')
      .insert([{ name, app_user_id: appUserId }])
      .select();

    if (error) throw error;
    return data[0] as ManagedProfile;
  } catch (error) {
    console.error('Error in createManagedProfile:', error);
    throw error;
  }
};  

// ... existing imports and functions ...

export const fetchManagedProfiles = async (appUserId: string) => {
  const supabase = createClient();
  console.log('Fetching managed profiles for appUserId:', appUserId);
  try {
    const { data, error } = await supabase
      .from('managed_profiles')
      .select('*')
      .eq('app_user_id', appUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ManagedProfile[];
  } catch (error) {
    console.error('Error in fetchManagedProfiles:', error);
    throw error;
  }
};


export const updateManagedProfile = async (profileId: string, name: string) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('managed_profiles')
      .update({ name })
      .eq('id', profileId)
      .select();

    if (error) throw error;
    return data[0] as ManagedProfile;
  } catch (error) {
    console.error('Error in updateManagedProfile:', error);
    throw error;
  }
};

export const deleteManagedProfile = async (profileId: string) => {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('managed_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
  } catch (error) {
    console.error('Error in deleteManagedProfile:', error);
    throw error;
  }
};