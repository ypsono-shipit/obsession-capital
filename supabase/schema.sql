-- Obsession Capital — Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

-- Profiles (email as primary identifier, no auth)
create table if not exists profiles (
  email text primary key,
  name text not null default '',
  hustle text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Business ideas
create table if not exists ideas (
  id text primary key,
  email text not null references profiles(email) on delete cascade,
  title text not null,
  category text not null default 'Side Hustle',
  description text not null default '',
  metrics_goals text not null default '',
  github_url text,
  biz_info text,
  critique text,
  assumption text,
  experiments jsonb,
  status text not null default 'Draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists ideas_email_idx on ideas(email);

-- Daily income logs
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  email text not null references profiles(email) on delete cascade,
  date date not null,
  value numeric not null default 0,
  note text not null default '',
  unique(email, date)
);
create index if not exists daily_logs_email_idx on daily_logs(email);

-- Active missions (goal + tasks, one active per user)
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  email text not null references profiles(email) on delete cascade,
  goal text not null,
  tasks jsonb not null default '[]',
  created_at timestamptz default now()
);
create index if not exists missions_email_idx on missions(email);

-- Task check state per user per day
create table if not exists task_checks (
  id uuid primary key default gen_random_uuid(),
  email text not null references profiles(email) on delete cascade,
  date date not null,
  checks jsonb not null default '[]',
  unique(email, date)
);
create index if not exists task_checks_email_idx on task_checks(email);

-- Shared daily ideas cache (Reddit scraper output)
create table if not exists daily_ideas (
  date date primary key,
  ideas jsonb not null default '[]',
  scraped_at timestamptz default now()
);
