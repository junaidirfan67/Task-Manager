const { useLocalStore } = require("../config/storageMode");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { createId, readDb, writeDb } = require("./localDatabase");

const editableFields = [
  "title",
  "company",
  "location",
  "salary",
  "type",
  "workplace",
  "description",
  "requirements",
  "status"
];

function getEntityId(value) {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || value);
  return String(value);
}

function serializeEmployer(employer) {
  if (!employer || typeof employer !== "object") {
    return employer ? { id: String(employer) } : null;
  }

  return {
    id: getEntityId(employer),
    name: employer.name,
    email: employer.email,
    company: employer.company || ""
  };
}

function normalizeJob(job, applicantCount = 0) {
  if (!job) return null;

  const plain = job.toObject ? job.toObject() : { ...job };
  const id = getEntityId(plain);

  return {
    ...plain,
    id,
    _id: id,
    employer: serializeEmployer(plain.employer),
    applicantCount
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesJob(job, filters = {}) {
  if (job.status !== "active" && !filters.includeClosed) return false;

  const searchTerm = filters.search?.trim().toLowerCase();
  if (searchTerm) {
    const haystack = [job.title, job.company, job.location, job.description, job.requirements].join(" ").toLowerCase();
    if (!haystack.includes(searchTerm)) return false;
  }

  if (filters.location && filters.location !== "all") {
    if (!job.location.toLowerCase().includes(filters.location.trim().toLowerCase())) return false;
  }

  if (filters.type && filters.type !== "all" && job.type !== filters.type) return false;
  if (filters.workplace && filters.workplace !== "all" && job.workplace !== filters.workplace) return false;

  return true;
}

function sortJobs(jobs, sort = "newest") {
  const sorted = [...jobs];

  if (sort === "oldest") {
    return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function applicantCounts(applications) {
  return applications.reduce((counts, application) => {
    const jobId = getEntityId(application.job);
    counts[jobId] = (counts[jobId] || 0) + 1;
    return counts;
  }, {});
}

async function getJobs(filters = {}) {
  if (!useLocalStore()) {
    const query = { status: "active" };

    if (filters.search?.trim()) {
      const term = new RegExp(escapeRegExp(filters.search.trim()), "i");
      query.$or = [{ title: term }, { company: term }, { location: term }, { description: term }];
    }

    if (filters.location?.trim() && filters.location !== "all") {
      query.location = new RegExp(escapeRegExp(filters.location.trim()), "i");
    }

    if (filters.type && filters.type !== "all") query.type = filters.type;
    if (filters.workplace && filters.workplace !== "all") query.workplace = filters.workplace;

    const sort = filters.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
    const jobs = await Job.find(query).populate("employer", "name email company").sort(sort);
    const counts = await Promise.all(jobs.map((job) => Application.countDocuments({ job: job._id })));

    return jobs.map((job, index) => normalizeJob(job, counts[index]));
  }

  const db = await readDb();
  const counts = applicantCounts(db.applications);

  return sortJobs(
    db.jobs.filter((job) => matchesJob(job, filters)),
    filters.sort
  ).map((job) => normalizeJob(job, counts[job.id] || 0));
}

async function getJobById(jobId, options = {}) {
  if (!useLocalStore()) {
    const query = options.includeClosed ? { _id: jobId } : { _id: jobId, status: "active" };
    const job = await Job.findOne(query).populate("employer", "name email company");
    const count = job ? await Application.countDocuments({ job: job._id }) : 0;
    return normalizeJob(job, count);
  }

  const db = await readDb();
  const job = db.jobs.find((item) => item.id === jobId || item._id === jobId);

  if (!job || (!options.includeClosed && job.status !== "active")) {
    return null;
  }

  const counts = applicantCounts(db.applications);
  return normalizeJob(job, counts[job.id] || 0);
}

async function createJob(user, payload) {
  const employerId = getEntityId(user);
  const now = new Date().toISOString();
  const job = {
    title: payload.title?.trim(),
    company: (payload.company || user.company || user.name).trim(),
    location: payload.location?.trim(),
    salary: payload.salary?.trim() || "",
    type: payload.type || "Full-time",
    workplace: payload.workplace || "Remote",
    description: payload.description?.trim(),
    requirements: payload.requirements?.trim() || "",
    status: payload.status || "active"
  };

  if (!useLocalStore()) {
    return normalizeJob(await Job.create({ ...job, employer: employerId }));
  }

  const db = await readDb();
  const id = createId();
  const localJob = {
    id,
    _id: id,
    employer: employerId,
    ...job,
    createdAt: now,
    updatedAt: now
  };

  db.jobs.push(localJob);
  await writeDb(db);
  return normalizeJob(localJob);
}

async function getEmployerJobs(userId) {
  if (!useLocalStore()) {
    const jobs = await Job.find({ employer: userId }).sort({ createdAt: -1 });
    const counts = await Promise.all(jobs.map((job) => Application.countDocuments({ job: job._id })));
    return jobs.map((job, index) => normalizeJob(job, counts[index]));
  }

  const db = await readDb();
  const counts = applicantCounts(db.applications);

  return sortJobs(db.jobs.filter((job) => job.employer === userId), "newest").map((job) =>
    normalizeJob(job, counts[job.id] || 0)
  );
}

async function updateJob(jobId, userId, updates) {
  const payload = editableFields.reduce((acc, field) => {
    if (updates[field] !== undefined) {
      acc[field] = typeof updates[field] === "string" ? updates[field].trim() : updates[field];
    }

    return acc;
  }, {});

  if (!useLocalStore()) {
    const job = await Job.findOne({ _id: jobId, employer: userId });

    if (!job) return null;

    Object.assign(job, payload);
    await job.save();
    return normalizeJob(job, await Application.countDocuments({ job: job._id }));
  }

  const db = await readDb();
  const index = db.jobs.findIndex((job) => (job.id === jobId || job._id === jobId) && job.employer === userId);

  if (index === -1) return null;

  db.jobs[index] = {
    ...db.jobs[index],
    ...payload,
    updatedAt: new Date().toISOString()
  };

  await writeDb(db);
  const counts = applicantCounts(db.applications);
  return normalizeJob(db.jobs[index], counts[db.jobs[index].id] || 0);
}

async function deleteJob(jobId, userId) {
  if (!useLocalStore()) {
    const job = await Job.findOneAndDelete({ _id: jobId, employer: userId });

    if (!job) return null;

    await Application.deleteMany({ job: job._id });
    return normalizeJob(job);
  }

  const db = await readDb();
  const index = db.jobs.findIndex((job) => (job.id === jobId || job._id === jobId) && job.employer === userId);

  if (index === -1) return null;

  const [job] = db.jobs.splice(index, 1);
  db.applications = db.applications.filter((application) => application.job !== job.id);
  await writeDb(db);
  return normalizeJob(job);
}

module.exports = {
  createJob,
  deleteJob,
  getEmployerJobs,
  getJobById,
  getJobs,
  updateJob
};
