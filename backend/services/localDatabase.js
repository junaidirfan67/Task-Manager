const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "local-db.json");

function nowIso() {
  return new Date().toISOString();
}

function demoJobs() {
  const now = nowIso();

  return [
    {
      id: "seed-mern-developer-lahore",
      _id: "seed-mern-developer-lahore",
      employer: "seed-hirehub",
      title: "Senior MERN Stack Developer",
      company: "LahoreTech Solutions",
      location: "Lahore, Pakistan",
      salary: "PKR 250k - 400k/month",
      type: "Full-time",
      workplace: "Hybrid",
      description:
        "Build scalable job portal features, REST APIs, employer dashboards, and candidate application workflows for a Lahore-based product team.",
      requirements: "4+ years with React, Node.js, Express, MongoDB, JWT authentication, and clean API design.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "seed-react-developer-lahore",
      _id: "seed-react-developer-lahore",
      employer: "seed-hirehub",
      title: "React Frontend Developer",
      company: "Punjab Digital Labs",
      location: "Lahore, Pakistan",
      salary: "PKR 180k - 300k/month",
      type: "Full-time",
      workplace: "On-site",
      description:
        "Create polished, responsive hiring interfaces for candidates and employers using React, Tailwind CSS, and modern frontend patterns.",
      requirements: "Strong React skills, Tailwind CSS, API integration with Axios, component architecture, and attention to UI detail.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "seed-ui-ux-designer-lahore",
      _id: "seed-ui-ux-designer-lahore",
      employer: "seed-hirehub",
      title: "UI/UX Product Designer",
      company: "Model Town Software House",
      location: "Lahore, Pakistan",
      salary: "PKR 150k - 250k/month",
      type: "Full-time",
      workplace: "Hybrid",
      description:
        "Design professional dashboards, job search flows, application pages, and employer pipeline screens for a Pakistan-first hiring platform.",
      requirements: "Portfolio with SaaS or dashboard work, Figma expertise, UX research basics, and strong visual hierarchy.",
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];
}

const emptyDb = { users: [], jobs: demoJobs(), applications: [], seededHireHubJobs: true };

async function ensureLocalDatabase() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await writeDb(emptyDb);
  }
}

async function readDb() {
  await ensureLocalDatabase();
  const raw = await fs.readFile(dataFile, "utf8");
  const db = JSON.parse(raw);
  let changed = false;

  if (!Array.isArray(db.users)) {
    db.users = [];
    changed = true;
  }

  if (!Array.isArray(db.jobs)) {
    db.jobs = [];
    changed = true;
  }

  if (!Array.isArray(db.applications)) {
    db.applications = [];
    changed = true;
  }

  if (!db.seededHireHubJobs && db.jobs.length === 0) {
    db.jobs = demoJobs();
    db.seededHireHubJobs = true;
    changed = true;
  }

  db.users = db.users.map((user) => {
    const nextUser = {
      role: "candidate",
      skills: [],
      resume: "",
      company: "",
      headline: "",
      location: "",
      ...user
    };

    if (JSON.stringify(nextUser) !== JSON.stringify(user)) {
      changed = true;
    }

    return nextUser;
  });

  if (changed) {
    await writeDb(db);
  }

  return db;
}

async function writeDb(db) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(db, null, 2)}\n`);
}

function createId() {
  return crypto.randomUUID();
}

module.exports = {
  createId,
  ensureLocalDatabase,
  readDb,
  writeDb
};
