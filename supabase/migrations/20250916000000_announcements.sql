create table public.announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text not null,
  author_id     uuid not null references auth.users (id) on delete cascade,
  author_email  text not null,
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index announcements_created_at_idx
  on public.announcements (created_at desc);

create index announcements_pinned_idx
  on public.announcements (is_pinned)
  where is_pinned = true;

-- keep updated_at current on every UPDATE
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

-- any signed-in user can read the shared feed
create policy "announcements_select_authenticated"
  on public.announcements for select
  to authenticated
  using (true);

-- a user can only post as themselves
create policy "announcements_insert_own"
  on public.announcements for insert
  to authenticated
  with check (author_id = auth.uid());

-- a user can only edit their own posts
create policy "announcements_update_own"
  on public.announcements for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- a user can only delete their own posts
create policy "announcements_delete_own"
  on public.announcements for delete
  to authenticated
  using (author_id = auth.uid());
