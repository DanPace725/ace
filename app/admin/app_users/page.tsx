import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileManager from '@/app/components/ProfileManager'

const appUserAuthColumns = ['auth_id', 'auth_user_id'] as const

const findAppUserByAuthId = async (supabase: ReturnType<typeof createClient>, authUserId: string) => {
  for (const column of appUserAuthColumns) {
    const { data, error } = await supabase
      .from('app_users')
      .select('id')
      .eq(column, authUserId)
      .maybeSingle()

    if (!error) {
      return data
    }
  }

  return null
}

export default async function AppUsersPage() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  const appUser = await findAppUserByAuthId(supabase, data.user.id)

  return (
    <ProfileManager
      userId={appUser?.id ?? data.user.id}
      fallbackUserId={data.user.id}
      canCreateProfile={Boolean(appUser)}
    />
  )
}
