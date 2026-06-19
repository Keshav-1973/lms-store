import Link from "next/link";
import ContactMailForm from "./contact-mail-form";

export default function ContactUsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
        <p className="mt-4 text-sm text-slate-600">
          Reach out for admissions, curriculum, partnerships, or learner
          support.
        </p>

        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <p>
            Email:{" "}
            <Link
              href="mailto:support@skillspring.academy"
              className="text-cyan-700 hover:underline"
            >
              support@skillspring.academy
            </Link>
          </p>
          <p>
            Phone:{" "}
            <Link
              href="tel:+18889277072"
              className="text-cyan-700 hover:underline"
            >
              +1 (888) 927 7072
            </Link>
          </p>
          <p>Hours: Mon - Fri, 9:00 AM - 6:00 PM (US time zones)</p>
        </div>

        <ContactMailForm />
      </section>
    </main>
  );
}
