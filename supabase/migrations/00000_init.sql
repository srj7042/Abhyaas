-- DROP EXISTING CONFLICTING SCHEMAS IF THEY EXIST
drop table if exists public.roadmap_modules cascade;
drop table if exists public.roadmaps cascade;
drop table if exists public.learning_goals cascade;
drop table if exists public.projects cascade;
drop table if exists public.mistakes cascade;
drop table if exists public.user_skills cascade;
drop table if exists public.career_readiness cascade;
drop table if exists public.xp_transactions cascade;
drop table if exists public.streaks cascade;
drop table if exists public.profiles cascade;
drop table if exists public.user_missions cascade;
drop table if exists public.daily_missions cascade;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();


-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  auth_user_id uuid references auth.users on delete cascade,
  full_name text,
  username text unique,
  email text unique,
  experience_level text default 'intermediate',
  target_career text default 'AI Engineer',
  target_deadline timestamp with time zone default now() + interval '5 months',
  weekly_hours integer default 15,
  learning_preference text default 'Interactive Labs',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Profiles are viewable by own user." on profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile." on profiles for insert with check (auth.uid() = id);

-- TRIGGER for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, auth_user_id, full_name, username, email)
  values (
    new.id, 
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'username', new.email),
    new.email
  );
  
  -- Automatically initialize streak record for new user
  insert into public.streaks (user_id, current_streak, longest_streak, last_activity_date)
  values (new.id, 0, 0, current_date);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- STREAKS
create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date default current_date
);
alter table public.streaks enable row level security;
create policy "Streaks are viewable by own user." on streaks for select using (auth.uid() = user_id);
create policy "Users can update own streak." on streaks for update using (auth.uid() = user_id);
create policy "Users can insert own streak." on streaks for insert with check (auth.uid() = user_id);


-- XP TRANSACTIONS
create table public.xp_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer default 0,
  source text not null,
  reference_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.xp_transactions enable row level security;
create policy "XP transactions are viewable by own user." on xp_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own XP transaction." on xp_transactions for insert with check (auth.uid() = user_id);


-- CAREER READINESS
create table public.career_readiness (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_mastery integer default 0,
  assessment_score integer default 0,
  project_evidence integer default 0,
  consistency_score integer default 0,
  interview_readiness integer default 0,
  overall_score integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.career_readiness enable row level security;
create policy "Readiness scores are viewable by own user." on career_readiness for select using (auth.uid() = user_id);
create policy "Users can update own readiness." on career_readiness for update using (auth.uid() = user_id);
create policy "Users can insert own readiness." on career_readiness for insert with check (auth.uid() = user_id);


-- USER SKILLS
create table public.user_skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid,
  name text not null,
  mastery_score integer default 0,
  status text default 'Active',
  last_assessed_at timestamp with time zone
);
alter table public.user_skills enable row level security;
create policy "User skills are viewable by own user." on user_skills for select using (auth.uid() = user_id);
create policy "Users can update own skills." on user_skills for update using (auth.uid() = user_id);
create policy "Users can insert own skills." on user_skills for insert with check (auth.uid() = user_id);


-- LEARNING GOALS
create table public.learning_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_text text not null,
  target_role text not null,
  deadline date,
  weekly_commitment integer,
  difficulty_preference text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.learning_goals enable row level security;
create policy "Goals are viewable by own user." on learning_goals for select using (auth.uid() = user_id);
create policy "Users can manage own goals." on learning_goals for all using (auth.uid() = user_id);


-- ROADMAPS
create table public.roadmaps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_id uuid references public.learning_goals(id) on delete cascade,
  title text not null,
  description text,
  target_role text,
  estimated_duration text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.roadmaps enable row level security;
create policy "Roadmaps are viewable by own user." on roadmaps for select using (auth.uid() = user_id);
create policy "Users can manage own roadmaps." on roadmaps for all using (auth.uid() = user_id);


-- ROADMAP MODULES
create table public.roadmap_modules (
  id uuid default uuid_generate_v4() primary key,
  roadmap_id uuid references public.roadmaps(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer not null,
  duration text,
  milestone text,
  status text default 'Locked'
);
alter table public.roadmap_modules enable row level security;
create policy "Modules are viewable by own user." on roadmap_modules for select using (auth.uid() = user_id);
create policy "Users can manage own modules." on roadmap_modules for all using (auth.uid() = user_id);


-- MISTAKES
create table public.mistakes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  assessment_id uuid,
  question text not null,
  user_answer text,
  correct_answer text,
  error_type text,
  explanation text,
  recovery_action text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.mistakes enable row level security;
create policy "Mistakes are viewable by own user." on mistakes for select using (auth.uid() = user_id);
create policy "Users can manage own mistakes." on mistakes for all using (auth.uid() = user_id);


-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  difficulty text,
  status text default 'Not Started',
  score integer,
  completed_at timestamp with time zone
);
alter table public.projects enable row level security;
create policy "Projects are viewable by own user." on projects for select using (auth.uid() = user_id);
create policy "Users can manage own projects." on projects for all using (auth.uid() = user_id);


-- DAILY MISSIONS
create table public.daily_missions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  xp_reward integer not null
);
alter table public.daily_missions enable row level security;
create policy "Missions list is viewable by authenticated users." on daily_missions for select using (true);


-- USER MISSIONS
create table public.user_missions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mission_id uuid references public.daily_missions(id) on delete cascade not null,
  status text default 'active'
);
alter table public.user_missions enable row level security;
create policy "User missions are viewable by own user." on user_missions for select using (auth.uid() = user_id);
create policy "Users can manage own missions." on user_missions for all using (auth.uid() = user_id);
