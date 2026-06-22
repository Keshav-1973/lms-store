import { locationLinks } from "@/data/locations";
import Link from "next/link";

export default function LocationsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Locations</h1>
        <p className="mt-3 text-sm text-slate-600">
          We're in multiple regions to support learners wherever they are.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {locationLinks.map((location) => (
            <Link
              key={location.label}
              href={location.href}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              {location.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
