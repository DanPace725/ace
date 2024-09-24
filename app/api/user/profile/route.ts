import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const { data: appUser, error: appUserError } = await supabase
      .from('app_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (appUserError) throw appUserError;

    const { data: managedProfiles, error: profilesError } = await supabase
      .from('managed_profiles')
      .select('*')
      .eq('app_user_id', appUser.id);

    if (profilesError) throw profilesError;

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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const updates = await request.json();

    // Remove any fields that shouldn't be updated directly
    delete updates.id;
    delete updates.auth_user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('app_users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('auth_user_id', user.id)
      .select();

    if (error) throw error;

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