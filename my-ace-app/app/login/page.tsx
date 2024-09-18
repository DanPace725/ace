'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // You might want to show a message that asks the user to verify their email
        setError('Please check your email to verify your account')
        return
      }
      router.push('/dashboard')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError(isLogin ? 'Invalid login credentials' : 'Error creating account')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg">
        <div className="flex justify-center">
          <Image
            src="/  logo1.png"
            alt="Logo"
            width={64}
            height={64}
            className="mb-4"
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
              <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" type="submit">
                {isLogin ? 'Login' : 'Register'}
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