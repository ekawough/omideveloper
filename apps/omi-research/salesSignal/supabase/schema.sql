-- SalesSignal — Supabase schema
-- Run in: Supabase dashboard → SQL Editor → New query → paste → Run
-- Idempotent: safe to re-run.

-- =========================================================================
-- Extensions
-- =========================================================================
create extension if not exists "pgcrypto";

-- =========================================================================
-- Tables
-- =========================================================================

-- Reps: field sales users wearing an Omi device.
create table if not exists public.reps (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid,
  name       text not null,
  email      text unique,
  device_id  text,                                  -- Omi device UID
  created_at timestamptz not null default now()
);

-- Sessions: one door-to-door conversation.
create table if not exists public.sessions (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid,
  rep_id               uuid references public.reps(id) on delete set null,
  status               text not null default 'active'
                       check (status in ('active','processing','completed','error')),
  transcript           text,
  sentiment_scores     jsonb,          -- Deepgram batch sentiment per segment
  emotion_analysis     jsonb,          -- SenseVoice/emotion2vec acoustic emotion
  fusion_timeline      jsonb,          -- fused text+acoustic, per-segment
  crew_output          jsonb,          -- raw CrewAI output (parser/scorer/writer)
  lead_score           integer check (lead_score between 1 and 10),
  audio_storage_path   text,           -- supabase storage path
  consent_status       boolean not null default false,
  ghl_contact_id       text,
  hubspot_contact_id   text,
  error_message        text,
  started_at           timestamptz not null default now(),
  completed_at         timestamptz
);

create index if not exists sessions_rep_idx      on public.sessions(rep_id);
create index if not exists sessions_status_idx   on public.sessions(status);
create index if not exists sessions_started_idx  on public.sessions(started_at desc);

-- Consent log: immutable audit trail.
create table if not exists public.consent_log (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references public.sessions(id) on delete cascade,
  rep_id          uuid references public.reps(id) on delete set null,
  consent_given   boolean not null default false,
  consent_method  text check (consent_method in ('verbal','written','digital')),
  state_code      text,                 -- 'CA','IL', etc.
  gps_lat         double precision,
  gps_lon         double precision,
  consent_script  text,                 -- snapshot of script used
  homeowner_name  text,
  consented_at    timestamptz not null default now()
);

create index if not exists consent_session_idx on public.consent_log(session_id);

-- Org settings: CRM keys, scoring rules, consent config (for admin panel).
create table if not exists public.org_settings (
  org_id                uuid primary key,
  ghl_enabled           boolean default false,
  hubspot_enabled       boolean default false,
  scoring_rules         jsonb default '{}'::jsonb,
  consent_config        jsonb default '{}'::jsonb,
  data_retention_days   integer default 30,
  updated_at            timestamptz default now()
);

-- =========================================================================
-- Row Level Security — enabled but permissive for hackathon.
-- Tighten with real policies before production.
-- =========================================================================
alter table public.reps          enable row level security;
alter table public.sessions      enable row level security;
alter table public.consent_log   enable row level security;
alter table public.org_settings  enable row level security;

-- Service role bypasses RLS. For authenticated reads from the admin panel:
drop policy if exists "read_all_sessions" on public.sessions;
create policy "read_all_sessions"
  on public.sessions for select
  using (true);

drop policy if exists "read_all_consent" on public.consent_log;
create policy "read_all_consent"
  on public.consent_log for select
  using (true);

drop policy if exists "read_all_reps" on public.reps;
create policy "read_all_reps"
  on public.reps for select
  using (true);

drop policy if exists "read_all_settings" on public.org_settings;
create policy "read_all_settings"
  on public.org_settings for select
  using (true);

-- =========================================================================
-- Realtime — admin panel subscribes to session updates.
-- =========================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'sessions'
  ) then
    alter publication supabase_realtime add table public.sessions;
  end if;
end $$;

-- =========================================================================
-- Storage bucket for audio recordings.
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('audio-recordings', 'audio-recordings', false)
on conflict (id) do nothing;
