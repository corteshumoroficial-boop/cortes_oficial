-- ============================================================================
-- Clip Feedback & AI Self-Improvement Table
-- ============================================================================

-- Create clip_feedback table
create table if not exists public.clip_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  transcript_excerpt text not null,
  original_title text not null,
  approved_title text not null,
  original_hook text not null,
  approved_hook text not null,
  rating int not null default 1, -- 1 = Like, -1 = Dislike
  platform text,
  tone text
);

-- Indices for fast lookups
create index if not exists clip_feedback_rating_idx on public.clip_feedback(rating);
create index if not exists clip_feedback_created_at_idx on public.clip_feedback(created_at desc);

-- Enable RLS
alter table public.clip_feedback enable row level security;

-- Policies for public write/read
create policy "clip_feedback_all_access"
  on public.clip_feedback
  for all
  using (true)
  with check (true);
