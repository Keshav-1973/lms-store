export default function AboutPage() {
  const advantages = [
    {
      title: "We Hire People from All Backgrounds",
      body: "You don't need a fancy degree to get in. We work with people who have degrees, people who don't, and everyone in between. The goal is simple: get you job-ready.",
    },
    {
      title: "Fast-Track Learning",
      body: "Our programs are designed to be intense but doable. If you want to go full-time, go full-time. If you need to fit it around your job, there's a flexible schedule for that too.",
    },
    {
      title: "One-on-One Career Help",
      body: "You get up to 60 days of personal help from someone who knows the job market. We'll work on your resume, do practice interviews, help you figure out your personal brand, and talk through interview strategy.",
    },
    {
      title: "We Have Connections with Employers",
      body: "We spend time building relationships with companies that are actually hiring. That means better chances for our graduates.",
    },
    {
      title: "Learning That Actually Sticks",
      body: "We don't just lecture at you. You'll work on real projects with other students, pair program with classmates, and get hands-on help from mentors. That's how you actually learn.",
    },
    {
      title: "We Keep the Curriculum Fresh",
      body: "Industry experts review our courses regularly to make sure we're teaching skills that companies are actually looking for right now.",
    },
    {
      title: "Flexible Options for Busy People",
      body: "Our courses are built for beginners. We offer weekend options and flexible pacing so you can learn even if you've got a full schedule.",
    },
    {
      title: "You'll Actually Get a Job",
      body: "Our programs, the coaching, and our employer relationships are all focused on one thing: getting you confident and ready for a real job.",
    },
  ];

  const testimonials = [
    {
      name: "Alex C.",
      quote:
        "Great instructors who actually respond fast when you have questions. The materials were top notch - videos, practice problems, everything was well organized. I felt ready to job hunt.",
    },
    {
      name: "Jennifer L.",
      quote:
        "The structure made it so easy to follow along and keep up. I liked how they broke down complex math and programming concepts with real examples. Didn't feel overwhelming.",
    },
    {
      name: "David K.",
      quote:
        "Really solid course materials. The projects were challenging but fair. They didn't make it too easy, which I respected because I wanted to actually learn something.",
    },
    {
      name: "Rachel M.",
      quote:
        "I had zero coding background when I started. Somehow I picked up Python and machine learning pretty quickly. The instructors explained things clearly and actually cared.",
    },
    {
      name: "Chris T.",
      quote:
        "Solid program from start to finish. Went from basics all the way to advanced machine learning. Great instruction and hands-on support during projects.",
    },
    {
      name: "Lisa D.",
      quote:
        "I was skeptical about learning online, worried I'd fall behind. But the way they structure everything made it work smoothly. I feel confident now.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">About Us</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          We believe that good education opens doors. If you want to switch
          careers, pick up new skills, or level up in tech, we're here to help
          you actually do it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We teach practical stuff in areas like software development, web dev,
          cybersecurity, and data science. Whether you prefer learning live with
          others or at your own pace, we have options. All our courses are
          online, so you can learn from anywhere.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Skill Solutions has grown into a real institution serving people
          across more than 60 countries. We also work with companies who want to
          upskill their teams.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Right now, we've got offices in seven countries, over 500 team
          members, and we've helped more than 100,000 people learn new tech
          skills in the last year. We're not huge, but we're growing fast and
          we're making a difference.
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
            The Skill Solutions LLC Advantage
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
              We're focused on three things: help people learn, help them grow,
              and help them succeed. That's what drives everything we do at
              Skill Solutions.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We want to be the place people think of when they need real,
              practical tech training. We take seriously the fact that your time
              matters, so we do everything we can to deliver something worth it.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We try to build students up in every way: your knowledge, your
              confidence, your work habits, how you act professionally, and your
              motivation. It's about more than just knowing code.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Our Vision
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              <li>
                Become a name people know and trust for education that actually
                helps you move forward in your career.
              </li>
              <li>
                Figure out how to make online learning work really well, because
                it's not easy but it's important.
              </li>
              <li>
                Be known for actually changing people's lives through education
                and trying new ways to teach.
              </li>
              <li>
                Create different ways of learning that are built around helping
                you have a better shot at getting where you want to be.
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            About Our Founder
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We're a company built on the idea that good leadership and
            willingness to try new things matters.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We started Skill Solutions on February 9, 2019. Since then, we've
            grown because we focus on treating people fairly, working together,
            and being honest. We try to do what we say we'll do and look for
            ways to keep getting better.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            What Our Students Have To Say
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Our students' feedback keeps us honest. We listen to what works and
            what doesn't, and we use that to get better at teaching, how we
            deliver courses, and how we support people.
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
