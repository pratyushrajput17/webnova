# WebNova

AI-powered website intelligence platform. Analyze, optimize, and grow your website with instant SEO audits, competitor insights, performance analysis, and AI-driven recommendations.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui, Framer Motion v12, Lucide, Recharts
- **Auth:** Clerk v7
- **Database:** PostgreSQL (Neon) + Prisma 7
- **Payments:** Razorpay
- **Email:** Resend + React Email
- **PDF:** @react-pdf/renderer

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` (if available) or configure:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `DIRECT_URL` — Neon direct connection for migrations
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk test/public key
- `CLERK_SECRET_KEY` — Clerk secret key
- `RESEND_API_KEY` — Resend email API key
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay keys

## Build

```bash
npm run build
```
