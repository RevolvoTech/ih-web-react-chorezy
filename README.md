# Chorezy website

Official public website and North America launch waitlist for [Chorezy](https://chorezy.com).

## What lives here

- Chorezy marketing and waitlist experience
- United States and Canada postal-code qualification
- Safety, privacy, and waitlist-terms pages
- Legacy verification, reset, and invitation deep-link compatibility
- Versioned email artwork served from `/email/v1/` for backend templates
- Next.js route handler for writing to the existing Supabase `choreify_waitlist` table
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

## Netlify environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Existing Revolvo Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only insert access for the waitlist function |
| `REFERRAL_SALT` | Secret salt for deterministic legacy-compatible `CF-` referral codes |
| `SUPABASE_ANON_KEY` | Optional; reserved for future public read-only features |
| `NEXT_PUBLIC_API_BASE_URL` | Optional until the public site calls the Chorezy API; normally `https://api.chorezy.com` |

## Deployment

1. Import `RevolvoTech/ih-web-react-chorezy` into Netlify.
2. Set the variables above in the production environment.
3. Add `chorezy.com` as the primary domain and `www.chorezy.com` as an alias.
4. Replace the registrar parking records with the DNS records Netlify supplies.
5. Confirm `/api/waitlist`, `/robots.txt`, `/sitemap.xml`, and the four public pages after deployment.

The root `netlify.toml` runs the Next.js build, redirects `www` to the apex domain, and applies security headers. Netlify deploys the Next.js route handler at `/api/waitlist`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

Next.js pre-renders the indexed pages and generates the robots and sitemap routes. The build fails if legacy Choreo/Choreify domains or names leak into indexed SEO output.

## Backend domain

The public API is moving from `api.revolvo.tech` to `api.chorezy.com`. DNS must point `api.chorezy.com` to the VPS before Caddy can obtain the TLS certificate. The platform service manifest and application configuration should be updated in the backend/platform repositories as part of that cutover.
