export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          We care about protecting your privacy. This policy explains how we
          collect information from you, what we do with it, and how to control
          what we share.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          If you have questions about your data, you can ask us to show you what
          we have, delete certain information, or stop using it in certain ways.
          We only collect what we need to provide the service you signed up for.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Any terms you see here that aren't defined have the same meaning as
          they do in our Terms and Conditions.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          When we talk about personal data here, we're including sensitive
          information like financial data, health information, or identification
          numbers — basically anything that could identify you or tell us
          something specific about you.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Information We Collect
            </h2>
            <p className="mt-2">
              When you use our website, we may collect various types of
              information, including:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">Personal Information:</span>
                Name, email address, phone number, address, and similar details
                you provide when creating an account, making a purchase, or
                otherwise interacting with our services.
              </li>
              <li>
                <span className="font-medium">Usage Information:</span> IP
                address, browser type, device information, pages visited, and
                other usage data.
              </li>
              <li>
                <span className="font-medium">
                  Cookies and Tracking Technologies:
                </span>
                We use cookies and similar technologies to understand browsing
                behavior, personalize your experience, analyze trends, and
                improve services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              How We Use Your Information
            </h2>
            <p className="mt-2">
              We may use collected information for the following purposes:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">
                  Providing and improving services:
                </span>
                To deliver requested services and improve website and mobile
                experiences.
              </li>
              <li>
                <span className="font-medium">Communicating with you:</span> To
                send updates, newsletters, promotional materials, and other
                service-related communications.
              </li>
              <li>
                <span className="font-medium">Personalization:</span> To tailor
                content and advertisements to your interests.
              </li>
              <li>
                <span className="font-medium">Analytics:</span> To analyze usage
                and improve user experience.
              </li>
              <li>
                <span className="font-medium">Legal Compliance:</span> To comply
                with laws, regulations, legal process, or governmental requests.
              </li>
              <li>
                <span className="font-medium">Business Transfers:</span> If we
                are involved in a merger, acquisition, or asset sale, your
                information may be transferred as part of that transaction.
              </li>
            </ul>

            <p className="mt-4">
              No mobile information will be shared with third parties or
              affiliates for marketing or promotional purposes. All other
              categories exclude text messaging originator opt-in data and
              consent; this information will not be shared with any third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Security</h2>
            <p className="mt-2">
              We take reasonable measures to protect your information from
              unauthorized access, disclosure, alteration, or destruction.
              However, no method of transmission over the internet or electronic
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Your Choices
            </h2>
            <p className="mt-2">
              You may access, update, or delete your personal information. You
              can also opt out of promotional communications by following the
              unsubscribe instructions in those communications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              Changes to this Privacy Policy
            </h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. If material
              changes are made, we will notify users by posting the updated
              policy on our website or mobile applications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
            <p className="mt-2">
              If you have questions or concerns about this Privacy Policy,
              contact us at{" "}
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
