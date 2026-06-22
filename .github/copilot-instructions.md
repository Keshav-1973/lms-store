# Copilot Workspace Instructions

- Use Next.js App Router patterns for server routes.
- Keep Supabase keys in `.env.local` and never commit secrets.
- Use `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` for Supabase access.
- Add API handlers under `src/app/api/**/route.ts`.
- For any UI confirmation dialog, use `ConfirmPopup` from `src/components/confirm-popup.tsx`.
- Do not use browser-native `confirm()`, `alert()`, or custom ad-hoc modal markup for confirm flows.
- If a confirm popup is needed in a client component, wire open/cancel/confirm state around `ConfirmPopup` and submit the intended action only after user confirmation.
