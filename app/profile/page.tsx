'use client'

import { useState, useEffect } from 'react'
import { getUserProfile, updateUserProfile, UserProfile } from '@/utils/api/auth'
import { toast, ToastContainer } from 'react-toastify'


interface User {
    username: string;
    role: string;
    xp: number;
    level: number;
  }

  interface ApiResponse {
    user: User | null;
    error?: string;
  }
  
  export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [updatedUser, setUpdatedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    try{
        const { user, error }: ApiResponse = await getUserProfile()
        if (error) {
            toast.error(error)
        } else if (user) {
        setUser(user)
        setUpdatedUser(user)
    } else {
        toast.error('No user data available')
    } 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
    toast.error('Failed to fetch user data')
}
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updatedUser) return
    setIsLoading(true)
    const { user: updatedUserData, error }: ApiResponse = await updateUserProfile({username: updatedUser.username})
    if (error) {
      toast.error(error)
    } else {
      setUser(updatedUserData)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="text-white">Loading...</div>
  }
  if (!user) {
    return <div className="text-white">No user data available.</div>
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">User Profile</h1>
        {isEditing && updatedUser ? (
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={updatedUser.username}
                onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
              <input
                type="role"
                id="role"
                value={updatedUser.role}
                onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </form>
        ) :  (
          <div>
            <p className="text-white mb-2">Username: {user.username}</p>
            <p className="text-white mb-2">Role: {user.role}</p>
            <p className="text-white mb-2">XP: {user.xp}</p>
            <p className="text-white mb-4">Level: {user.level}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}