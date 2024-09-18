-- Modify Users Table to reference auth.users
ALTER TABLE users
DROP COLUMN email,
ADD COLUMN auth_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL;

-- Update AdminUserRelationships Table
ALTER TABLE admin_user_relationships
DROP CONSTRAINT admin_user_relationships_admin_id_fkey,
DROP CONSTRAINT admin_user_relationships_user_id_fkey,
ADD CONSTRAINT admin_user_relationships_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES users(auth_id),
ADD CONSTRAINT admin_user_relationships_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(auth_id);


-- Update ActionLogs Table
ALTER TABLE action_logs
DROP CONSTRAINT action_logs_user_id_fkey,
DROP CONSTRAINT action_logs_admin_id_fkey,
ADD CONSTRAINT action_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(auth_id),
ADD CONSTRAINT action_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES users(auth_id);

-- Update UserAchievements Table
ALTER TABLE user_achievements
DROP CONSTRAINT user_achievements_user_id_fkey,
ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(auth_id);

-- Update UserSkills Table
ALTER TABLE user_skills
DROP CONSTRAINT user_skills_user_id_fkey,
ADD CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(auth_id);

-- Update UserRewards Table
ALTER TABLE user_rewards
DROP CONSTRAINT user_rewards_user_id_fkey,
ADD CONSTRAINT user_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(auth_id);

-- Update LongTermGoals Table
ALTER TABLE long_term_goals
DROP CONSTRAINT long_term_goals_user_id_fkey,
ADD CONSTRAINT long_term_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(auth_id);

-- Create a trigger to automatically insert into users table when a new auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, username, role, xp, level, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 'user', 0, 1, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();