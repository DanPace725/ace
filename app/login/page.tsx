'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, resetPassword } from '@/utils/api/auth'
import PublicImage from '../components/PublicImage'
import { toast, ToastContainer } from 'react-toastify'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const router = useRouter()
  

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      let response
      if (isResetPassword) {
        response = await resetPassword(email)
      } else if (isLogin) {
        response = await signIn(email, password)
      } else {
        response = await signUp(email, password)
      }
      if (response.error) {
        throw new Error(response.error)
      }

      if (isResetPassword) {
        toast.success('Password reset email sent. Please check your inbox.')
        setIsResetPassword(false)
      } else if (!isLogin) {
        toast.success('Registration successful! Please check your email to verify your account.')
        setIsLogin(true)
      } else {
        // Successful login
        toast.success('Login successful!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg">
        <div className="flex justify-center">
          <PublicImage
            src="logo1.png"
            alt="Logo"
            width={40}
            height={40}
            className="mb-4 rounded-full"
          />
        </div>
        <h3 className="text-2xl font-bold text-center text-white">
          {isResetPassword ? 'Reset Password' : (isLogin ? 'Login to your account' : 'Create a new account')}
        </h3>
        <form onSubmit={handleAuth}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-300" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!isResetPassword && (
              <div className="mt-4">
                <label className="block text-gray-300" htmlFor="password">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  id="password"
                  className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-700 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <button 
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (isResetPassword ? 'Send Reset Email' : (isLogin ? 'Login' : 'Register'))}
              </button>
            </div>
          </div>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <div className="mt-6 text-center">
          {!isResetPassword && (
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-400 hover:underline"
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          )}
          <button
            onClick={() => setIsResetPassword(!isResetPassword)}
            className="text-sm text-blue-400 hover:underline ml-4"
          >
            {isResetPassword ? 'Back to Login' : 'Forgot Password?'}
          </button>
        </div>
      </div>
    </div>
  )
}