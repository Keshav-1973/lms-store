import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import SetupAdminForm from "./setup-admin-form";

export default async function SetupAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/setup-admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-12 sm:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Setup</h1>
      <p className="mt-1 text-sm text-slate-500">
        Promote your currently logged-in account to admin using a setup secret.
      </p>

      {isAdmin ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-800">
            This account is already an admin.
          </p>
          <Link
            href="/admin/courses"
            className="mt-3 inline-flex rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Open Admin Courses
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <SetupAdminForm />
        </div>
      )}
    </main>
  );
}
