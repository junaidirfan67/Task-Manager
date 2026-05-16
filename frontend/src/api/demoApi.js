const DB_KEY = "hirehub_demo_db";

const now = new Date().toISOString();

const initialDb = {
  users: [
    {
      id: "demo-candidate",
      name: "Maya Khan",
      email: "candidate@hirehub.com",
      password: "password123",
      role: "candidate",
      skills: ["React", "Node.js", "Product"],
      resume: "https://example.com/maya-resume",
      headline: "Full-stack product engineer",
      location: "Lahore, Pakistan"
    },
    {
      id: "demo-employer",
      name: "Ava Reed",
      email: "employer@hirehub.com",
      password: "password123",
      role: "employer",
      company: "LahoreTech Solutions",
      headline: "Talent Lead",
      location: "Lahore, Pakistan"
    }
  ],
  jobs: [
    {
      _id: "demo-job-1",
      id: "demo-job-1",
      employer: "demo-employer",
      title: "Senior MERN Stack Developer",
      company: "LahoreTech Solutions",
      location: "Lahore, Pakistan",
      salary: "PKR 250k - 400k/month",
      type: "Full-time",
      workplace: "Hybrid",
      description: "Build scalable job portal features, REST APIs, employer dashboards, and candidate application workflows for a Lahore-based product team.",
      requirements: "4+ years with React, Node.js, Express, MongoDB, JWT authentication, and clean API design.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      _id: "demo-job-2",
      id: "demo-job-2",
      employer: "demo-employer",
      title: "React Frontend Developer",
      company: "Punjab Digital Labs",
      location: "Lahore, Pakistan",
      salary: "PKR 180k - 300k/month",
      type: "Full-time",
      workplace: "On-site",
      description: "Create polished, responsive hiring interfaces for candidates and employers using React, Tailwind CSS, and modern frontend patterns.",
      requirements: "Strong React skills, Tailwind CSS, API integration with Axios, component architecture, and attention to UI detail.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      _id: "demo-job-3",
      id: "demo-job-3",
      employer: "demo-employer",
      title: "UI/UX Product Designer",
      company: "Model Town Software House",
      location: "Lahore, Pakistan",
      salary: "PKR 150k - 250k/month",
      type: "Full-time",
      workplace: "Hybrid",
      description: "Design professional dashboards, job search flows, application pages, and employer pipeline screens for a Pakistan-first hiring platform.",
      requirements: "Portfolio with SaaS or dashboard work, Figma expertise, UX research basics, and strong visual hierarchy.",
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ],
  applications: [
    {
      _id: "demo-application-1",
      id: "demo-application-1",
      job: "demo-job-1",
      candidate: "demo-candidate",
      status: "reviewing",
      coverLetter: "I would love to help shape this product.",
      resumeSnapshot: "https://example.com/maya-resume",
      createdAt: now,
      updatedAt: now
    }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readDb() {
  const raw = localStorage.getItem(DB_KEY);

  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return clone(initialDb);
  }

  return JSON.parse(raw);
}

function writeDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function createError(message, status = 400) {
  const error = new Error(message);
  error.response = { status, data: { message } };
  return error;
}

function response(data) {
  return Promise.resolve({ data });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills || [],
    resume: user.resume || "",
    company: user.company || "",
    headline: user.headline || "",
    location: user.location || ""
  };
}

function createToken(userId) {
  return `demo.${userId}.${crypto.randomUUID()}`;
}

function getUserIdFromToken() {
  const token = localStorage.getItem("hirehub_token");

  if (!token?.startsWith("demo.")) {
    throw createError("Not authorized, token missing", 401);
  }

  return token.split(".")[1];
}

function currentUser(db) {
  const userId = getUserIdFromToken();
  const user = db.users.find((item) => item.id === userId);

  if (!user) throw createError("Not authorized, user not found", 401);
  return user;
}

function parseUrl(url) {
  const parsed = new URL(url, "http://demo.local");
  return {
    pathname: parsed.pathname,
    params: Object.fromEntries(parsed.searchParams.entries())
  };
}

function applicantCount(db, jobId) {
  return db.applications.filter((application) => application.job === jobId).length;
}

function publicJob(db, job) {
  return {
    ...job,
    applicantCount: applicantCount(db, job.id)
  };
}

function joinApplication(db, application) {
  return {
    ...application,
    job: db.jobs.find((job) => job.id === application.job),
    candidate: publicUser(db.users.find((user) => user.id === application.candidate))
  };
}

function filterJobs(db, params) {
  const search = params.search?.trim().toLowerCase();
  const location = params.location?.trim().toLowerCase();

  return db.jobs
    .filter((job) => job.status === "active")
    .filter((job) => {
      if (search) {
        const haystack = [job.title, job.company, job.location, job.description].join(" ").toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (location && !job.location.toLowerCase().includes(location)) return false;
      if (params.type && params.type !== "all" && job.type !== params.type) return false;
      if (params.workplace && params.workplace !== "all" && job.workplace !== params.workplace) return false;

      return true;
    })
    .sort((a, b) => (params.sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt)))
    .map((job) => publicJob(db, job));
}

function pathId(pathname, prefix) {
  const match = pathname.match(new RegExp(`^${prefix}/([^/]+)$`));
  return match?.[1];
}

const demoApi = {
  async get(url) {
    const db = readDb();
    const { pathname, params } = parseUrl(url);

    if (pathname === "/auth/me") return response({ user: publicUser(currentUser(db)) });
    if (pathname === "/jobs") return response({ jobs: filterJobs(db, params) });
    if (pathname === "/jobs/employer/mine") {
      const user = currentUser(db);
      return response({ jobs: db.jobs.filter((job) => job.employer === user.id).map((job) => publicJob(db, job)) });
    }
    if (pathname === "/applications/me") {
      const user = currentUser(db);
      return response({ applications: db.applications.filter((application) => application.candidate === user.id).map((item) => joinApplication(db, item)) });
    }
    if (pathname === "/applications/employer") {
      const user = currentUser(db);
      const jobIds = new Set(db.jobs.filter((job) => job.employer === user.id).map((job) => job.id));
      return response({ applications: db.applications.filter((application) => jobIds.has(application.job)).map((item) => joinApplication(db, item)) });
    }

    const jobId = pathId(pathname, "/jobs");
    if (jobId) {
      const job = db.jobs.find((item) => item.id === jobId);
      if (!job) throw createError("Job not found", 404);
      return response({ job: publicJob(db, job) });
    }

    throw createError("Route not found", 404);
  },

  async post(url, body) {
    const db = readDb();
    const { pathname } = parseUrl(url);

    if (pathname === "/auth/register") {
      const email = body.email?.trim().toLowerCase();
      if (db.users.some((user) => user.email === email)) throw createError("An account with this email already exists", 409);

      const user = {
        id: crypto.randomUUID(),
        name: body.name?.trim(),
        email,
        password: body.password,
        role: body.role || "candidate",
        skills: typeof body.skills === "string" ? body.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
        resume: body.resume || "",
        company: body.company || "",
        headline: body.headline || "",
        location: body.location || ""
      };
      db.users.push(user);
      writeDb(db);
      return response({ user: publicUser(user), token: createToken(user.id) });
    }

    if (pathname === "/auth/login") {
      const email = body.email?.trim().toLowerCase();
      const user = db.users.find((item) => item.email === email && item.password === body.password);
      if (!user) throw createError("Invalid email or password", 401);
      return response({ user: publicUser(user), token: createToken(user.id) });
    }

    if (pathname === "/jobs") {
      const user = currentUser(db);
      if (user.role !== "employer") throw createError("You do not have permission to perform this action", 403);
      const id = crypto.randomUUID();
      const job = { _id: id, id, employer: user.id, status: "active", createdAt: now, updatedAt: now, ...body };
      db.jobs.push(job);
      writeDb(db);
      return response({ job: publicJob(db, job) });
    }

    const applyMatch = pathname.match(/^\/applications\/apply\/([^/]+)$/);
    if (applyMatch) {
      const user = currentUser(db);
      const job = db.jobs.find((item) => item.id === applyMatch[1]);
      if (!job) throw createError("Job not found", 404);
      if (db.applications.some((application) => application.job === job.id && application.candidate === user.id)) throw createError("You already applied to this job", 409);
      const id = crypto.randomUUID();
      const application = {
        _id: id,
        id,
        job: job.id,
        candidate: user.id,
        status: "applied",
        coverLetter: body.coverLetter || "",
        resumeSnapshot: body.resume || user.resume || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.applications.push(application);
      writeDb(db);
      return response({ application: joinApplication(db, application) });
    }

    throw createError("Route not found", 404);
  },

  async put(url, body) {
    const db = readDb();
    const { pathname } = parseUrl(url);
    const jobId = pathId(pathname, "/jobs");
    if (!jobId) throw createError("Route not found", 404);
    const user = currentUser(db);
    const index = db.jobs.findIndex((job) => job.id === jobId && job.employer === user.id);
    if (index === -1) throw createError("Job not found", 404);
    db.jobs[index] = { ...db.jobs[index], ...body, updatedAt: new Date().toISOString() };
    writeDb(db);
    return response({ job: publicJob(db, db.jobs[index]) });
  },

  async patch(url, body) {
    const db = readDb();
    const { pathname } = parseUrl(url);
    const match = pathname.match(/^\/applications\/([^/]+)\/status$/);
    if (!match) throw createError("Route not found", 404);
    const user = currentUser(db);
    const index = db.applications.findIndex((application) => application.id === match[1]);
    if (index === -1) throw createError("Application not found", 404);
    const job = db.jobs.find((item) => item.id === db.applications[index].job);
    if (job?.employer !== user.id) throw createError("Application not found", 404);
    db.applications[index] = { ...db.applications[index], status: body.status, updatedAt: new Date().toISOString() };
    writeDb(db);
    return response({ application: joinApplication(db, db.applications[index]) });
  },

  async delete(url) {
    const db = readDb();
    const { pathname } = parseUrl(url);
    const jobId = pathId(pathname, "/jobs");
    if (!jobId) throw createError("Route not found", 404);
    const user = currentUser(db);
    const index = db.jobs.findIndex((job) => job.id === jobId && job.employer === user.id);
    if (index === -1) throw createError("Job not found", 404);
    db.jobs.splice(index, 1);
    db.applications = db.applications.filter((application) => application.job !== jobId);
    writeDb(db);
    return response({ message: "Job deleted" });
  }
};

export default demoApi;
