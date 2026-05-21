'use client'

import { useEffect, useState } from 'react'
import { getUserProfile, UserProfile } from '@/utils/api/auth'
import { toast } from 'react-toastify'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">Profile</h1>

        <div className="space-y-2 mb-6">
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
      </div>
    </div>
  )
}
