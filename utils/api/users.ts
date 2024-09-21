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