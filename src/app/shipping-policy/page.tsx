export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          How We Deliver Your Courses
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          When you sign up for a course, you'll get access via email right away.
          The exact date you can start depends on which course you pick. We'll
          confirm the start date when you place your order.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          After you sign up, we send you an order confirmation with a reference
          number. You can use that number to check on your order and reach out
          to us if you have questions.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We deliver course access via email on the timeline we promised when
          you signed up. If you pick one of our regular courses, you'll get
          access within 5 business days. If you need a customized program, it
          might take longer.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Keeping Track of Your Courses
            </h2>
            <p className="mt-2">
              We keep a copy of your course enrollment once we've set everything
              up.
            </p>
            <p className="mt-2">
              If you need access again or lost your login info, just let us know
              and we can resend it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Help When You Need It
            </h2>
            <p className="mt-2">
              We're here if you have questions or run into problems. You can
              reach us anytime, and we'll try to get back to you fast.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Questions?</h2>
            <p className="mt-2">
              If you want to know more about how we deliver courses or have any
              concerns, reach out to{" "}
              <a
                href="mailto:info@skillsolutionsllc.com"
                className="font-medium text-cyan-700 hover:underline"
              >
                info@skillsolutionsllc.com
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
