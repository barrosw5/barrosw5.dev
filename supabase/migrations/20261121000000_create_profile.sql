-- The content of the About page and the footer: a single row that anyone can
-- read and only the admin can change. Everything here is public.
--
-- Run once in Supabase → SQL Editor, before merging the code that reads it.

begin;

create table public.profile (
  -- Always true: together with the primary key, this allows only one row
  id boolean primary key default true check (id),

  about_en text not null default '',
  about_pt text not null default '',
  doing_now_en text not null default '',
  doing_now_pt text not null default '',

  -- The same ids as `PlaceId` in src/core/types/profile.ts
  current_place text not null default 'lisbon'
    check (current_place in ('lisbon', 'pontaDelgada', 'amsterdam')),

  -- Lists edited in the admin, in display order. Their fields are described
  -- in docs/API.md. Dates are "YYYY-MM"; an `endDate` of null means "present"
  experience jsonb not null default '[]'
    check (jsonb_typeof(experience) = 'array'),
  stack jsonb not null default '[]'
    check (jsonb_typeof(stack) = 'array'),
  education jsonb not null default '[]'
    check (jsonb_typeof(education) = 'array'),
  certificates jsonb not null default '[]'
    check (jsonb_typeof(certificates) = 'array'),
  contacts jsonb not null default '[]'
    check (jsonb_typeof(contacts) = 'array')
);

-- The publishable key is public, so RLS is what protects this table
alter table public.profile enable row level security;

-- Start from nothing, then allow only what the site needs. Nobody gets INSERT
-- or DELETE, so the single row can't be removed or duplicated
revoke all on table public.profile from anon, authenticated;
grant select on table public.profile to anon, authenticated;
grant update on table public.profile to authenticated;

create policy "Anyone can read the profile"
  on public.profile
  for select
  to anon, authenticated
  using (true);

-- app_metadata can't be changed by the user, unlike user_metadata
create policy "Only the admin can update the profile"
  on public.profile
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- The first content: the links the footer already shows
insert into public.profile (contacts)
values (
  '[
    { "id": "github", "href": "https://github.com/barrosw5" },
    { "id": "linkedin", "href": "https://www.linkedin.com/in/barrosw5-dev/" }
  ]'::jsonb
);

commit;
