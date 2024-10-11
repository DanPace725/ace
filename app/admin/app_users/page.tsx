import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileManager from '@/app/components/ProfileManager'




export default async function AppUsersPage() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')

  }
    
  return <ProfileManager userId={data.user.id} />
}