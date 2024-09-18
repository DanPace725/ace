'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/utils/api/auth'
import PublicImage from '../components/PublicImage'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      let response
      if (isLogin) {
        response = await signIn(email, password)
      } else {
        response = await signUp(email, password)
      }

      if (response.error) {
        throw new Error(response.error)
      }

      // Successful login/signup
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg">
        <div className="flex justify-center">
          <PublicImage
            src="logo1.png"
            alt="Logo"
            width={64}
            height={64}
            className="mb-4 rounded-full"
          />
        </div>
        <h3 className="text-2xl font-bold text-center text-white">
          {isLogin ? 'Login to your account' : 'Create a new account'}
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
            <div className="flex items-baseline justify-between">
              <button 
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
              </button>
              {isLogin && (
                <a href="#" className="text-sm text-blue-400 hover:underline">Forgot password?</a>
              )}
            </div>
          </div>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-400 hover:underline"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}