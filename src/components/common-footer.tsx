import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { locationLinks } from "../data/locations";

const quickLinks = [
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Blogs", href: "/blogs" },
  { label: "CRM Login", href: "/crm-login" },
  { label: "Admin Login", href: "/login" },
];

const policyLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Shipping Policy",
    href: "/shipping-policy",
  },
  {
    label: "Refund & Return Policy",
    href: "/refund-policy",
  },
  {
    label: "Terms & Condition",
    href: "/terms-condition",
  },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "#",
  },
  {
    label: "Instagram",
    href: "#",
  },
  {
    label: "YouTube",
    href: "#",
  },
  {
    label: "Facebook",
    href: "#",
  },
];

function ExternalFooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-slate-300 transition hover:text-white"
    >
      {label}
    </Link>
  );
}

export function CommonFooter() {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-sm font-bold text-slate-950">
              SS
            </span>
            <span className="text-lg font-semibold text-white">
              SkillSolutions
            </span>
          </Link>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
            SkillSolutions offers a diverse range of online courses designed to
            empower students in software development, cybersecurity, data
            science, cloud, and modern AI workflows.
          </p>

          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>
                Online-first academy with mentors across the United States.
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-cyan-300" />
              <Link
                href="tel:+18053022666"
                className="transition hover:text-white"
              >
                +1 (805) 302 2666
              </Link>
            </p>
            <p>
              Email:{" "}
              <Link
                href="mailto:support@skillsolutions.academy"
                className="transition hover:text-white"
              >
                support@skillsolutions.academy
              </Link>
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {socialLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-cyan-300 hover:text-cyan-300"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-300">
            Quick Links
          </h3>
          <div className="mt-3 space-y-2">
            {quickLinks.map((item) => (
              <div key={item.label}>
                <ExternalFooterLink href={item.href} label={item.label} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-300">
            Policies
          </h3>
          <div className="mt-3 space-y-2">
            {policyLinks.map((item) => (
              <div key={item.label}>
                <ExternalFooterLink href={item.href} label={item.label} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-300">
            Locations
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {locationLinks.map((item) => (
              <ExternalFooterLink
                key={item.label}
                href={item.href}
                label={item.label}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-5 py-4 sm:px-8">
        <p className="mx-auto w-full max-w-7xl text-xs text-slate-400">
          Copyright 2026 SkillSolutions Academy | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
