-- Pulse Production Database Schema
-- Supabase PostgreSQL Migration with Row Level Security (RLS)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  week_start_preference INTEGER NOT NULL DEFAULT 1 CHECK (week_start_preference IN (0, 1)),
  default_category TEXT NOT NULL DEFAULT 'Java',
  default_duration_minutes INTEGER NOT NULL DEFAULT 30,
  daily_planning_time TEXT NOT NULL DEFAULT '08:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Recurrence Rules Table
CREATE TABLE IF NOT EXISTS public.recurrence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'weekdays', 'custom_days')),
  days_of_week INTEGER[] DEFAULT NULL,
  interval_count INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date DATE NOT NULL,
  category TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('Java', 'DSA', 'MERN Stack', 'College', 'Projects', 'Personal', 'Health and Fitness', 'Other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'archived')),
  due_date DATE NOT NULL,
  due_time TIME DEFAULT NULL,
  reminder_at TIMESTAMPTZ DEFAULT NULL,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 30,
  tags TEXT[] NOT NULL DEFAULT '{}',
  recurrence_rule_id UUID REFERENCES public.recurrence_rules(id) ON DELETE SET NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  archived_at TIMESTAMPTZ DEFAULT NULL,
  completion_notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Task Occurrences Table (for scheduled recurring instances)
CREATE TABLE IF NOT EXISTS public.task_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurrence_rule_id UUID NOT NULL REFERENCES public.recurrence_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rule_scheduled_date UNIQUE (recurrence_rule_id, scheduled_date)
);

-- 6. Focus Sessions Table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ DEFAULT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'abandoned', 'active')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  browser_notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_reminder_minutes_before INTEGER NOT NULL DEFAULT 15,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  daily_planning_reminder BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_occurrences_user_date ON public.task_occurrences(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_focus_user_started ON public.focus_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);

-- Enable Row Level Security (RLS) on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurrence_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies: Recurrence Rules
DROP POLICY IF EXISTS "Users can manage own recurrence rules" ON public.recurrence_rules;
CREATE POLICY "Users can manage own recurrence rules" ON public.recurrence_rules
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: Tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: Task Occurrences
DROP POLICY IF EXISTS "Users can manage own occurrences" ON public.task_occurrences;
CREATE POLICY "Users can manage own occurrences" ON public.task_occurrences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: Goals
DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;
CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: Focus Sessions
DROP POLICY IF EXISTS "Users can manage own focus sessions" ON public.focus_sessions;
CREATE POLICY "Users can manage own focus sessions" ON public.focus_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: Notification Preferences
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Trigger: Automatically create profile and notification_preferences when new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, timezone)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table access for signed-in users (RLS above still limits them to their own rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles,
  public.recurrence_rules,
  public.goals,
  public.tasks,
  public.task_occurrences,
  public.focus_sessions,
  public.notification_preferences
TO authenticated;

-- Backfill rows for users who signed up before this migration ran
INSERT INTO public.profiles (id, display_name)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1),
    'User'
  )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notification_preferences (user_id)
SELECT u.id FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

-- Make the new tables visible to the Supabase API immediately
NOTIFY pgrst, 'reload schema';
