"use client";

import { useRouter } from "next/navigation";

type StudentPurchase = {
  courseName: string;
  courseSlug: string;
  purchasedAt: string;
  amount: number;
  purchaseMethod: string;
};

type StudentSummary = {
  userId: string;
  email: string;
  totalPurchases: number;
  totalSpent: number;
  latestPurchase: StudentPurchase | null;
};

function currency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

type StudentsTableProps = {
  students: StudentSummary[];
};

export default function StudentsTable({ students }: StudentsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="divide-y divide-slate-100 md:hidden">
        {students.map((student) => (
          <button
            key={student.userId}
            type="button"
            className="w-full p-4 text-left transition hover:bg-slate-50"
            onClick={() => router.push(`/admin/students/${student.userId}`)}
          >
            <p className="truncate font-medium text-slate-900">
              {student.email}
            </p>
            <p className="truncate text-xs text-slate-400">{student.userId}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Purchases
                </p>
                <p className="font-medium text-slate-900">
                  {student.totalPurchases}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Total Spent
                </p>
                <p className="font-medium text-slate-900">
                  {currency(student.totalSpent)}
                </p>
              </div>
            </div>

            <div className="mt-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Latest Course
              </p>
              <p className="text-slate-700">
                {student.latestPurchase
                  ? student.latestPurchase.courseName
                  : "-"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {student.latestPurchase
                  ? student.latestPurchase.purchasedAt
                  : "-"}
              </p>
            </div>
          </button>
        ))}
      </div>

      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left">
            <th className="px-5 py-3.5 font-semibold text-slate-500">
              Student
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-500">
              Purchases
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-500">
              Total Spent
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-500">
              Latest Course
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-500">
              Last Purchase Date
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-500">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {students.map((student) => (
            <tr
              key={student.userId}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => router.push(`/admin/students/${student.userId}`)}
            >
              <td className="px-5 py-3">
                <p className="font-medium text-slate-900">{student.email}</p>
                <p className="text-xs text-slate-400">{student.userId}</p>
              </td>
              <td className="px-5 py-3 font-medium text-slate-900">
                {student.totalPurchases}
              </td>
              <td className="px-5 py-3 font-medium text-slate-900">
                {currency(student.totalSpent)}
              </td>
              <td className="px-5 py-3 text-slate-700">
                {student.latestPurchase
                  ? student.latestPurchase.courseName
                  : "-"}
              </td>
              <td className="px-5 py-3 text-slate-600">
                {student.latestPurchase
                  ? student.latestPurchase.purchasedAt
                  : "-"}
              </td>
              <td className="px-5 py-3 text-slate-600">Open</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
