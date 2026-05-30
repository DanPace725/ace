

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
