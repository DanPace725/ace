

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
    created_at: string;
    updated_at: string;
    parent_profile_id: string | null;
  }

export interface Action {
    id: string;
    app_user_id: string;
    name: string;
    description: string;
    type: string;
    base_xp: number;
    repeating: boolean;
    frequency: string;
    domain: string;
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
  id: string;
  rewards: {
    name: string;
  };
  created_at: string;
  is_claimed: boolean;
}