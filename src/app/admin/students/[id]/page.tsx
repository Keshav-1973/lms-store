import { createAdminClient } from "@/lib/supabase/admin";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type PurchaseRow = {
  id: string;
  course_slug: string;
  purchase_method?: string;
  stripe_session_id: string;
  created_at: string;
  courses:
    | {
        name: string;
        slug: string;
        price: number;
      }
    | Array<{
        name: string;
        slug: string;
        price: number;
      }>
    | null;
};

type UserSummary = {
  email: string;
  totalPurchases: number;
  totalSpent: number;
};

function extractCourse(courses: PurchaseRow["courses"]) {
  if (!courses) {
    return null;
  }

  if (Array.isArray(courses)) {
    return courses[0] ?? null;
  }

  return courses;
}

function asDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

function currency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default async function AdminStudentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const loadPurchases = async () => {
    const primary = await supabase
      .from("pending_purchases")
      .select(
        "id, course_slug, purchase_method, stripe_session_id, created_at, courses(name, slug, price)",
      )
      .eq("claimed", true)
      .eq("claimed_by_user_id", id)
      .order("created_at", { ascending: false });

    if (
      primary.error &&
      primary.error.message
        .toLowerCase()
        .includes("pending_purchases.purchase_method")
    ) {
      const fallback = await supabase
        .from("pending_purchases")
        .select(
          "id, course_slug, stripe_session_id, created_at, courses(name, slug, price)",
        )
        .eq("claimed", true)
        .eq("claimed_by_user_id", id)
        .order("created_at", { ascending: false });

      return {
        data: (fallback.data ?? []).map((row) => ({
          ...row,
          purchase_method: "unknown",
        })),
        error: fallback.error,
      };
    }

    return primary;
  };

  const [
    { data: usersData, error: usersError },
    { data: purchases, error: purchasesError },
  ] = await Promise.all([supabase.auth.admin.getUserById(id), loadPurchases()]);

  const rows = (purchases ?? []) as PurchaseRow[];

  const summary: UserSummary = {
    email: usersData.user?.email ?? "Unknown user",
    totalPurchases: rows.length,
    totalSpent: rows.reduce((sum, row) => {
      const course = extractCourse(row.courses);
      return sum + Number(course?.price ?? 0);
    }, 0),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <Link
        href="/admin/students"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Link>

      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          Student Purchase Details
        </h1>
        <p className="mt-1 text-sm text-slate-600">{summary.email}</p>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total Purchases
            </p>
            <p className="font-semibold text-slate-900">
              {summary.totalPurchases}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total Spent
            </p>
            <p className="font-semibold text-slate-900">
              {currency(summary.totalSpent)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Student ID
            </p>
            <p className="font-semibold text-slate-900 break-all">{id}</p>
          </div>
        </div>
      </div>

      {usersError || purchasesError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {usersError?.message ?? purchasesError?.message}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No purchases recorded for this student yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Course
                </th>
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Amount
                </th>
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Method
                </th>
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Purchased On
                </th>
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Stripe Session
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => {
                const course = extractCourse(row.courses);

                return (
                  <tr key={row.id}>
                    <td className="px-5 py-3 text-slate-700">
                      <p className="font-medium text-slate-900">
                        {course?.name ?? row.course_slug}
                      </p>
                      <p className="text-xs text-slate-400">
                        {row.course_slug}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {currency(Number(course?.price ?? 0))}
                    </td>
                    <td className="px-5 py-3 text-slate-700 capitalize">
                      {row.purchase_method}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {asDate(row.created_at)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {row.stripe_session_id}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
