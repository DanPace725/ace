-- Modify the existing users table
ALTER TABLE users RENAME TO app_users;

-- Update the app_users table
ALTER TABLE app_users
DROP COLUMN username;

ALTER TABLE app_users
DROP COLUMN role;

ALTER TABLE app_users
DROP COLUMN xp;

ALTER TABLE app_users
DROP COLUMN level;

-- Add a new column to link with auth.users
ALTER TABLE app_users
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL;

-- Create a new managed_profiles table
CREATE TABLE managed_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  app_user_id UUID REFERENCES app_users(id) NOT NULL,
  parent_profile_id UUID REFERENCES managed_profiles(id)
);

-- Update existing tables to reference managed_profiles instead of users
ALTER TABLE action_logs
DROP CONSTRAINT action_logs_user_id_fkey;

ALTER TABLE action_logs
ADD COLUMN profile_id UUID REFERENCES managed_profiles(id);

ALTER TABLE action_logs
DROP COLUMN user_id;

ALTER TABLE user_achievements RENAME TO profile_achievements;

ALTER TABLE profile_achievements
DROP CONSTRAINT user_achievements_user_id_fkey;

ALTER TABLE profile_achievements
ADD CONSTRAINT profile_achievements_profile_id_fkey FOREIGN KEY (user_id) REFERENCES managed_profiles(id);

ALTER TABLE profile_achievements
RENAME COLUMN user_id TO profile_id;

ALTER TABLE user_skills RENAME TO profile_skills;

ALTER TABLE profile_skills
DROP CONSTRAINT user_skills_user_id_fkey;

ALTER TABLE profile_skills
ADD CONSTRAINT profile_skills_profile_id_fkey FOREIGN KEY (user_id) REFERENCES managed_profiles(id);

ALTER TABLE profile_skills
RENAME COLUMN user_id TO profile_id;

ALTER TABLE user_rewards RENAME TO profile_rewards;

ALTER TABLE profile_rewards
DROP CONSTRAINT user_rewards_user_id_fkey;

ALTER TABLE profile_rewards
ADD CONSTRAINT profile_rewards_profile_id_fkey FOREIGN KEY (user_id) REFERENCES managed_profiles(id);

ALTER TABLE profile_rewards
RENAME COLUMN user_id TO profile_id;

ALTER TABLE long_term_goals
DROP CONSTRAINT long_term_goals_user_id_fkey;

ALTER TABLE long_term_goals
ADD CONSTRAINT long_term_goals_profile_id_fkey FOREIGN KEY (user_id) REFERENCES managed_profiles(id);

ALTER TABLE long_term_goals
RENAME COLUMN user_id TO profile_id;

-- Drop the admin_user_relationships table as it's no longer needed
DROP TABLE admin_user_relationships;

-- Update the actions table to reference app_users instead of users
ALTER TABLE actions
DROP CONSTRAINT actions_admin_id_fkey;

ALTER TABLE actions
ADD CONSTRAINT actions_app_user_id_fkey FOREIGN KEY (admin_id) REFERENCES app_users(id);

ALTER TABLE actions
RENAME COLUMN admin_id TO app_user_id;

-- Update the trigger function to insert into app_users instead of users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (auth_user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;