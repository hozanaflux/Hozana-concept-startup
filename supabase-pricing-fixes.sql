-- Hozana Concept - Pricing fixes
-- Run this in Supabase SQL Editor if the pricing comparison or crossed prices
-- do not persist from the admin form.

alter table if exists public.packs
  add column if not exists old_price text,
  add column if not exists price_before text,
  add column if not exists compare_at_price text,
  add column if not exists comparison jsonb default '{}'::jsonb,
  add column if not exists slug text,
  add column if not exists button_text text,
  add column if not exists button_class text,
  add column if not exists link text,
  add column if not exists item_type text default 'pack';

create index if not exists packs_slug_idx on public.packs (slug);

alter table if exists public.site_settings
  add column if not exists updated_at timestamptz default now();
