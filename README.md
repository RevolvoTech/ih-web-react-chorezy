# Chorezy website

Official public website and United States launch waitlist for [Chorezy](https://chorezy.com).

## What lives here

- Chorezy marketing and waitlist experience
- United States ZIP-code qualification
- Vercel IP-country gate for the United States launch market
- Safety, privacy, and waitlist-terms pages
- Legacy verification, reset, and invitation deep-link compatibility
- Versioned email artwork served from `/email/v1/` for backend templates
- Next.js route handler for writing to the existing Supabase `choreify_waitlist` table
- Cached aggregate endpoint for the public U.S. waitlist count
- Canonical metadata, Open Graph tags, JSON-LD, `robots.txt`, and `sitemap.xml`

The legacy database table and `CF-XXXXXX` referral format are intentionally retained so existing records and database constraints do not need to move. Public branding uses Chorezy.

## Local development

```bash
npm install
npm run dev
```

To exercise the waitlist route locally, copy the environment template and start Next.js:

```bash
cp .env.example .env
npm run dev
```

Never commit `.env` or Supabase service-role credentials.

## Production environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Existing Revolvo Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only insert access for the waitlist function |
| `REFERRAL_SALT` | Secret salt for deterministic legacy-compatible `CF-` referral codes |
| `SUPABASE_ANON_KEY` | Optional; reserved for future public read-only features |
| `NEXT_PUBLIC_API_BASE_URL` | Optional until the public site calls the Chorezy API; normally `https://api.chorezy.com` |

## Deployment

1. Import `RevolvoTech/ih-web-react-chorezy` into Vercel.
2. Set the variables above in the production environment.
3. Add `chorezy.com` and `www.chorezy.com` to the production environment.
4. Add the DNS records Vercel supplies and choose the preferred canonical domain.
5. Confirm `/api/waitlist`, `/robots.txt`, `/sitemap.xml`, and the four public pages after deployment.
6. Enable Web Analytics in the Vercel project dashboard.

Vercel deploys the Next.js route handler at `/api/waitlist` and provides the
`x-vercel-ip-country` header used by the United States launch gate.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

Next.js pre-renders the indexed pages and generates the robots and sitemap routes. The build fails if legacy Choreo/Choreify domains or names leak into indexed SEO output.

## Backend domain

The public API is live at `https://api.chorezy.com`. Caddy routes that domain to
the Chorezy backend managed by the shared VPS platform repository.
