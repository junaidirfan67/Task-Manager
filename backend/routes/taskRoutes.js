const express = require("express");
const {
  createTask,
  deleteTask,
  getTaskById,
  getTaskStats,
  getTasks,
  updateTask
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getTasks).post(createTask);
router.get("/stats", getTaskStats);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;
