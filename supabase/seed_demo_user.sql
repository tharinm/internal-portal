-- Optional: seeds a demo login so a reviewer can sign in without going
-- through /signup first. Safe to skip if you'd rather just use /signup.
--
-- Run this once in the Supabase SQL Editor, after the schema migration.
-- Credentials: demo@internalportal.dev / demo12345

create extension if not exists pgcrypto;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@internalportal.dev',
  crypt('demo12345', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(), now(),
  '', '', '', ''
)
on conflict (email) do nothing;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  format('{"sub":"%s","email":"%s"}', u.id::text, u.email)::jsonb,
  'email',
  now(), now(), now()
from auth.users u
where u.email = 'demo@internalportal.dev'
  and not exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  );
