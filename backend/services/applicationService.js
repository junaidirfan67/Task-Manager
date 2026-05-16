const { useLocalStore } = require("../config/storageMode");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { createId, readDb, writeDb } = require("./localDatabase");

const statuses = ["applied", "reviewing", "interview", "offer", "rejected"];

function getEntityId(value) {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || value);
  return String(value);
}

function serializeUser(user) {
  if (!user || typeof user !== "object") return user ? { id: String(user) } : null;

  return {
    id: getEntityId(user),
    name: user.name,
    email: user.email,
    role: user.role || "candidate",
    skills: Array.isArray(user.skills) ? user.skills : [],
    resume: user.resume || "",
    company: user.company || ""
  };
}

function serializeJob(job) {
  if (!job || typeof job !== "object") return job ? { id: String(job) } : null;

  return {
    ...job,
    id: getEntityId(job),
    _id: getEntityId(job)
  };
}

function normalizeApplication(application) {
  if (!application) return null;

  const plain = application.toObject ? application.toObject() : { ...application };
  const id = getEntityId(plain);

  return {
    ...plain,
    id,
    _id: id,
    job: serializeJob(plain.job),
    candidate: serializeUser(plain.candidate)
  };
}

function joinLocalApplication(application, db) {
  return normalizeApplication({
    ...application,
    job: db.jobs.find((job) => job.id === application.job || job._id === application.job),
    candidate: db.users.find((user) => user.id === application.candidate || user._id === application.candidate)
  });
}

async function applyToJob(jobId, candidate, payload = {}) {
  const candidateId = getEntityId(candidate);

  if (!useLocalStore()) {
    const job = await Job.findOne({ _id: jobId, status: "active" });

    if (!job) return null;

    const existing = await Application.findOne({ job: jobId, candidate: candidateId });

    if (existing) {
      const error = new Error("You already applied to this job");
      error.statusCode = 409;
      throw error;
    }

    const application = await Application.create({
      job: jobId,
      candidate: candidateId,
      coverLetter: payload.coverLetter || "",
      resumeSnapshot: payload.resume || candidate.resume || ""
    });

    return normalizeApplication(await application.populate([{ path: "job" }, { path: "candidate", select: "-password" }]));
  }

  const db = await readDb();
  const job = db.jobs.find((item) => (item.id === jobId || item._id === jobId) && item.status === "active");

  if (!job) return null;

  if (db.applications.some((application) => application.job === job.id && application.candidate === candidateId)) {
    const error = new Error("You already applied to this job");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const id = createId();
  const application = {
    id,
    _id: id,
    job: job.id,
    candidate: candidateId,
    status: "applied",
    coverLetter: payload.coverLetter || "",
    resumeSnapshot: payload.resume || candidate.resume || "",
    createdAt: now,
    updatedAt: now
  };

  db.applications.push(application);
  await writeDb(db);
  return joinLocalApplication(application, db);
}

async function getCandidateApplications(candidateId) {
  if (!useLocalStore()) {
    const applications = await Application.find({ candidate: candidateId })
      .populate("job")
      .populate("candidate", "-password")
      .sort({ createdAt: -1 });

    return applications.map(normalizeApplication);
  }

  const db = await readDb();
  return db.applications
    .filter((application) => application.candidate === candidateId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((application) => joinLocalApplication(application, db));
}

async function getEmployerApplications(employerId) {
  if (!useLocalStore()) {
    const jobs = await Job.find({ employer: employerId }).select("_id");
    const jobIds = jobs.map((job) => job._id);
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job")
      .populate("candidate", "-password")
      .sort({ createdAt: -1 });

    return applications.map(normalizeApplication);
  }

  const db = await readDb();
  const employerJobIds = new Set(db.jobs.filter((job) => job.employer === employerId).map((job) => job.id));

  return db.applications
    .filter((application) => employerJobIds.has(application.job))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((application) => joinLocalApplication(application, db));
}

async function updateApplicationStatus(applicationId, employerId, status) {
  if (!statuses.includes(status)) {
    const error = new Error("Invalid application status");
    error.statusCode = 400;
    throw error;
  }

  if (!useLocalStore()) {
    const application = await Application.findById(applicationId).populate("job");

    if (!application || getEntityId(application.job.employer) !== employerId) return null;

    application.status = status;
    await application.save();

    return normalizeApplication(await application.populate([{ path: "job" }, { path: "candidate", select: "-password" }]));
  }

  const db = await readDb();
  const index = db.applications.findIndex((application) => application.id === applicationId || application._id === applicationId);

  if (index === -1) return null;

  const job = db.jobs.find((item) => item.id === db.applications[index].job);

  if (!job || job.employer !== employerId) return null;

  db.applications[index] = {
    ...db.applications[index],
    status,
    updatedAt: new Date().toISOString()
  };

  await writeDb(db);
  return joinLocalApplication(db.applications[index], db);
}

module.exports = {
  applyToJob,
  getCandidateApplications,
  getEmployerApplications,
  statuses,
  updateApplicationStatus
};
