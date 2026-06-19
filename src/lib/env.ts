import "server-only";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  seedSecret: process.env.SEED_SECRET ?? "",
  allowProductionSeed: process.env.ALLOW_PRODUCTION_SEED === "true",
  adminSetupSecret: process.env.ADMIN_SETUP_SECRET ?? "",
  allowProductionAdminSetup:
    process.env.ALLOW_PRODUCTION_ADMIN_SETUP === "true",
};

export function getSupabasePublicEnv() {
  return {
    supabaseUrl: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getSupabaseServiceRoleKey() {
  return getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getStripeSecretKey() {
  return getRequiredEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function isProduction() {
  return env.nodeEnv === "production";
}
