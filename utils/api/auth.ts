import { User } from '@supabase/supabase-js'

interface AuthResponse {
  user: User | null
  session: unknown | null
  error?: string
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    return { user: null, session: null, error: errorData.error }
  }

  return response.json()
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    return { user: null, session: null, error: errorData.error }
  }

  return response.json()
}

export async function signOut(): Promise<{ error?: string }> {
  const response = await fetch('/api/auth/signout', {
    method: 'POST',
  })

  if (!response.ok) {
    const errorData = await response.json()
    return { error: errorData.error }
  }

  return { error: undefined }
}