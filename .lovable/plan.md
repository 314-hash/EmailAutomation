# AI Email Assistant — MVP Plan

A Linear-inspired dark dashboard that connects to Microsoft Outlook, uses Lovable AI to summarize, classify, and draft replies for supply-chain emails.

## Scope (this iteration)

In:
- Auth (email/password) via Lovable Cloud
- Outlook connection via Lovable's Microsoft Outlook connector
- Inbox sync (latest 25 messages) into our DB
- AI processing per email: summary, intent, urgency, key details, suggested reply, next action
- Dashboard: sidebar nav, inbox list with AI tags, detail panel with editable reply, urgency/intent filters
- Send reply via Outlook
- Lightweight analytics tiles (emails processed, urgent count, avg response time)
- Marketing landing page at `/` with pricing teaser

Out (later phases):
- Gmail integration
- Stripe billing & plan enforcement
- Per-user OAuth (this uses the *builder's* connected Outlook mailbox — fine for MVP demo)
- Org roles, GDPR DPA tooling, multi-tenant workspaces
- Real-time webhooks (we'll poll on demand)

## Important caveat

The Lovable Outlook connector authorizes **your** Microsoft account, not each end user's. For a real multi-tenant SaaS you'd need per-user Microsoft OAuth (custom app registration). That's a follow-up phase.

## Architecture

```text
Browser (React + TanStack Start)
  │  TanStack Query
  ▼
Server functions (createServerFn)
  ├─ sync_inbox       → Outlook gateway (list /me/messages)
  ├─ process_email    → Lovable AI Gateway (gemini-3-flash) → structured JSON
  ├─ send_reply       → Outlook gateway (/me/sendMail)
  └─ list_emails      → Supabase (RLS by user_id)
        ▼
   Postgres
   - profiles
   - emails (raw + ai fields)
   - email_actions (reminders / next actions)
```

## Database

`emails` (id, user_id, message_id, thread_id, from_addr, from_name, subject, body_preview, received_at, summary, intent, urgency, key_details jsonb, suggested_reply, next_action, status, processed_at)

`email_actions` (id, email_id, user_id, type, due_at, done)

`profiles` (id, display_name)

RLS: every row scoped to `auth.uid()`.

## Routes

- `/` landing page (public)
- `/auth` login/signup
- `/_authenticated/app` dashboard layout w/ sidebar
  - `/app` inbox
  - `/app/email/$id` detail + reply
  - `/app/analytics`

## Design system

Linear-dark: bg `oklch(0.13 0.01 270)`, surface `oklch(0.17 0.012 270)`, primary `oklch(0.65 0.18 275)` (#5e6ad2-ish), text `oklch(0.95 0 0)`. Inter for UI, JetBrains Mono for IDs. Subtle 1px borders, no heavy shadows, generous whitespace, small caps section labels.

## Steps

1. Enable Lovable Cloud, link Outlook connector, ensure `LOVABLE_API_KEY`.
2. Migration: tables, RLS, grants.
3. Design tokens in `src/styles.css` + landing page.
4. Auth pages + `_authenticated` gate (already templated).
5. Server functions: `syncInbox`, `processEmail`, `listEmails`, `sendReply`.
6. Dashboard UI: sidebar, inbox list, detail panel, reply editor, analytics.
7. Verify end-to-end with Playwright + invoke-server-function.

Want me to proceed?