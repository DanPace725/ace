CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'clean'
    CHECK (state IN ('clean', 'needs_attention', 'messy', 'critical')),
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_profile_id UUID REFERENCES managed_profiles(id) ON DELETE SET NULL,
  state_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('profile', 'room', 'house')),
  profile_id UUID REFERENCES managed_profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  balance NUMERIC(12, 4) NOT NULL DEFAULT 0,
  last_settled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (owner_type = 'profile' AND profile_id IS NOT NULL AND room_id IS NULL)
    OR (owner_type = 'room' AND room_id IS NOT NULL AND profile_id IS NULL)
    OR (owner_type = 'house' AND profile_id IS NULL AND room_id IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS credit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'task_reward',
      'maintenance_interest',
      'delay_cost',
      'messiness_tax',
      'house_dividend',
      'rescue_cost',
      'admin_adjustment',
      'forgiveness_reset'
    )
  ),
  amount NUMERIC(12, 4) NOT NULL,
  balance_after NUMERIC(12, 4),
  source_type TEXT,
  source_id UUID,
  note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  assigned_profile_id UUID NOT NULL REFERENCES managed_profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES app_users(id),
  status TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'submitted', 'approved', 'denied', 'rescued', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  pending_action_log_id UUID REFERENCES pending_action_logs(id) ON DELETE SET NULL,
  action_log_id UUID REFERENCES action_logs(id) ON DELETE SET NULL,
  starting_room_state TEXT CHECK (starting_room_state IN ('clean', 'needs_attention', 'messy', 'critical')),
  starting_room_balance NUMERIC(12, 4),
  last_delay_settled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_state_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  from_state TEXT CHECK (from_state IN ('clean', 'needs_attention', 'messy', 'critical')),
  to_state TEXT NOT NULL CHECK (to_state IN ('clean', 'needs_attention', 'messy', 'critical')),
  changed_by UUID REFERENCES app_users(id),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS credit_accounts_profile_unique
ON credit_accounts(profile_id)
WHERE owner_type = 'profile';

CREATE UNIQUE INDEX IF NOT EXISTS credit_accounts_room_unique
ON credit_accounts(room_id)
WHERE owner_type = 'room';

CREATE UNIQUE INDEX IF NOT EXISTS credit_accounts_house_unique
ON credit_accounts(app_user_id)
WHERE owner_type = 'house';

CREATE INDEX IF NOT EXISTS credit_events_account_created_at_idx
ON credit_events(account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS room_responsibilities_status_idx
ON room_responsibilities(app_user_id, status);

CREATE INDEX IF NOT EXISTS rooms_app_user_state_idx
ON rooms(app_user_id, state);
