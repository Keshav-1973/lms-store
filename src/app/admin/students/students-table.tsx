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
      <table className="w-full text-sm">
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
