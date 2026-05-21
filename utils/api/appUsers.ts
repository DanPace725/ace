import { createClient } from '@/utils/supabase/client'

export interface AppUserIdentity {
  authUserId: string
  appUserId: string
  appUserRecordId: string | null
  lookupIds: string[]
}

const appUserAuthColumns = ['auth_id', 'auth_user_id'] as const

const findAppUserByAuthId = async (supabase: ReturnType<typeof createClient>, authUserId: string) => {
  let lastError: unknown = null

  for (const column of appUserAuthColumns) {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq(column, authUserId)
      .maybeSingle()

    if (!error) {
      return data
    }

    lastError = error
  }

  console.warn('Could not load app user record; falling back to auth user id.', lastError)
  return null
}

export const getCurrentAppUserIdentity = async (): Promise<AppUserIdentity | null> => {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return null

  const appUser = await findAppUserByAuthId(supabase, user.id)
  const appUserRecordId = appUser?.id ?? null
  const appUserId = appUserRecordId ?? user.id
  const lookupIds = Array.from(new Set([appUserId, user.id]))

  return {
    authUserId: user.id,
    appUserId,
    appUserRecordId,
    lookupIds,
  }
}

export const requireCurrentAppUserIdentity = async (): Promise<AppUserIdentity> => {
  const identity = await getCurrentAppUserIdentity()

  if (!identity) {
    throw new Error('No authenticated user')
  }

  if (!identity.appUserRecordId) {
    throw new Error('No app user record found for the authenticated user')
  }

  return {
    ...identity,
    appUserId: identity.appUserRecordId,
  }
}
