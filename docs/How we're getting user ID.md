# To understand how we're implementing the process of getting the logged-in user's ID and passing it to create a managed profile, let's break it down step by step

1. Getting the logged-in user's ID:
   The process starts in the `AppUsersPage` component:

```1:18:app/admin/app_users/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileManager from '@/app/components/ProfileManager'




export default async function AppUsersPage() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')

  }
    
  return <ProfileManager userId={data.user.id} />
}
```

Here, we use Supabase's server-side authentication to get the current user:

- We create a Supabase client using `createClient()` from the server-side utilities.
- We call `supabase.auth.getUser()` to get the authenticated user's data.
- If there's an error or no user data, we redirect to the login page.
- If successful, we pass the `user.id` to the `ProfileManager` component as a prop named `userId`.

2. Passing the user ID to the profile creation function:
   The `ProfileManager` component receives the `userId` prop and uses it when calling the `createManagedProfile` function:

```1:74:app/components/ProfileManager.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import { createManagedProfile } from '@/utils/api/users'

interface ProfileManagerProps {
  userId: string
}

const ProfileManager = ({ userId }: ProfileManagerProps) => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
        await createManagedProfile(name, userId)
      
      toast.success('Profile created successfully')
      router.push('/admin/app_users') // Adjust this route as needed
    } catch (error) {
      toast.error('Failed to create profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Create Managed Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
      </div>
    </div>
  )
}
export default ProfileManager
```

Key points in this component:

- It receives `userId` as a prop (line 9).
- In the `handleSubmit` function, it calls `createManagedProfile(name, userId)` (line 22).

3. Creating the managed profile:
   The `createManagedProfile` function is defined in the `users.ts` file:

```1:22:utils/api/users.ts
// utils/api/users.ts

import { createClient } from '@/utils/supabase/client';
import { ManagedProfile } from '@/types/app';


export const createManagedProfile = async (name: string, appUserId: string) => {
  const supabase = createClient();
  console.log('Starting createManagedProfile with name:', name, 'and appUserId:', appUserId);
  try {
    const { data, error } = await supabase
      .from('managed_profiles')
      .insert([{ name, app_user_id: appUserId }])
      .select();

    if (error) throw error;
    return data[0] as ManagedProfile;
  } catch (error) {
    console.error('Error in createManagedProfile:', error);
    throw error;
  }
};
```

This function:

- Takes `name` and `appUserId` as parameters.
- Creates a Supabase client.
- Inserts a new record into the `managed_profiles` table with the provided name and app_user_id.
- Returns the created profile data.

The flow of data is as follows:

1. Server-side authentication gets the user ID.
2. The user ID is passed to the ProfileManager component as a prop.
3. When the form is submitted, the ProfileManager component calls createManagedProfile with the name and user ID.
4. The createManagedProfile function uses this ID to create a new managed profile associated with the authenticated user.

This approach ensures that the user ID is securely obtained from the server-side authentication and correctly associated with the newly created managed profile.
