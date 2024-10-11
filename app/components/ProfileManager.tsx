'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createManagedProfile, fetchManagedProfiles, updateManagedProfile, deleteManagedProfile } from '@/utils/api/users'
import { ManagedProfile } from '@/types/app'

interface ProfileManagerProps {
  userId: string
}

const ProfileManager = ({ userId }: ProfileManagerProps) => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [editingProfile, setEditingProfile] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadProfiles()
  }, [userId])

  const loadProfiles = async () => {
    try {
      const fetchedProfiles = await fetchManagedProfiles(userId)
      setProfiles(fetchedProfiles)
    } catch (error) {
      toast.error('Failed to load profiles')
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newProfile = await createManagedProfile(name, userId)
      setProfiles([newProfile, ...profiles])
      setName('')
      toast.success('Profile created successfully')
    } catch (error) {
      toast.error('Failed to create profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (profileId: string, newName: string) => {
    try {
      await updateManagedProfile(profileId, newName)
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, name: newName } : p))
      setEditingProfile(null)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    }
  }

  const handleDelete = async (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteManagedProfile(profileId)
        setProfiles(profiles.filter(p => p.id !== profileId))
        toast.success('Profile deleted successfully')
      } catch (error) {
        toast.error('Failed to delete profile')
        console.error(error)
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Profiles</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">Profile Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>

        <h2 className="text-2xl font-bold text-white mb-4">Your Profiles</h2>
        {profiles.length > 0 ? (
          <ul className="space-y-2">
            {profiles.map((profile) => (
              <li key={profile.id} className="bg-gray-700 p-3 rounded-md">
                {editingProfile === profile.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfiles(profiles.map(p => p.id === profile.id ? { ...p, name: e.target.value } : p))}
                      className="flex-grow bg-gray-600 text-white p-1 rounded-md"
                    />
                    <button
                      onClick={() => handleEdit(profile.id, profile.name)}
                      className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingProfile(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{profile.name}</span>
                    <div>
                      <button
                        onClick={() => setEditingProfile(profile.id)}
                        className="text-blue-400 hover:text-blue-500 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No profiles created yet.</p>
        )}
      </div>
    </div>
  )
}

export default ProfileManager