-- Create pages table
create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  template text not null,
  sections jsonb default '[]'::jsonb,
  status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on slug for faster lookups
create index if not exists pages_slug_idx on public.pages(slug);

-- Create index on template for faster filtering
create index if not exists pages_template_idx on public.pages(template);

-- Create index on status for faster filtering
create index if not exists pages_status_idx on public.pages(status);

-- Enable RLS
alter table public.pages enable row level security;

-- Create policies
create policy "Allow public to view published pages" on public.pages
  for select
  using (status = 'published');

create policy "Allow authenticated admins to manage pages" on public.pages
  for all
  using (auth.role() = 'authenticated');
