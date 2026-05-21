import { createClient } from '@/utils/supabase/client'

export interface AppUserIdentity {
  authUserId: string
  appUserId: string
  lookupIds: string[]
}

export const getCurrentAppUserIdentity = async (): Promise<AppUserIdentity | null> => {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return null

  const { data: appUser, error: appUserError } = await supabase
    .from('app_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (appUserError) {
    console.warn('Could not load app user record; falling back to auth user id.', appUserError)
  }

  const appUserId = appUser?.id ?? user.id
  const lookupIds = Array.from(new Set([appUserId, user.id]))

  return {
    authUserId: user.id,
    appUserId,
    lookupIds,
  }
}
