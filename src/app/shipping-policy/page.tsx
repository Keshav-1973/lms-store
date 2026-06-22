export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Definitions of Shipping Policy
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          All The Educational Tools order files are delivered via email as per
          the date specified on the Order Confirmation. All policies pertaining
          to revision and refund are subject to the date and time of The
          Educational Tools order delivered to client via email.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We provide The Educational Tools order reference number soon after the
          order is placed, so that the customer may track order status and post
          revisions against that reference number.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We deliver all customized The Educational Tools orders via email
          depending on the timeline committed at the time of placing the order.
          If you choose one of our predefined systems, you may get the Education
          Tool within 5 business days. For customized education management
          systems, the timeline may vary.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Record Maintenance
            </h2>
            <p className="mt-2">
              We keep a record of your finalized The Educational Tools once we
              provide final files.
            </p>
            <p className="mt-2">
              If you require the final files again in the future, we can resend
              them on request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Customer Support
            </h2>
            <p className="mt-2">
              We offer 24-hour customer support to address your queries and
              questions. You can contact us any time, and we aim to respond
              promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
            <p className="mt-2">
              If you have any questions or concerns about this Shipping Policy,
              please contact us at{" "}
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
