import { AdminPinSetting } from '@/types/app';
import { isValidAdminPin } from '@/utils/adminLock';
import { createClient } from '@/utils/supabase/client';

const hashAdminPin = async (pin: string, appUserId: string) => {
  const encoded = new TextEncoder().encode(`ace-admin-pin:${appUserId}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const fetchAdminPinSetting = async (
  appUserId: string
): Promise<AdminPinSetting | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('admin_pin_settings')
    .select('*')
    .eq('app_user_id', appUserId)
    .maybeSingle();

  if (error) throw error;
  return data as AdminPinSetting | null;
};

export const saveAdminPin = async (
  appUserId: string,
  pin: string
): Promise<AdminPinSetting> => {
  if (!isValidAdminPin(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }

  const supabase = createClient();
  const pinHash = await hashAdminPin(pin, appUserId);
  const { data, error } = await supabase
    .from('admin_pin_settings')
    .upsert({
      app_user_id: appUserId,
      pin_hash: pinHash,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as AdminPinSetting;
};

export const verifyAdminPin = async (
  appUserId: string,
  pin: string
): Promise<boolean> => {
  if (!isValidAdminPin(pin)) return false;

  const setting = await fetchAdminPinSetting(appUserId);
  if (!setting) return false;

  const pinHash = await hashAdminPin(pin, appUserId);
  return pinHash === setting.pin_hash;
};
