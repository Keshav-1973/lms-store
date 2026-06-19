# Copilot Workspace Instructions

- Use Next.js App Router patterns for server routes.
- Keep Supabase keys in `.env.local` and never commit secrets.
- Use `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` for Supabase access.
- Add API handlers under `src/app/api/**/route.ts`.
