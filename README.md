# FS Custom Flooring — Appointment & QR Platform

Appointment booking system for a flooring/remodeling business. Customers scan a QR code, land on the site, and book an appointment. Admin manages everything from a dashboard.

## Tech Stack

- **Next.js 15** (App Router, Server Actions)
- **Supabase** (Postgres, Auth, RLS)
- **TypeScript** (strict mode)
- **Tailwind CSS + shadcn/ui**
- **React Email + Resend** (transactional emails)
- **Zod** (validation)

## What's Built

### Customer-Facing
- Landing page with business info and booking CTA
- Multi-step booking wizard (project type, property type, date/time, contact info)
- Confirmation page with add-to-calendar support
- QR code redirect routes (`/r/[slug]`)

### Admin Dashboard (`/admin`)
- Appointment calendar with month view, day detail panel, and appointment pills
- Quick Book — create a confirmed appointment in seconds for walk-in customers
- Appointment detail dialog with status management and admin notes
- Availability manager (time slot configuration by day of week)
- QR code manager (create, edit, track scans)
- Email system (confirmation, reminders, follow-ups) with settings panel
- Dashboard stats and analytics

### Infrastructure
- Supabase auth with middleware-protected admin routes
- Server actions for all mutations
- Email templates with React Email

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in Supabase URL, anon key, service role key, Resend API key

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | Resend API key for emails |

## Content TODO

> The app structure and features are solid. The next priority is **real content and imagery** across the entire site:

- Replace placeholder text on landing page with actual business copy
- Add real project photos (kitchen, bathroom, flooring portfolio)
- Add business logo, favicon, and Open Graph images
- Write proper meta descriptions for SEO
- Add testimonials / customer reviews section
- Before/after photo galleries for each project type

---

## Deploy

Deploy on [Vercel](https://vercel.com):

```bash
npx vercel
```

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
