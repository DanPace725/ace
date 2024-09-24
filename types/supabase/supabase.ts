export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string | null
          criteria: Json | null
          description: string | null
          id: string
          name: string
          reward: string | null
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          name: string
          reward?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          name?: string
          reward?: string | null
        }
        Relationships: []
      }
      action_logs: {
        Row: {
          action_id: string | null
          admin_id: string | null
          base_xp: number | null
          bonus_xp: number | null
          created_at: string | null
          id: string
          notes: string | null
          profile_id: string | null
          timestamp: string | null
        }
        Insert: {
          action_id?: string | null
          admin_id?: string | null
          base_xp?: number | null
          bonus_xp?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action_id?: string | null
          admin_id?: string | null
          base_xp?: number | null
          bonus_xp?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_logs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "action_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          app_user_id: string | null
          base_xp: number
          created_at: string | null
          description: string | null
          domain: string | null
          frequency: string | null
          id: string
          name: string
          repeating: boolean | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          app_user_id?: string | null
          base_xp: number
          created_at?: string | null
          description?: string | null
          domain?: string | null
          frequency?: string | null
          id?: string
          name: string
          repeating?: boolean | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          app_user_id?: string | null
          base_xp?: number
          created_at?: string | null
          description?: string | null
          domain?: string | null
          frequency?: string | null
          id?: string
          name?: string
          repeating?: boolean | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          app_user_id: string
          auth_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          app_user_id: string
          auth_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          app_user_id?: string
          auth_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      level_rewards: {
        Row: {
          level_number: number
          reward_id: string
        }
        Insert: {
          level_number: number
          reward_id: string
        }
        Update: {
          level_number?: number
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_rewards_level_number_fkey"
            columns: ["level_number"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["level_number"]
          },
          {
            foreignKeyName: "level_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          created_at: string | null
          level_number: number
          xp_required: number
        }
        Insert: {
          created_at?: string | null
          level_number: number
          xp_required: number
        }
        Update: {
          created_at?: string | null
          level_number?: number
          xp_required?: number
        }
        Relationships: []
      }
      long_term_goals: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          profile_id: string | null
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          profile_id?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "long_term_goals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_profiles: {
        Row: {
          app_user_id: string
          created_at: string | null
          id: string
          level: number | null
          name: string
          parent_profile_id: string | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          app_user_id: string
          created_at?: string | null
          id?: string
          level?: number | null
          name: string
          parent_profile_id?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          app_user_id?: string
          created_at?: string | null
          id?: string
          level?: number | null
          name?: string
          parent_profile_id?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "managed_profiles_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_achievements: {
        Row: {
          achieved_at: string | null
          achievement_id: string
          profile_id: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_id: string
          profile_id: string
        }
        Update: {
          achieved_at?: string | null
          achievement_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_rewards: {
        Row: {
          is_claimed: boolean | null
          profile_id: string
          reward_id: string
        }
        Insert: {
          is_claimed?: boolean | null
          profile_id: string
          reward_id: string
        }
        Update: {
          is_claimed?: boolean | null
          profile_id?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_rewards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          level: number | null
          profile_id: string
          skill_id: string
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          level?: number | null
          profile_id: string
          skill_id: string
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          level?: number | null
          profile_id?: string
          skill_id?: string
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          criteria: string | null
          description: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          criteria?: string | null
          description?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
