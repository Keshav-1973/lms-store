import { createAdminClient } from "@/lib/supabase/admin";
import { Mail, ShoppingBag, UserRound } from "lucide-react";
import StudentsTable from "./students-table";

type EnrollmentRow = {
  user_id: string;
  enrolled_at: string;
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

type ProfileRow = {
  id: string;
  role: "admin" | "student";
};

type PendingPurchaseRow = {
  id: string;
  email: string;
  course_slug: string;
  stripe_session_id: string;
  purchase_method?: string;
  claimed: boolean;
  claimed_by_user_id: string | null;
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
  created_at: string;
};

type StudentSummary = {
  userId: string;
  email: string;
  totalPurchases: number;
  totalSpent: number;
  purchases: Array<{
    courseName: string;
    courseSlug: string;
    purchasedAt: string;
    amount: number;
    purchaseMethod: string;
  }>;
};

function extractCourse(courses: PendingPurchaseRow["courses"]) {
  if (!courses) {
    return null;
  }

  if (Array.isArray(courses)) {
    return courses[0] ?? null;
  }

  return courses;
}

function asDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

function buildStudentSummaries(
  studentIds: string[],
  purchases: PendingPurchaseRow[],
  emailByUserId: Map<string, string>,
) {
  const byUser = new Map<string, StudentSummary>();

  for (const studentId of studentIds) {
    byUser.set(studentId, {
      userId: studentId,
      email: emailByUserId.get(studentId) ?? "Unknown user",
      totalPurchases: 0,
      totalSpent: 0,
      purchases: [],
    });
  }

  for (const purchase of purchases) {
    const userId = purchase.claimed_by_user_id;

    if (!userId) {
      continue;
    }

    const course = extractCourse(purchase.courses);

    if (!course) {
      continue;
    }

    const existing = byUser.get(userId);

    if (!existing) {
      byUser.set(userId, {
        userId,
        email: emailByUserId.get(userId) ?? "Unknown user",
        totalPurchases: 1,
        totalSpent: Number(course.price),
        purchases: [
          {
            courseName: course.name,
            courseSlug: course.slug,
            purchasedAt: purchase.created_at,
            amount: Number(course.price),
            purchaseMethod: purchase.purchase_method ?? "unknown",
          },
        ],
      });
      continue;
    }

    existing.totalPurchases += 1;
    existing.totalSpent += Number(course.price);
    existing.purchases.push({
      courseName: course.name,
      courseSlug: course.slug,
      purchasedAt: purchase.created_at,
      amount: Number(course.price),
      purchaseMethod: purchase.purchase_method ?? "unknown",
    });
  }

  return Array.from(byUser.values()).sort((a, b) => {
    if (b.totalPurchases !== a.totalPurchases) {
      return b.totalPurchases - a.totalPurchases;
    }

    const latestA = a.purchases[0]?.purchasedAt ?? "";
    const latestB = b.purchases[0]?.purchasedAt ?? "";

    if (latestA !== latestB) {
      return latestB.localeCompare(latestA);
    }

    return a.email.localeCompare(b.email);
  });
}

export default async function AdminStudentsPage() {
  const supabase = createAdminClient();

  const loadPendingPurchases = async () => {
    const primary = await supabase
      .from("pending_purchases")
      .select(
        "id, email, course_slug, stripe_session_id, purchase_method, claimed, claimed_by_user_id, created_at, courses(name, slug, price)",
      )
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
          "id, email, course_slug, stripe_session_id, claimed, claimed_by_user_id, created_at, courses(name, slug, price)",
        )
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
    profilesResponse,
    enrollmentsResponse,
    pendingResponse,
    usersResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("id, role").eq("role", "student"),
    supabase
      .from("enrollments")
      .select("user_id, enrolled_at, courses(name, slug, price)")
      .order("enrolled_at", { ascending: false }),
    loadPendingPurchases(),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const profiles = (profilesResponse.data ?? []) as ProfileRow[];
  const enrollments = (enrollmentsResponse.data ?? []) as EnrollmentRow[];
  const pending = (pendingResponse.data ?? []) as PendingPurchaseRow[];
  const allUsers = usersResponse.data?.users ?? [];

  const emailByUserId = new Map<string, string>();

  for (const user of allUsers) {
    if (user.email) {
      emailByUserId.set(user.id, user.email);
    }
  }

  const studentIds = profiles.map((profile) => profile.id);
  const studentSummaries = buildStudentSummaries(
    studentIds,
    pending.filter((row) => row.claimed),
    emailByUserId,
  );
  const activePendingPurchases = pending.filter((row) => !row.claimed);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            View enrolled students and paid purchases waiting to be claimed.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Students
            </p>
            <p className="font-semibold text-slate-900">
              {studentSummaries.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Enrollments
            </p>
            <p className="font-semibold text-slate-900">{enrollments.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Pending Claims
            </p>
            <p className="font-semibold text-slate-900">
              {activePendingPurchases.length}
            </p>
          </div>
        </div>
      </div>

      {profilesResponse.error ||
      enrollmentsResponse.error ||
      usersResponse.error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {profilesResponse.error?.message ??
            enrollmentsResponse.error?.message ??
            usersResponse.error?.message}
        </div>
      ) : null}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">
            Registered Students and Purchases
          </h2>
        </div>

        {studentIds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No registered students yet.
          </div>
        ) : (
          <StudentsTable
            students={studentSummaries.map((student) => ({
              userId: student.userId,
              email: student.email,
              totalPurchases: student.totalPurchases,
              totalSpent: student.totalSpent,
              latestPurchase: student.purchases[0]
                ? {
                    ...student.purchases[0],
                    purchasedAt: asDateTime(student.purchases[0].purchasedAt),
                  }
                : null,
            }))}
          />
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">
            Guest Purchases Pending Claim
          </h2>
        </div>

        {pendingResponse.error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pendingResponse.error.message}
          </div>
        ) : null}

        {activePendingPurchases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No pending guest purchases.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3.5 font-semibold text-slate-500">
                    Email
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-500">
                    Course
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-500">
                    Paid At
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-500">
                    Stripe Session
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-500">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activePendingPurchases.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-3 text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {row.email}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {row.course_slug}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {asDateTime(row.created_at)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {row.stripe_session_id}
                    </td>
                    <td className="px-5 py-3 text-slate-600 capitalize">
                      {row.purchase_method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
