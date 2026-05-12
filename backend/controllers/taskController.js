const asyncHandler = require("../middleware/asyncHandler");
const { getUserId } = require("../services/userService");
const taskService = require("../services/taskService");

const allowedStatuses = ["todo", "in-progress", "completed"];
const allowedPriorities = ["low", "medium", "high"];

function validateTaskInput(body, partial = false) {
  const errors = [];

  if (!partial || body.title !== undefined) {
    if (!body.title || !body.title.trim()) {
      errors.push("Title is required");
    }
  }

  if (body.status && !allowedStatuses.includes(body.status)) {
    errors.push("Invalid task status");
  }

  if (body.priority && !allowedPriorities.includes(body.priority)) {
    errors.push("Invalid task priority");
  }

  return errors;
}

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks(getUserId(req.user), req.query);

  res.json({ tasks });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, getUserId(req.user));

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.json({ task });
});

const createTask = asyncHandler(async (req, res) => {
  const errors = validateTaskInput(req.body);

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const task = await taskService.createTask(getUserId(req.user), {
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "todo",
    priority: req.body.priority || "medium",
    dueDate: req.body.dueDate || null
  });

  res.status(201).json({ task });
});

const updateTask = asyncHandler(async (req, res) => {
  const errors = validateTaskInput(req.body, true);

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const fields = ["title", "description", "status", "priority", "dueDate"];
  const updates = {};

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field] === "" && field === "dueDate" ? null : req.body[field];
    }
  });

  const task = await taskService.updateTask(req.params.id, getUserId(req.user), updates);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.json({ task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await taskService.deleteTask(req.params.id, getUserId(req.user));

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.json({ message: "Task deleted" });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats(getUserId(req.user));
  res.json({ stats });
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
