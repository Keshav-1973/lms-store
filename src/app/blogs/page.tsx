import Link from "next/link";

const posts = [
  {
    slug: "how-to-start-data-science",
    title: "How to Start Data Science in 2026",
    excerpt: "A practical roadmap from fundamentals to portfolio projects.",
  },
  {
    slug: "cybersecurity-beginners-guide",
    title: "Cybersecurity Beginner Guide",
    excerpt: "Core concepts, learning order, and first hands-on labs.",
  },
  {
    slug: "build-your-first-ai-app",
    title: "Build Your First AI App",
    excerpt: "From prompt design to a working project in one weekend.",
  },
];

export default function BlogsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Blogs</h1>
        <p className="mt-3 text-sm text-slate-600">
          Learning guides and career insights from the SkillSpring team.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
              <Link
                href="#"
                className="mt-4 inline-block text-sm font-semibold text-cyan-700 hover:underline"
              >
                Read more
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
