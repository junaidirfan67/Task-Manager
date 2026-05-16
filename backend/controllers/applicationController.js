const asyncHandler = require("../middleware/asyncHandler");
const applicationService = require("../services/applicationService");
const { getUserId } = require("../services/userService");

const applyToJob = asyncHandler(async (req, res) => {
  const application = await applicationService.applyToJob(req.params.jobId, req.user, req.body);

  if (!application) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.status(201).json({ application });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getCandidateApplications(getUserId(req.user));
  res.json({ applications });
});

const getEmployerApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getEmployerApplications(getUserId(req.user));
  res.json({ applications });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(req.params.id, getUserId(req.user), req.body.status);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.json({ application });
});

module.exports = {
  applyToJob,
  getEmployerApplications,
  getMyApplications,
  updateApplicationStatus
};
