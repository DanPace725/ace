// File path: app/api/user/profile/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser, getAppUser } from '@/utils/api/users';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const user = await getSessionUser();
    console.log('API getSessionUser response:', user);
    const appUser = await getAppUser(user.id);

    const { data: managedProfiles, error: profilesError } = await supabase
      .from('managed_profiles')
      .select('*')
      .eq('app_user_id', appUser.id);

    if (profilesError) {
      console.error('Error fetching managed profiles:', profilesError);
      return NextResponse.json({ error: 'Error fetching managed profiles' }, { status: 500 });
    }

    return NextResponse.json({ appUser, managedProfiles });
  } catch (error) {
    console.error('Error in GET:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const user = await getSessionUser();
    const updates = await request.json();

    // Remove any fields that shouldn't be updated directly
    delete updates.id;
    delete updates.auth_user_id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data, error } = await supabase
      .from('app_users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('auth_user_id', user.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}