export default function AboutPage() {
  const advantages = [
    {
      title: "Diversity & Inclusion Matters",
      body: "Shef Solutions LLC is known for cohorts of students from diverse backgrounds, from degree holders to non-degree holders. We transform skills and prepare industry-ready professionals across the globe.",
    },
    {
      title: "Accelerated Education",
      body: "Our programs are immersive and accelerated, with options to learn full-time or on a flexible pace schedule so students can move quickly toward a new career.",
    },
    {
      title: "Individualized Career Coaching",
      body: "Students can get up to 60 days of 1-on-1 career coaching, including resume reviews, mock interviews, personal branding, and interview strategy.",
    },
    {
      title: "Industry Partnerships",
      body: "Our Employer Partnerships Team continuously builds robust employer pipelines for Shef Solutions LLC alumni.",
    },
    {
      title: "Innovation at the Core",
      body: "Learning something new can be challenging. We use blended and project-based learning to build practical skills through pair programming, group projects, and 1-on-1 mentoring.",
    },
    {
      title: "Award-Winning Pedagogy",
      body: "Our curriculum is reviewed regularly by industry professionals to keep it aligned with in-demand job skills.",
    },
    {
      title: "Removing Barriers",
      body: "Programs are beginner-friendly and built for all backgrounds. We also offer weekend and flexible-pace options for busy learners.",
    },
    {
      title: "Job Assurance",
      body: "Our accelerated programs, coaching support, and industry collaborations are designed to help learners become career-ready with confidence.",
    },
  ];

  const testimonials = [
    {
      name: "Safwan",
      quote:
        "I was able to learn machine learning successfully because of the wonderful instructors and high-quality training materials like notes, videos, assignments, and projects. They responded to my doubts very quickly.",
    },
    {
      name: "Vaishali",
      quote:
        "The course was structured in a way that made it easy to keep up. I especially liked how linear regression and calculus were introduced with visual examples and strong concept building.",
    },
    {
      name: "Darrel Green",
      quote:
        "The quality of the course material was excellent, and assignments and projects were set at an appropriate difficulty level.",
    },
    {
      name: "Mark Stapay",
      quote:
        "I had no prior programming experience but still understood Python and machine learning concepts quickly because of how well the content was crafted.",
    },
    {
      name: "Swathish",
      quote:
        "A very useful course overall, from data science basics to advanced machine learning. The instructor explained clearly and supported us hands-on during projects.",
    },
    {
      name: "Ramadoss",
      quote:
        "I was excited to learn data science and also worried about virtual learning, but the course delivery made the experience smooth and effective.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">About Us</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          As a leader in the education industry, Shef Solutions LLC believes
          education is the best investment in the future. We are committed to
          changing lives and the world for the better.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Our courses offer a comprehensive, results-oriented curriculum for
          students pursuing careers in software development, cybersecurity, data
          science, product design, and more. Courses are offered both online and
          in-person across global locations.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Shef Solutions LLC is recognized as a top education provider with a
          presence in over 60 countries. Beyond student programs, we also
          provide targeted educational solutions for organizations.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          With offices in seven countries, 500+ employees, and more than 100,000
          student enrollments in the last 12 months, Shef Solutions LLC is a
          strong force in the global professional education market.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-2xl font-bold text-slate-900">12.6K</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Student Enrolled
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-2xl font-bold text-slate-900">70.5K</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Class Completed
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-2xl font-bold text-slate-900">96.2%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Satisfaction Rate
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-2xl font-bold text-slate-900">100+</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Top Instructors
            </p>
          </article>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            The Shef Solutions LLC Advantage
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {advantages.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Our Mission
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              LEARN, GROW, and EXCEL are the core values of every individual at
              Shef Solutions LLC.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Our mission is to be the most preferred destination for quality
              education in the virtual campus and to demonstrate extraordinary
              commitment to every learner we serve.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We endeavor to provide a world-class learning experience for
              students and working professionals with growth in knowledge,
              personality, confidence, work ethics, professionalism, and
              motivation.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Our Vision
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              <li>
                To become a globally renowned one-stop household brand for
                lifelong learning.
              </li>
              <li>
                To overcome hurdles in virtual education and prepare society for
                online learning excellence.
              </li>
              <li>
                To be widely acclaimed for transforming society through
                education and innovation.
              </li>
              <li>
                To create differentiated education models focused on building
                better career prospects for every individual.
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900">About Owner</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Welcome to Shef Solutions LLC. We believe in the power of leadership
            and innovation. The driving force behind our success is Deepanshu
            Chaudhary.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Deepanshu Chaudhary is the founder and sole stockholder of Shef
            Solutions LLC. His vision for excellence and commitment to quality
            has shaped the company since inception.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Established on February 9, 2019, Shef Solutions LLC has grown under
            his leadership through a culture of innovation, collaboration, and
            integrity, with a focus on exceeding expectations and driving
            measurable growth.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            What Our Students Have To Say
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Our students&apos; voices are central to everything we improve, from
            teaching quality to course delivery and support systems.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {testimonials.map((item, index) => (
              <blockquote
                key={`${item.name}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-sm leading-relaxed text-slate-700">
                  “{item.quote}”
                </p>
                <footer className="mt-3 text-sm font-semibold text-slate-900">
                  {item.name}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Specializations and Professional Certificates
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Explore our most popular programs to get job-ready for in-demand
            careers.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Microsoft DP-100 Professional Certificate</li>
            <li>Data Science and AI Career Pathway</li>
            <li>Cybersecurity and Cloud Career Pathway</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
