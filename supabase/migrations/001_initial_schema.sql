-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AdminUserRelationships Table
CREATE TABLE admin_user_relationships (
  admin_id UUID REFERENCES users(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id, user_id)
);

-- Actions Table
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Auto-incrementing primary key
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,  -- References the 'users' table for admins, nullable
  name TEXT NOT NULL,  -- Name of the action (task)
  description TEXT,  -- Optional description of the action
  type TEXT,  -- Optional type of action (e.g., "task", "goal")
  base_xp INTEGER NOT NULL,  -- XP value for completing the action
  repeating BOOLEAN DEFAULT FALSE,  -- Whether the action is repeating
  frequency TEXT,  -- Frequency for repeating actions (e.g., "daily", "weekly")
  domain TEXT,  -- Domain or category (e.g., work, home)
  created_at TIMESTAMP DEFAULT now(),  -- Timestamp for when the action was created
  updated_at TIMESTAMP DEFAULT now()  -- Timestamp for the last update
) TABLESPACE pg_default;

-- ActionLogs Table
CREATE TABLE action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action_id UUID REFERENCES actions(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  base_xp INTEGER DEFAULT 0,
  bonus_xp INTEGER DEFAULT 0,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements Table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB,
  reward TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UserAchievements Table
CREATE TABLE user_achievements (
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);

-- Skills Table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UserSkills Table
CREATE TABLE user_skills (
  user_id UUID REFERENCES users(id),
  skill_id UUID REFERENCES skills(id),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, skill_id)
);

-- Levels Table
CREATE TABLE levels (
  level_number INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rewards Table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('immediate', 'cumulative')),
  description TEXT,
  criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UserRewards Table
CREATE TABLE user_rewards (
  user_id UUID REFERENCES users(id),
  reward_id UUID REFERENCES rewards(id),
  is_claimed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, reward_id)
);

-- Create LevelRewards Table for many-to-many relationship
CREATE TABLE level_rewards (
  level_number INTEGER REFERENCES levels(level_number),
  reward_id UUID REFERENCES rewards(id),
  PRIMARY KEY (level_number, reward_id)
);

-- LongTermGoals Table
CREATE TABLE long_term_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);