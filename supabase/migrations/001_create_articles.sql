-- Create articles table for The Stretford End
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  excerpt     text,
  body        text,
  category    text not null default 'News',
  author      text not null default 'Staff Reporter',
  is_live     boolean not null default false,
  image_url   text,
  tags        text[] default '{}',
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast homepage queries
create index if not exists articles_created_at_idx on public.articles (created_at desc);
create index if not exists articles_category_idx on public.articles (category);
create index if not exists articles_is_live_idx on public.articles (is_live);

-- Enable Row Level Security
alter table public.articles enable row level security;

-- Allow anyone to read published articles
create policy "Public can read published articles"
  on public.articles for select
  using (published = true);

-- Only service role can insert/update/delete (used by cron job)
create policy "Service role full access"
  on public.articles for all
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.handle_updated_at();
