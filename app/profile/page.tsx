'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserProfile, UserProfile } from '@/utils/api/auth'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-toastify'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        const { user, error } = await getUserProfile()
        if (error) {
          toast.error(error)
        } else if (user) {
          setProfile(user)
        } else {
          toast.error('No user data available')
        }
      } catch {
        toast.error('Failed to fetch user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (isLoading) {
    return <div className="text-white">Loading...</div>
  }

  if (!profile) {
    return <div className="text-white">No user data available.</div>
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
      console.error(error)
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-md bg-gray-800 p-5 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">Profile</h1>

        <div className="space-y-2 mb-6">
          {profile.authUser?.email && (
            <p className="text-white">
              Email: <span className="text-gray-300 break-all">{profile.authUser.email}</span>
            </p>
          )}
          <p className="text-white">
            Account ID: <span className="text-gray-300 break-all">{profile.appUser.id}</span>
          </p>
          <p className="text-white">
            Managed Profiles: <span className="text-gray-300">{profile.managedProfiles.length}</span>
          </p>
        </div>

        <div className="space-y-3">
          {profile.managedProfiles.length > 0 ? (
            profile.managedProfiles.map((managedProfile) => (
              <div key={managedProfile.id} className="bg-gray-700 rounded-md p-3">
                <p className="font-medium text-white">{managedProfile.name}</p>
                <p className="text-sm text-gray-300">
                  Level {managedProfile.level ?? 1} - {managedProfile.xp ?? 0} XP
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-300">No managed profiles yet.</p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            onClick={() => router.push('/admin')}
            className="w-full rounded-md bg-gray-700 p-3 font-medium text-white hover:bg-gray-600"
          >
            Admin
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-gray-700 p-3 font-medium text-white hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
