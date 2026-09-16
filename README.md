# Internal Portal

A small login-gated internal portal built for the take-home assignment. Team members sign in (or self-serve sign up) and land on a shared **announcements feed**, where anyone can post an update and see everyone else's.

## Stack

- **Next.js 16** (App Router), TypeScript (strict)
- **Supabase**: email/password auth (`@supabase/ssr`) + Postgres with Row Level Security
- **Tailwind CSS** + **shadcn/ui** for styling/components

## Setup & run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.local.example` to `.env.local` and fill in your Supabase project's URL and anon key (Supabase Dashboard → Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

3. **Apply the database schema** — open your Supabase project's **SQL Editor** and run the contents of [`supabase/migrations/20250916000000_announcements.sql`](./supabase/migrations/20250916000000_announcements.sql) once. This creates the `announcements` table, its indexes/trigger, and its Row Level Security policies. (There's no DB password or service-role key in this setup, so it can't be applied programmatically — pasting it into the SQL Editor is the one manual step required.)

4. **Check the email confirmation setting** — in Supabase Dashboard → Authentication → Providers → Email, "Confirm email" can be left on or off:
   - **Off**: signing up at `/signup` logs you straight in.
   - **On**: signing up shows a "check your email" message; the confirmation link routes through `src/app/auth/callback/route.ts` and then into the app.

5. **(Optional) Use the seeded demo accounts** — the connected Supabase project already has two confirmed demo accounts with 3 sample announcements posted between them, so you can sign in immediately without going through `/signup` first:

   ```
   email:    demo@internal-portal.dev
   password: DemoPass123!

   email:    sarah.chen@internal-portal.dev
   password: DemoPass123!
   ```

   These are throwaway accounts for reviewing the app — no special "admin" role (there isn't one; see Key decisions below). They were created via Supabase's Admin API rather than a SQL script, since hand-inserting rows into `auth.users`/`auth.identities` bypasses Supabase's internal invariants and isn't officially supported. Skip this step if you'd rather just sign up your own account, or if you're running against a different Supabase project (these accounts only exist in the one this repo is currently configured against).

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`. Either sign in with the demo account above, or use **Sign up** to create your own.

## Key decisions

- **Server Actions, not API routes.** All data mutations (`src/lib/actions/`) are Server Actions called directly from `<form action={...}>`, rather than hand-rolled `app/api/*` route handlers. This removes a layer of manual `fetch`/JSON boilerplate while keeping everything server-only; a Server Action's TypeScript signature is the full client↔server contract. The one exception is `src/app/auth/callback/route.ts`, a Route Handler — that's a redirect target Supabase's email-confirmation link calls directly, not an internal-portal UI mutation, so it's a legitimate use of a route handler rather than an exception to the rule.
- **RLS is the real security boundary.** Every Supabase query runs with the signed-in user's session; Postgres policies (not application code) decide who can read/write which rows. Announcements are readable by any signed-in user but only writable by their author. Server Actions still re-check `auth.getUser()` themselves before writing, since route protection (`src/proxy.ts`) is only an optimistic check for UX, not the authorization boundary.
- **No `profiles` table.** Author identity comes from the Supabase session (`user.email`) rather than a separate normalized table — this app has no roles/permissions beyond "signed in or not," so a `profiles` table would be complexity without payoff at this scope. One deviation from a pure "no denormalization" stance: the `announcements` table stores `author_email` alongside `author_id`, because Supabase's client APIs never expose `auth.users` for anyone but the current session's own user — without a stored email, there'd be no way to show who else posted something.
- **Plain `<form action>` + `useActionState`, not React Hook Form.** Forms are small (2–3 fields) and validation is server-authoritative via Zod inside each Server Action; adding a client form library wouldn't buy much here. `useActionState` handles pending/error UI without extra dependencies.
- **Self-serve signup, plus two seeded demo accounts.** `/signup` lets anyone create their own account, so this is testable without needing anything from me. For a quicker look, the connected Supabase project already has two demo accounts with sample announcements (Setup step 5) — throwaway accounts with no elevated access, since this app has no admin role at all.
- **Single-column feed, no grid.** Announcements are pinned-first then newest-first — a strictly linear order. A multi-column grid would visually break that ordering (and looks ragged with variable-length posts), so the feed is one centered column instead.
- **No mobile nav drawer.** The portal currently has exactly one destination (the feed), so the top bar is a single static header with a sign-out button — a hamburger/drawer pattern would be solving a problem that doesn't exist yet.
- **`is_pinned` is set at creation only.** There's no separate "pin/unpin an existing post" action — out of scope for a single-section assessment build, but the schema/sort logic already supports it if that's added later.

## Project structure

```
src/
  app/
    login/, signup/, auth/callback/   # public auth routes
    (portal)/                         # protected: top bar + announcements feed
  components/
    ui/            # shadcn primitives, unmodified
    auth/           # login/signup form leaves
    announcements/  # feed card + create form
    layout/         # top bar
  lib/
    actions/        # Server Actions (auth.ts, announcements.ts)
    supabase/       # the only three places a Supabase client is created
    types/          # hand-written Database types
supabase/
  migrations/  # SQL schema (run manually, see Setup step 3)
```
