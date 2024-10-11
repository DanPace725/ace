import { User } from '@supabase/supabase-js'

interface AuthResponse {
  user: User | null
  session: unknown | null
  error?: string
}
export interface UserProfile {
    username: string;
    role: string;
    xp: number;
    level: number;
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
// Add this function to the existing auth.ts file

export async function resetPassword(email: string): Promise<{ error?: string }> {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
  
    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.error }
    }
  
    return { error: undefined }
  }
  export async function getUserProfile(): Promise<{ user: UserProfile | null, error?: string }> {
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  
    if (!response.ok) {
      const errorData = await response.json()
      return { user: null, error: errorData.error }
    }
  
    const user = await response.json()
    return { user }
  }
  
  export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{ user: UserProfile | null, error?: string }> {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
  
    if (!response.ok) {
      const errorData = await response.json()
      return { user: null, error: errorData.error }
    }
  
    const user = await response.json()
    return { user }
  }