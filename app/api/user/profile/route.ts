import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // eslint-disable-next-line prefer-const
  let { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

    if (error) {
        // If there's an error, it might be because the user doesn't exist in the public.users table
        // Let's create a new user record
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            { 
                auth_id: user.id, 
                username: "user", 
                role: 'user', 
                xp: 0, 
                level: 1 
              }
          ])
          .select()
          .single()
    
        if (insertError) {
          console.error('Error creating user:', insertError)
          return NextResponse.json({ error: 'Error creating user profile' }, { status: 500 })
        }
    
        userData = newUser
      }
    
      return NextResponse.json(userData)
    }

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const updates = await request.json()

  // Remove any fields that shouldn't be updated directly
  delete updates.id
  delete updates.auth_id
  delete updates.role
  delete updates.created_at
  delete updates.updated_at

  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('auth_id', user.id)
    .select()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}