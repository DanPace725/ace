

export interface AppUser  {
    id: string;
    auth_user_id: string;
    auth_id: string;
    created_at: string;
    updated_at: string;
}
  
export interface ManagedProfile {
    id: string;
    app_user_id: string;
    name: string;
    level: number;
    xp: number;
    requires_review?: boolean | null;
    created_at: string;
    updated_at: string;
    parent_profile_id: string | null;
  }

  export interface Action {
    id: string;
    app_user_id: string;
    name: string;
    description: string;
    base_xp: number;
    frequency: string;
    created_at: string;
    updated_at: string;
  }
  
export interface ActionLog {
    id: string;
    profile_id: string;
    action_id: string;
    timestamp: string;
    notes: string;
    xp_earned: number;
    created_at: string;
}
  


export interface RecentTask {
  id: string;
  actions: {
    name: string;
  };
  timestamp: string;
  base_xp: number;
  bonus_xp?: number;
}

export interface EarnedReward {
  profile_id: string;
  reward_id: string;
  rewards: {
    name: string;
  };
  created_at: string;
  updated_at: string;
  is_claimed: boolean;
}

export interface Reward {
  id: string;
  name: string;
  type: string;
  cost: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'denied';

export interface PendingActionLog {
  id: string;
  profile_id: string;
  action_id: string;
  timestamp: string;
  base_xp: number;
  bonus_xp: number;
  status: ReviewStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  managed_profiles: {
    app_user_id?: string;
    name: string;
  } | null;
  actions: {
    name: string;
  } | null;
}

export type RoomState = 'clean' | 'needs_attention' | 'messy' | 'critical';
export type CreditOwnerType = 'profile' | 'room' | 'house';
export type CreditEventType =
  | 'task_reward'
  | 'maintenance_interest'
  | 'delay_cost'
  | 'messiness_tax'
  | 'house_dividend'
  | 'rescue_cost'
  | 'admin_adjustment'
  | 'forgiveness_reset';
export type RoomResponsibilityStatus = 'assigned' | 'submitted' | 'approved' | 'denied' | 'rescued' | 'cancelled';

export interface Room {
  id: string;
  app_user_id: string;
  name: string;
  state: RoomState;
  is_shared: boolean;
  assigned_profile_id: string | null;
  state_changed_at: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditAccount {
  id: string;
  app_user_id: string;
  owner_type: CreditOwnerType;
  profile_id: string | null;
  room_id: string | null;
  balance: number;
  last_settled_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreditEvent {
  id: string;
  app_user_id: string;
  account_id: string;
  event_type: CreditEventType;
  amount: number;
  balance_after: number | null;
  source_type: string | null;
  source_id: string | null;
  note: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface ProfileWithAccount extends ManagedProfile {
  credit_account?: CreditAccount | null;
}

export interface RoomWithAccount extends Room {
  assigned_profile_name?: string | null;
  credit_account?: CreditAccount | null;
}

export interface RoomResponsibility {
  id: string;
  app_user_id: string;
  room_id: string;
  assigned_profile_id: string;
  assigned_by: string | null;
  status: RoomResponsibilityStatus;
  assigned_at: string;
  due_at: string | null;
  grace_hours: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  pending_action_log_id: string | null;
  action_log_id: string | null;
  starting_room_state: RoomState | null;
  starting_room_balance: number | null;
  last_delay_settled_at: string;
  created_at: string;
  updated_at: string;
}

export interface RoomResponsibilityWithDetails extends RoomResponsibility {
  rooms: {
    name: string;
    state: RoomState;
    is_shared: boolean;
  } | null;
  managed_profiles: {
    name: string;
  } | null;
}

export interface AdminPinSetting {
  app_user_id: string;
  pin_hash: string;
  created_at: string;
  updated_at: string;
}
