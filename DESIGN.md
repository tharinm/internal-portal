# Internal Portal — Design

## Overview

The Internal Portal is a small internal-tools app: a login-gated home base for a team, with one fully-built content section — an **announcements feed** — where any signed-in team member can post an announcement and see everyone else's.

Stack:

- **Next.js (App Router)**, TypeScript, deployed as a single full-stack app (no separate backend).
- **Supabase** for auth (email/password via Supabase Auth) and data storage (Postgres, accessed through Supabase's client libraries with Row Level Security enforcing access rules at the database layer).
- **Tailwind CSS** for styling, **shadcn/ui** for accessible unstyled-by-default component primitives.

### Why Server Actions instead of API routes

Next.js can talk to a backend either through `app/api/*` route handlers or through **Server Actions** (async functions marked `"use server"`, callable directly from Server and Client Components, typically wired to a `<form action={...}>`). This project uses Server Actions as the mutation layer instead of hand-rolled API routes:

- They remove an entire layer of boilerplate (no manual `fetch`, no manual JSON (de)serialization, no manually-typed request/response contracts) while still running exclusively on the server.
- Type safety is automatic end-to-end: a Server Action's TypeScript signature *is* the contract between client and server — there's no separate route handler to keep in sync.
- They compose naturally with React's `useFormStatus`/`useTransition` for pending/error UI, and with `revalidatePath` for cache invalidation after a write.
- Supabase's RLS policies still do the real access control, so this is a routing/ergonomics choice, not a security one — API routes would work too, just with more boilerplate for a project this size.

This is a judgment call the brief explicitly leaves open ("any data storage approach", API routes mentioned as *an* option, not a requirement); the reasoning above is repeated in the README for submission.

## System Architecture

### Rendering model

- **Server Components fetch all data.** Every page that reads from Supabase (the announcements feed, a single announcement) is a Server Component that calls the server-side Supabase client directly during render. No client-side `useEffect` + `fetch` for initial data.
- **Client Components are leaves.** Only interactive pieces (the "new announcement" form, a delete button with a confirm state) are Client Components (`"use client"`), and they receive data as props rather than fetching it themselves.
- **Mutations go through Server Actions.** Forms POST to a Server Action (`lib/actions/announcements.ts`), which validates input, calls the server Supabase client, and calls `revalidatePath` so the feed reflects the change on next render — no manual client-side cache management.

### Auth flow

Supabase SSR auth (`@supabase/ssr`) stores the session in cookies so it's readable on both server and client:

- **`lib/supabase/client.ts`** — browser client (`createBrowserClient`), used only inside Client Components that need auth state (e.g. a "logged in as" display, sign-out button).
- **`lib/supabase/server.ts`** — server client (`createServerClient` bound to `next/headers` cookies), used in Server Components, Server Actions, and Route Handlers.
- **`lib/supabase/proxy.ts`** — an `updateSession(request)` helper used by `proxy.ts` to refresh the auth token on every request (Supabase access tokens are short-lived; without this, sessions silently expire mid-use).
- **`proxy.ts`** (formerly `middleware.ts` — Next.js 16 renamed the file convention, see [nextjs.org/docs/messages/middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy)) — calls `updateSession`, then redirects unauthenticated requests to `/login` for any route outside an explicit public allowlist. This is the single place route protection is decided (see CLAUDE.md).

### Data flow

```
Read path:
  Browser → GET /            (Server Component)
          → server Supabase client (RLS-enforced query)
          → Postgres
          → rendered HTML

Write path:
  Browser → <form action={createAnnouncement}>   (Server Action)
          → server Supabase client (RLS-enforced insert)
          → Postgres
          → revalidatePath("/")
          → next request re-renders with fresh data
```

RLS is the actual security boundary: even if a Server Action or query had a bug, Postgres itself refuses reads/writes that violate policy. See [Supabase announcements schema](#supabase-announcements-schema) below.

### Folder structure

```
src/
  app/
    login/
      page.tsx                # sign-in form (public)
    page.tsx                  # announcements feed (protected, Server Component)
    layout.tsx                # root layout: html/body, font, global nav shell
    globals.css
  components/
    ui/                        # shadcn primitives (button, input, form, card, ...)
    layout/                    # app shell: navbar, mobile nav drawer
    announcements/             # AnnouncementCard, AnnouncementForm, etc. (added as the
                                # feed is built out; not part of this bootstrap)
  lib/
    supabase/
      client.ts                 # browser client
      server.ts                 # server client (RSC + Server Actions)
      proxy.ts                   # updateSession helper
    actions/
      announcements.ts           # Server Actions (added when the feed is built)
    types/
      database.ts                 # hand-written/generated DB row types
    utils.ts                       # cn() helper (shadcn convention)
  proxy.ts                          # route protection (Next.js 16 name for middleware.ts)
.env.local.example
```

This bootstrap creates the scaffolding (`lib/supabase/*`, `proxy.ts`, base UI components, a login page stub); the announcements feed's components/actions/types are the next layer of work on top of it.

## Supabase Announcements Schema

Kept intentionally small — one table, ownership-based access, no role system — per the brief's "keep scope small" guidance. This SQL is the reference schema to run against a real Supabase project once one is connected (not executed automatically by this bootstrap, since only placeholder env vars exist right now).

```sql
create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  author_id   uuid not null references auth.users (id) on delete cascade,
  is_pinned   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
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
```

Author display name/email is read from the Supabase-managed `auth.users` record via the session (e.g. `user.email`) rather than duplicated into a separate table — there's no `profiles` table in this design.

### Documented future enhancements (not built now)

- `category` / `priority` columns on `announcements` for filtering/sorting.
- A `profiles` table (`id references auth.users`, `full_name`, `role`) plus role-based RLS (e.g. `admin`/`editor` can moderate *any* post, not just their own) — useful once the portal has real organizational roles, but unnecessary complexity for a single-section assessment build.
- `expires_at` for time-limited announcements.

## Mobile-Responsive UI Layout Strategy

Mobile-first Tailwind throughout: unprefixed classes target the smallest viewport, `sm:`/`md:`/`lg:` progressively enhance for larger screens. Nothing is designed desktop-first and then crammed into a mobile view.

- **App shell**: a top app bar (product name, user menu / sign-out) is always visible. Primary navigation lives in a `Sheet`-driven slide-out drawer on small screens, and becomes a persistent left sidebar at `md:` and above. (Sheet is a future addition — see [components installed now](#components-installed-in-this-bootstrap).)
- **Announcements feed**: cards stack in a single column on mobile; `md:grid-cols-2`, `lg:grid-cols-3` on wider screens. Pinned announcements always render first, independent of column count.
- **Forms** (new/edit announcement): full-width, single-column fields on mobile; constrained to `max-w-2xl` and centered on desktop, so long text inputs don't stretch uncomfortably wide.
- **Touch targets**: interactive elements (nav items, buttons) keep a minimum ~44px tap target on small screens, per standard mobile accessibility guidance.
- **Typography/spacing**: base font size and spacing scale set for comfortable mobile reading first; desktop breakpoints increase whitespace/line-length rather than shrinking it.

### Components installed in this bootstrap

Only `Button`, `Input`, `Form`, `Card` are added in Step 3, matching what the login stub needs today. As the feed is built out, expect to add: `Sheet` (mobile nav), `Textarea` (announcement body), `DropdownMenu` (user menu), `Badge` (pinned indicator). These are called out here so the responsive shell's dependencies are traceable, without installing components that have no current use.
