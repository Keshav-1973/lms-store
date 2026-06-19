export type ProductModule = {
  title: string;
  description: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  descriptionDetailed: string;
  price: number;
  compareAtPrice: number;
  category: string;
  rating: number;
  reviewCount: number;
  downloads: string;
  modules: ProductModule[];
  accent: string;
  included: string[];
  outcomes: string[];
};

export const products: Product[] = [
  {
    slug: "data-science-and-ai-course",
    name: "Data Science and AI Course",
    tagline:
      "Master Python, ML algorithms, and AI tools used by top tech companies.",
    description:
      "Learn Python, machine learning, data analysis, and AI workflows through guided projects from beginner to job-ready.",
    descriptionDetailed:
      "Go from beginner to job-ready with hands-on projects in machine learning, deep learning, data visualization, and generative AI. Built for aspiring data scientists and analysts.",
    price: 39,
    compareAtPrice: 59,
    category: "Data Science",
    rating: 4.9,
    reviewCount: 184,
    downloads: "4.2K+",
    modules: [
      {
        title: "Python Programming",
        description:
          "Learn core syntax, data types, functions, and scripting basics.",
      },
      {
        title: "Libraries of Python Programming with EDA",
        description:
          "Use NumPy, Pandas, and Matplotlib for exploratory analysis.",
      },
      {
        title: "Mathematics for Data Science",
        description:
          "Build intuition for statistics, probability, and linear algebra.",
      },
      {
        title: "Machine Learning - Supervised",
        description: "Train and evaluate regression and classification models.",
      },
      {
        title: "Machine Learning - Unsupervised",
        description:
          "Apply clustering and dimensionality reduction techniques.",
      },
      {
        title: "Deep Learning and AI",
        description:
          "Understand neural networks and practical deep learning workflows.",
      },
      {
        title: "MySQL",
        description: "Query, join, and manage structured datasets using SQL.",
      },
      {
        title: "Tableau",
        description: "Create interactive dashboards for business insights.",
      },
      {
        title: "Power BI and Google Data Studio",
        description: "Build reports and data stories for stakeholders.",
      },
      {
        title: "Data Engineering Tools",
        description: "Work with ETL concepts and modern data pipelines.",
      },
      {
        title: "NLP with MLOps",
        description:
          "Build NLP solutions and learn model deployment practices.",
      },
      {
        title: "AI Strategy",
        description: "Connect AI use cases to product and business goals.",
      },
      {
        title: "Domain Wise Capstone Projects",
        description: "Solve real-world problems with end-to-end projects.",
      },
    ],
    accent: "from-amber-100 via-white to-orange-50",
    included: [
      "40+ hours of video lessons",
      "Python, Pandas, NumPy, Scikit-learn modules",
      "Real-world datasets and Jupyter notebooks",
      "ML model building projects (regression, classification, clustering)",
      "Intro to LLMs and Generative AI tools",
      "Completion certificate",
    ],
    outcomes: [
      "Build and deploy ML models from scratch",
      "Analyze and visualize complex datasets",
      "Work with OpenAI APIs and AI pipelines",
      "Land roles as Data Analyst, ML Engineer, or AI Developer",
    ],
  },
  {
    slug: "cyber-security-and-ethical-hacking-course",
    name: "Cyber Security and Ethical Hacking Course",
    tagline: "Learn to think like a hacker — and defend like a pro.",
    description:
      "Build practical skills in ethical hacking, network defense, and vulnerability testing with structured security labs.",
    descriptionDetailed:
      "A hands-on course covering network security, penetration testing, vulnerability assessment, and ethical hacking techniques used by certified security professionals.",
    price: 29,
    compareAtPrice: 49,
    category: "Cyber Security",
    rating: 4.8,
    reviewCount: 121,
    downloads: "2.8K+",
    modules: [
      {
        title: "Cyber Security Fundamentals",
        description:
          "Understand core security principles, CIA triad, and threat landscape.",
      },
      {
        title: "Networking, Protocols, and Traffic Analysis",
        description: "Analyze packets and detect suspicious network behavior.",
      },
      {
        title: "Linux for Security Professionals",
        description:
          "Use Linux commands and permissions for security operations.",
      },
      {
        title: "Ethical Hacking Methodology",
        description:
          "Follow a structured approach to legal penetration testing.",
      },
      {
        title: "Vulnerability Assessment and Scanning",
        description: "Identify and prioritize system vulnerabilities.",
      },
      {
        title: "Web Application Security and OWASP Top 10",
        description: "Mitigate common web attacks and coding flaws.",
      },
      {
        title: "Penetration Testing with Kali Linux Tools",
        description: "Perform controlled attacks using industry tools.",
      },
      {
        title: "Wireless and Network Security Testing",
        description: "Audit Wi-Fi and internal network security posture.",
      },
      {
        title: "Incident Response and Digital Forensics Basics",
        description: "Triage incidents and preserve forensic evidence.",
      },
      {
        title: "Security Operations and SIEM Overview",
        description: "Monitor alerts and investigate events in SOC workflows.",
      },
      {
        title: "Cloud Security Essentials",
        description:
          "Apply IAM, encryption, and cloud misconfiguration checks.",
      },
      {
        title: "Compliance, Risk, and Governance",
        description: "Align security controls with policies and standards.",
      },
      {
        title: "Capstone: End-to-End Security Audit",
        description: "Conduct a full security assessment and report findings.",
      },
    ],
    accent: "from-sky-100 via-white to-cyan-50",
    included: [
      "35+ hours of video lessons",
      "Kali Linux setup and usage guide",
      "Network scanning with Nmap and Wireshark",
      "Web app penetration testing (OWASP Top 10)",
      "CTF (Capture The Flag) practice labs",
      "CEH and CompTIA Security+ exam prep material",
    ],
    outcomes: [
      "Perform ethical hacking and pen testing",
      "Identify and patch common vulnerabilities",
      "Understand firewalls, IDS/IPS, and VPNs",
      "Prepare for CEH, CompTIA Security+ certifications",
    ],
  },
  {
    slug: "devops-and-cloud-computing-bundle",
    name: "DevOps and Cloud Computing Bundle",
    tagline:
      "The complete bundle to master CI/CD, Docker, Kubernetes, and AWS.",
    description:
      "Master CI/CD, containers, Kubernetes, and cloud deployment across AWS, Azure, and GCP with production-style labs.",
    descriptionDetailed:
      "A premium bundle covering the full DevOps lifecycle and cloud infrastructure on AWS, Azure, and GCP. Ideal for developers and sysadmins moving into cloud-native roles.",
    price: 149,
    compareAtPrice: 229,
    category: "Cloud & DevOps",
    rating: 5,
    reviewCount: 267,
    downloads: "1.1K+",
    modules: [
      {
        title: "DevOps Foundations and SDLC",
        description:
          "Learn DevOps culture, lifecycle stages, and delivery flow.",
      },
      {
        title: "Git, GitHub, and Collaboration Workflows",
        description: "Manage branches, pull requests, and release workflows.",
      },
      {
        title: "Linux and Shell Scripting for DevOps",
        description: "Automate repetitive tasks with shell scripts.",
      },
      {
        title: "Containerization with Docker",
        description: "Package applications into reproducible container images.",
      },
      {
        title: "Kubernetes Architecture and Workloads",
        description: "Deploy and scale workloads with Kubernetes resources.",
      },
      {
        title: "CI/CD Pipelines with Jenkins",
        description: "Build continuous integration and deployment pipelines.",
      },
      {
        title: "CI/CD Automation with GitHub Actions",
        description: "Run automated testing and deployment from repositories.",
      },
      {
        title: "Infrastructure as Code with Terraform",
        description: "Provision cloud infrastructure through versioned code.",
      },
      {
        title: "AWS Core Services for DevOps",
        description: "Implement compute, storage, networking, and IAM on AWS.",
      },
      {
        title: "Monitoring, Logging, and Observability",
        description: "Track system health with logs, metrics, and alerts.",
      },
      {
        title: "DevSecOps and Secrets Management",
        description: "Integrate security checks and secure secret handling.",
      },
      {
        title: "Multi-Cloud Deployment Strategies",
        description: "Design resilient deployments across cloud providers.",
      },
      {
        title: "Capstone: Production-Ready Cloud Deployment",
        description: "Deliver a complete cloud-native DevOps project.",
      },
    ],
    accent: "from-violet-100 via-white to-fuchsia-50",
    included: [
      "60+ hours of combined video content",
      "Docker and Kubernetes hands-on labs",
      "CI/CD pipelines with Jenkins and GitHub Actions",
      "AWS core services: EC2, S3, RDS, Lambda, IAM",
      "Infrastructure as Code with Terraform",
      "AWS Solutions Architect exam prep guide",
    ],
    outcomes: [
      "Build and manage CI/CD pipelines end-to-end",
      "Deploy containerized apps with Docker and Kubernetes",
      "Provision cloud infrastructure using Terraform",
      "Prepare for AWS, Azure, or GCP certifications",
    ],
  },
  {
    slug: "full-stack-development-course",
    name: "Full-Stack Development Course",
    tagline:
      "Build production-ready web apps with React, Node.js, and PostgreSQL.",
    description:
      "Create end-to-end web apps with React, Node.js, APIs, and databases, then deploy confidently to cloud platforms.",
    descriptionDetailed:
      "A project-based full-stack course covering frontend, backend, databases, REST APIs, and deployment. Go from zero to shipping real applications used by real users.",
    price: 89,
    compareAtPrice: 129,
    category: "Web Development",
    rating: 4.9,
    reviewCount: 93,
    downloads: "640+",
    modules: [
      {
        title: "Web Fundamentals (HTML, CSS, JavaScript)",
        description: "Build responsive pages and core interactive UI.",
      },
      {
        title: "Advanced JavaScript and TypeScript",
        description: "Write scalable, strongly typed application logic.",
      },
      {
        title: "React Fundamentals and Component Architecture",
        description: "Create reusable components and clean UI structure.",
      },
      {
        title: "State Management and Frontend Patterns",
        description: "Manage app state and data flow effectively.",
      },
      {
        title: "Next.js and Modern Frontend Workflows",
        description: "Build SEO-friendly apps with modern tooling.",
      },
      {
        title: "Backend Development with Node.js and Express",
        description: "Design server routes and business logic.",
      },
      {
        title: "REST APIs, Validation, and Error Handling",
        description: "Build reliable APIs with robust input checks.",
      },
      {
        title: "Authentication and Authorization (JWT, OAuth2)",
        description: "Secure user identity and access control.",
      },
      {
        title: "Relational Databases with PostgreSQL",
        description: "Model data and query relational systems efficiently.",
      },
      {
        title: "NoSQL Databases with MongoDB",
        description: "Store and query flexible document-based data.",
      },
      {
        title: "Testing Full-Stack Applications",
        description: "Validate frontend and backend behavior with tests.",
      },
      {
        title: "Deployment, Performance, and CI/CD",
        description: "Optimize and ship apps through automated pipelines.",
      },
      {
        title: "Capstone: Full-Stack Production Project",
        description: "Deliver an end-to-end deployable product.",
      },
    ],
    accent: "from-emerald-100 via-white to-teal-50",
    included: [
      "50+ hours of video lessons",
      "HTML, CSS, JavaScript, and React (with Hooks & Redux)",
      "Node.js, Express.js, and REST API development",
      "PostgreSQL and MongoDB database integration",
      "Authentication with JWT and OAuth2",
      "Deployment on Vercel, Render, and AWS EC2",
    ],
    outcomes: [
      "Build and ship full-stack web applications",
      "Design scalable REST APIs with Node.js",
      "Manage databases with SQL and NoSQL",
      "Deploy apps to cloud with CI/CD pipelines",
    ],
  },
];
