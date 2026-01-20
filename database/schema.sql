-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
-- For Admins: id should match auth.users.id
-- For Students: id is a generated UUID tracked in session
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  nickname text,
  role text default 'student' check (role in ('admin', 'student')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Questions table
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  options jsonb not null, -- e.g., ["Option A", "Option B", "Option C", "Option D"]
  correct_answer text not null, -- The correct option string or index
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Results table
create table public.results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.questions enable row level security;
alter table public.results enable row level security;

-- Policies

-- Users:
-- Anyone can read user nicknames (for leaderboard)
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using ( true );

-- Admins can update/delete
-- Assuming we have a function or way to identify admin in RLS. 
-- For simplicity, we assume auth.uid() maps to a user with role 'admin'
create policy "Admins can update users"
  on public.users for update
  using ( exists ( select 1 from public.users where id = auth.uid() and role = 'admin' ) );

-- Questions:
-- Public read
create policy "Questions are viewable by everyone"
  on public.questions for select
  using ( true );

-- Admin write
create policy "Admins can insert questions"
  on public.questions for insert
  with check ( exists ( select 1 from public.users where id = auth.uid() and role = 'admin' ) );

create policy "Admins can update questions"
  on public.questions for update
  using ( exists ( select 1 from public.users where id = auth.uid() and role = 'admin' ) );

create policy "Admins can delete questions"
  on public.questions for delete
  using ( exists ( select 1 from public.users where id = auth.uid() and role = 'admin' ) );

-- Results:
-- Public read (for leaderboard)
create policy "Results are viewable by everyone"
  on public.results for select
  using ( true );

-- Insert: allowed for anyone (student submitting results)
-- In production, this should be server-side protected or verified.
create policy "Anyone can insert results"
  on public.results for insert
  with check ( true );
