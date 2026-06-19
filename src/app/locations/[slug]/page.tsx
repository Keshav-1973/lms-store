import { locationPages, type LocationSlug } from "@/data/locations";
import Link from "next/link";
import { notFound } from "next/navigation";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocationDetailPage({
  params,
}: LocationPageProps) {
  const { slug } = await params;
  const location = locationPages[slug as LocationSlug];

  if (!location) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
          Location
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {location.name}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {location.summary}
        </p>

        <div className="mt-6">
          <Link
            href="/locations"
            className="text-sm font-semibold text-cyan-700 hover:underline"
          >
            Back to all locations
          </Link>
        </div>
      </section>
    </main>
  );
}
