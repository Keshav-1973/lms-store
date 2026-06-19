export const locationLinks = [
  { label: "San Francisco", href: "/locations/san-francisco" },
  { label: "Chicago", href: "/locations/chicago" },
  { label: "Houston", href: "/locations/houston" },
  { label: "New Jersey", href: "/locations/new-jersey" },
  { label: "Los Angeles", href: "/locations/los-angeles" },
  { label: "California", href: "/locations/california" },
  { label: "Texas", href: "/locations/texas" },
  { label: "New York", href: "/locations/new-york" },
  { label: "Dallas", href: "/locations/dallas" },
  { label: "Florida", href: "/locations/florida" },
] as const;

export const locationPages = {
  "san-francisco": {
    name: "San Francisco",
    summary:
      "Data science and AI focused cohorts with live mentorship for Bay Area learners.",
  },
  chicago: {
    name: "Chicago",
    summary:
      "Practical full-stack and analytics tracks with strong project and interview prep support.",
  },
  houston: {
    name: "Houston",
    summary:
      "Career transition pathways in cloud, cybersecurity, and data engineering.",
  },
  "new-jersey": {
    name: "New Jersey",
    summary:
      "Weekend-first schedules for working professionals pursuing modern tech skills.",
  },
  "los-angeles": {
    name: "Los Angeles",
    summary:
      "Creator-friendly tech programs blending product thinking with software fundamentals.",
  },
  california: {
    name: "California",
    summary:
      "Statewide online cohorts with hiring-ready capstone projects and mentor reviews.",
  },
  texas: {
    name: "Texas",
    summary:
      "Industry-aligned training for software, AI, and cloud roles across major Texas hubs.",
  },
  "new-york": {
    name: "New York",
    summary:
      "Fast-paced learning plans built for ambitious learners and startup-minded teams.",
  },
  dallas: {
    name: "Dallas",
    summary:
      "Hands-on pathways for analytics and full-stack development with portfolio focus.",
  },
  florida: {
    name: "Florida",
    summary:
      "Flexible online-first bootcamp support for students and professionals across Florida.",
  },
} as const;

export type LocationSlug = keyof typeof locationPages;
