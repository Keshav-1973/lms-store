import Link from "next/link";

export default function CrmLoginPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">CRM Login</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          This page is reserved for internal operations and partner support
          teams. If you are a student, use your account login to access courses.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Student/Admin Login
          </Link>
          <Link
            href="/contact-us"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}
