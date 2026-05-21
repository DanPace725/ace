import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileManager from '@/app/components/ProfileManager'




export default async function AppUsersPage() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')

  }

  const { data: appUser } = await supabase
    .from('app_users')
    .select('id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle()
    
  return (
    <ProfileManager
      userId={appUser?.id ?? data.user.id}
      fallbackUserId={data.user.id}
      canCreateProfile={Boolean(appUser)}
    />
  )
}
