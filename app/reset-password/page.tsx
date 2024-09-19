'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handlePasswordReset = async () => {
      const accessToken = new URL(window.location.href).searchParams.get('access_token')
      if (accessToken) {
        const { error } = await supabase.auth.exchangeCodeForSession(accessToken)
        if (error) {
          toast.error('Invalid or expired reset link. Please request a new password reset.')
        }
      } else {
        toast.error('No reset token found. Please request a new password reset.')
      }
    }

    handlePasswordReset()
  }, [supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      toast.success('Password updated successfully. Redirecting to login...')
      setTimeout(() => router.push('/login'), 3000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-white">Reset Your Password</h3>
        
        <form onSubmit={handleResetPassword}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-300" htmlFor="password">New Password</label>
              <input
                type="password"
                placeholder="New Password"
                id="password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-300" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm New Password"
                id="confirmPassword"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-700 text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button 
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}