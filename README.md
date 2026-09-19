# Proposal Generator

Open-source commercial proposal generator for freelancers and small digital-marketing agencies. Create branded, landing-page-style proposals with dynamic pricing plans and share each one with your client through a unique URL — replacing static PDFs that convert poorly.

Built for the Brazilian freelancer market (UI in Portuguese), self-hostable by anyone.

**Live demo:** https://app-chi-sooty-79.vercel.app

## Why

Existing proposal tools are paid SaaS products, mostly in English. Freelancers starting out end up sending proposals as PDFs or slide decks: hard to update, impossible to track, and unimpressive on a phone. This project gives them a free alternative they can deploy themselves:

- Each proposal is a polished landing page with its own shareable link
- Prices, plans and features are edited in a form, not in a design tool
- The client opens a professional page instead of downloading an attachment

## Features

**Dashboard**
- Create, edit and delete proposals
- Copy the client-facing link with one click
- Cards show creation date and number of pricing plans
- Loading skeletons, error state with retry, toast feedback on every action

**Proposal builder**
- Pre-filled template with sensible defaults for social-media management services
- Dynamic pricing plans: add/remove plans and per-plan feature lists
- Uploads for client logo, cover image, main creative and a carousel of past work (2MB limit per image)
- Inline validation with clear field-level error messages
- Optional AI-assisted text for expected results and custom notes

**Client-facing proposal page**
- Landing-page layout: hero with logo, strategy overview, pricing cards, creatives carousel, contact footer
- Unique URL per proposal (`/proposal/<id>`), plus a thank-you page
- WhatsApp / Instagram / e-mail contact links

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- [MongoDB](https://www.mongodb.com/) for storage
- API implemented as a single Next.js route handler (`app/api/[[...path]]/route.js`)

## Running locally

Requirements: Node.js 18+ and a MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier).

```bash
git clone https://github.com/MatheusPatric/proposal-generator.git
cd proposal-generator
cp .env.example .env   # edit MONGO_URL if needed
npm install
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URL` | yes | MongoDB connection string |
| `DB_NAME` | no | Database name (default: `proposal_generator`) |
| `NEXT_PUBLIC_BASE_URL` | no | Public URL used in shareable links |
| `CORS_ORIGINS` | no | Allowed CORS origins (set your domain in production) |

## Deploying (Vercel + MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), create a database user and allow access from anywhere (or Vercel's IPs).
2. Import this repository on [Vercel](https://vercel.com/new).
3. Set the environment variables above in the Vercel project settings (`MONGO_URL` from Atlas, `NEXT_PUBLIC_BASE_URL` = your deployment URL).
4. Deploy. Every push to `main` redeploys automatically.

## Roadmap

- [ ] Authentication so multiple freelancers can host one instance
- [ ] Proposal open/view tracking
- [ ] Accept/decline button on the proposal page
- [ ] Image storage on S3-compatible services instead of data URLs
- [ ] English UI translation

Contributions and suggestions are welcome — feel free to open an issue.

## License

[MIT](LICENSE)
