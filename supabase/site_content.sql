create table if not exists public.site_content (
    id text primary key,
    content jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default timezone('utc', now())
);
