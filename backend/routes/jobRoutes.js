const express = require("express");
const {
  createJob,
  deleteJob,
  getEmployerJobs,
  getJobById,
  getJobs,
  updateJob
} = require("../controllers/jobController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getJobs).post(protect, authorize("employer", "admin"), createJob);
router.get("/employer/mine", protect, authorize("employer", "admin"), getEmployerJobs);
router.route("/:id").get(getJobById).put(protect, authorize("employer", "admin"), updateJob).delete(protect, authorize("employer", "admin"), deleteJob);

module.exports = router;
