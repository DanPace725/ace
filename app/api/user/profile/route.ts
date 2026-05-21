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
      .maybeSingle();

    if (appUserError) {
      console.warn('Could not load app user record; falling back to auth user id.', appUserError);
    }

    const appUserId = appUser?.id ?? user.id;
    const lookupIds = Array.from(new Set([appUserId, user.id]));

    const profilesQuery = supabase
      .from('managed_profiles')
      .select('*');

    const { data: managedProfiles, error: profilesError } = lookupIds.length > 1
      ? await profilesQuery.in('app_user_id', lookupIds)
      : await profilesQuery.eq('app_user_id', lookupIds[0]);

    if (profilesError) throw profilesError;

    return NextResponse.json({
      appUser: appUser ?? { id: user.id, auth_user_id: user.id },
      managedProfiles,
    });
  } catch (error) {
    console.error('Error in GET:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Profile editing is not supported for app user records.' },
    { status: 405 }
  );
}
