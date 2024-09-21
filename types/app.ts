

export interface AppUser  {
    id: string;
    auth_user_id: string;
    auth_id: string;
    created_at: string;
    updated_at: string;
}
  
export interface ManagedProfile {
    id: string;
    name: string;
    xp: number;
    level: number;
    created_at: string;
    updated_at: string;
    app_user_id: string;
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
  
// Add other interfaces as needed