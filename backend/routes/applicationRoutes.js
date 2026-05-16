const express = require("express");
const {
  applyToJob,
  getEmployerApplications,
  getMyApplications,
  updateApplicationStatus
} = require("../controllers/applicationController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/apply/:jobId", protect, authorize("candidate", "admin"), applyToJob);
router.get("/me", protect, authorize("candidate", "admin"), getMyApplications);
router.get("/employer", protect, authorize("employer", "admin"), getEmployerApplications);
router.patch("/:id/status", protect, authorize("employer", "admin"), updateApplicationStatus);

module.exports = router;
