const asyncHandler = require("../middleware/asyncHandler");
const { getUserId } = require("../services/userService");
const jobService = require("../services/jobService");

const allowedTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const allowedWorkplaces = ["Remote", "Hybrid", "On-site"];
const allowedStatuses = ["active", "closed"];

function validateJob(body, partial = false) {
  const errors = [];

  ["title", "company", "location", "description"].forEach((field) => {
    if (!partial || body[field] !== undefined) {
      if (!body[field] || !String(body[field]).trim()) {
        errors.push(`${field} is required`);
      }
    }
  });

  if (body.type && !allowedTypes.includes(body.type)) errors.push("Invalid job type");
  if (body.workplace && !allowedWorkplaces.includes(body.workplace)) errors.push("Invalid workplace");
  if (body.status && !allowedStatuses.includes(body.status)) errors.push("Invalid job status");

  return errors;
}

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getJobs(req.query);
  res.json({ jobs });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.json({ job });
});

const createJob = asyncHandler(async (req, res) => {
  const errors = validateJob({ ...req.body, company: req.body.company || req.user.company || req.user.name });

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const job = await jobService.createJob(req.user, req.body);
  res.status(201).json({ job });
});

const getEmployerJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getEmployerJobs(getUserId(req.user));
  res.json({ jobs });
});

const updateJob = asyncHandler(async (req, res) => {
  const errors = validateJob(req.body, true);

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const job = await jobService.updateJob(req.params.id, getUserId(req.user), req.body);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.json({ job });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await jobService.deleteJob(req.params.id, getUserId(req.user));

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.json({ message: "Job deleted" });
});

module.exports = {
  createJob,
  deleteJob,
  getEmployerJobs,
  getJobById,
  getJobs,
  updateJob
};
