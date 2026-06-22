export default function RefundPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Refund Policy</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          At <span className="font-semibold">SkillSolutions Academy</span>, we
          are committed to delivering a positive and enriching learning
          experience for both online and classroom-style training. We understand
          that plans can change, so this policy explains our cancellation and
          refund terms in a transparent way.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          By purchasing a course, you agree to our Privacy Policy, Terms &
          Condition, and the refund terms listed below.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Long-Term Courses (6 Months and Above)
            </h2>

            <h3 className="mt-4 font-semibold text-slate-900">
              1. How to Cancel
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                If you need to cancel your enrollment, notify us in person, by
                email, by certified mail, or through direct communication.
              </li>
              <li>
                Cancellation is effective on the date the notice is received or
                postmarked.
              </li>
            </ul>

            <h3 className="mt-4 font-semibold text-slate-900">
              2. Refund Terms
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">Full refund:</span> If your
                application is not accepted, or if you cancel within three
                business days of signing the agreement and making the initial
                payment.
              </li>
              <li>
                If the course is not satisfactory or you request cancellation
                for another reason, access will be removed and charges will
                apply only for the number of classes attended.
              </li>
              <li>
                <span className="font-medium">Before classes begin:</span>
                After admission but before the first class, all paid amounts are
                refunded except the registration fee (capped at $99).
              </li>
              <li>
                <span className="font-medium">During drop/add period:</span>
                If you withdraw during the first week of classes, all tuition
                and fees are refunded except the registration fee.
              </li>
              <li>
                <span className="font-medium">After drop/add period:</span>
                No refund is issued after the first week of classes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Short-Term Courses (Less Than 6 Months)
            </h2>

            <h3 className="mt-4 font-semibold text-slate-900">
              Classroom Training / Instructor-Led Online Training
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">Provider cancellations:</span>
                If we postpone or cancel due to low enrollment, instructor
                illness, or force majeure events, a 100% refund is provided.
              </li>
              <li>
                <span className="font-medium">
                  Delegate cancellations 7+ days before event:
                </span>
                90% refund (10% retained as processing fee).
              </li>
              <li>
                <span className="font-medium">
                  Delegate cancellations less than 7 days:
                </span>
                No refund.
              </li>
            </ul>

            <h3 className="mt-4 font-semibold text-slate-900">
              Online Training
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">
                  Within 48 hours of subscription:
                </span>
                95% refund (5% retained as administration fee).
              </li>
              <li>
                <span className="font-medium">After 48 hours:</span> No refund.
              </li>
              <li>
                <span className="font-medium">Third-party courses:</span> 50%
                refund if canceled within 48 hours; no refund after 48 hours.
              </li>
              <li>
                <span className="font-medium">USA consumer protection:</span>
                USA customers are entitled to a full refund within 14 days of
                purchase if content has not been accessed or consumed.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Duplicate Payment
            </h2>
            <p className="mt-2">
              If duplicate payment is made by mistake, we will refund the extra
              charge through the original payment method within 5 to 7 working
              days after notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              General Processing Timeline
            </h2>
            <p className="mt-2">
              All approved refunds are processed within 30 days of receiving a
              valid refund request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Contact for Refund Support
            </h2>
            <p className="mt-2">
              For any questions or assistance, contact our support team at{" "}
              <a
                href="mailto:support@skillsolutions.academy"
                className="font-medium text-cyan-700 hover:underline"
              >
                support@skillsolutions.academy
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
