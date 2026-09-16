# Repository Rules

These are standing engineering rules for this repository. They describe how code in this project must be written, not a log of work done — do not append session notes, changelogs, or conversational history to this file. See [DESIGN.md](./DESIGN.md) for the architecture and schema these rules assume.

## Data fetching — Server Components only

- All reads from Supabase happen in **Server Components**, during render, using the server client from `src/lib/supabase/server.ts`.
- Never fetch initial data with `useEffect` + `fetch`/`createBrowserClient` in a Client Component. If a Client Component needs data, it receives it as **props** from a Server Component ancestor.
- The browser Supabase client (`src/lib/supabase/client.ts`) exists only for client-side auth state (e.g. reacting to sign-out) — not for querying application data.

## Mutations — Server Actions only

- All writes (insert/update/delete) go through **Server Actions** defined in `src/lib/actions/*.ts`, marked `"use server"`.
- Server Actions are invoked via `<form action={...}>` or `startTransition`, never via a manually-written `fetch` to a route handler for internal app mutations.
- Every Server Action that changes data ends by calling `revalidatePath` (or `revalidateTag`) for whatever it affects. Do not leave stale cached data on screen after a write.
- Validate all Server Action input (e.g. with `zod`) before it reaches Supabase. Never trust `FormData` values as already the right shape/type.

## Styling — Tailwind, mobile-first

- Tailwind CSS only. No inline `style={{...}}`, no ad-hoc `.css`/`.module.css` files outside `src/app/globals.css`.
- Write classes **mobile-first**: unprefixed utility classes are the base (smallest-viewport) styles; add `sm:`/`md:`/`lg:`/`xl:` prefixes to progressively enhance for larger viewports. Never start from a desktop layout and add a `max-` breakpoint to shrink it down.
- Compose conditional/variant classes with the `cn()` helper (`src/lib/utils.ts`, `clsx` + `tailwind-merge`), matching shadcn conventions — don't concatenate class strings by hand.
- Every new interactive screen must be checked at a ~400px-wide viewport before it's considered done.

## Components

- shadcn/ui primitives live under `src/components/ui/` exactly as the CLI generates them. Don't hand-modify a primitive's internals to work around a one-off need — build a wrapper in a feature folder instead.
- Feature-specific composite components live under `src/components/<feature>/` (e.g. `src/components/announcements/`).
- One component per file. Co-locate a component's own small helper types in the same file; shared types go in `src/lib/types/`.

## Type safety

- `tsconfig.json` keeps `strict: true`. Do not weaken it.
- No `any`. No non-null assertions (`!`) except where a value's presence is truly guaranteed by code structure the compiler can't see — and add a comment explaining why when you do.
- Database rows are typed via `src/lib/types/database.ts`; don't inline ad-hoc shapes for Supabase query results.
- Server Action parameters and return values are explicitly typed — never left to infer as `any` from untyped `FormData` access.

## Auth / session handling

- Supabase auth cookies are read/written **only** through the three designated helpers: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/proxy.ts`. Don't instantiate a Supabase client ad hoc elsewhere.
- Route protection is decided in exactly one place: `src/proxy.ts` (Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`; behavior is the same). Don't duplicate auth-gating logic (redirect-if-signed-out checks) inside individual pages.
- Row Level Security in Postgres is the real access-control boundary — app code should never assume it alone is sufficient to keep one user from seeing/editing another's data.

## File organization

- Mirror the folder structure documented in DESIGN.md (`src/app`, `src/components`, `src/lib`).
- Co-locate a feature's Server Actions with that feature's name (e.g. announcement mutations in `src/lib/actions/announcements.ts`, not a generic catch-all actions file).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
