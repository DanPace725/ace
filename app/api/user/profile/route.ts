import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

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

export async function GET() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError

    if (!user) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }

    const appUser = await findAppUserByAuthId(supabase, user.id)
    const appUserId = appUser?.id ?? user.id
    const lookupIds = Array.from(new Set([appUserId, user.id]))

    const profilesQuery = supabase
      .from('managed_profiles')
      .select('*')

    const { data: managedProfiles, error: profilesError } = lookupIds.length > 1
      ? await profilesQuery.in('app_user_id', lookupIds)
      : await profilesQuery.eq('app_user_id', lookupIds[0])

    if (profilesError) throw profilesError

    return NextResponse.json({
      authUser: {
        id: user.id,
        email: user.email,
      },
      appUser: appUser ?? { id: user.id, auth_user_id: user.id, auth_id: user.id },
      managedProfiles: managedProfiles ?? [],
    })
  } catch (error) {
    console.error('Error in GET:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Profile editing is not supported for app user records.' },
    { status: 405 }
  )
}
