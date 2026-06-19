# my-store

Next.js project connected to Supabase.

## 1. Install and Run

```bash
npm install
npm run dev
```

## 2. Configure Supabase Connection

1. In Supabase, open your project and copy API values from Settings -> API.
2. Copy `.env.example` to `.env.local`.
3. Set:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SEED_SECRET="random-secret"
ADMIN_SETUP_SECRET="random-secret"
ALLOW_PRODUCTION_SEED="false"
ALLOW_PRODUCTION_ADMIN_SETUP="false"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 3. Test the API

Create a product:

```bash
curl -X POST http://localhost:3000/api/products \
	-H "Content-Type: application/json" \
	-d '{"name":"T-shirt","price":29.99}'
```

Read products:

```bash
curl http://localhost:3000/api/products
```

## Project Notes

- Supabase server/client helpers are in `src/lib/supabase`.
- API routes are thin handlers under `src/app/api/**/route.ts`.
- Business logic is grouped by domain under `src/features/**`.
- Shared runtime utilities are in `src/lib` (`env`, `http`, `auth`, `logger`).
- Home page includes quick run instructions in `src/app/page.tsx`.

## Verification

```bash
npm run lint
npm run build
```

CI runs the same checks on pull requests via `.github/workflows/ci.yml`.
