const { useLocalStore } = require("../config/storageMode");
const Task = require("../models/Task");
const { createId, readDb, writeDb } = require("./localDatabase");

const priorityRank = { high: 3, medium: 2, low: 1 };

function normalizeTask(task) {
  if (!task) {
    return null;
  }

  const plain = task.toObject ? task.toObject() : { ...task };
  const id = String(plain._id || plain.id);

  return {
    ...plain,
    _id: id,
    id
  };
}

function matchFilters(task, filters) {
  if (filters.status && filters.status !== "all" && task.status !== filters.status) {
    return false;
  }

  if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) {
    return false;
  }

  const searchTerm = filters.search?.trim().toLowerCase();

  if (searchTerm) {
    const title = task.title.toLowerCase();
    const description = (task.description || "").toLowerCase();
    return title.includes(searchTerm) || description.includes(searchTerm);
  }

  return true;
}

function sortTasks(tasks, sort) {
  const sorted = [...tasks];

  if (sort === "oldest") {
    return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  if (sort === "dueDate") {
    return sorted.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return new Date(b.createdAt) - new Date(a.createdAt);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  if (sort === "priority") {
    return sorted.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
  }

  return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getTasks(userId, filters) {
  if (!useLocalStore()) {
    const query = { user: userId };

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters.priority && filters.priority !== "all") {
      query.priority = filters.priority;
    }

    const searchTerm = filters.search?.trim();

    if (searchTerm) {
      query.$or = [
        { title: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
        { description: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      dueDate: { dueDate: 1, createdAt: -1 },
      priority: { priority: -1, createdAt: -1 }
    };

    const tasks = await Task.find(query).sort(sortMap[filters.sort] || sortMap.newest);
    return tasks.map(normalizeTask);
  }

  const db = await readDb();
  return sortTasks(
    db.tasks.filter((task) => task.user === userId && matchFilters(task, filters)),
    filters.sort
  ).map(normalizeTask);
}

async function getTaskById(taskId, userId) {
  if (!useLocalStore()) {
    return normalizeTask(await Task.findOne({ _id: taskId, user: userId }));
  }

  const db = await readDb();
  return normalizeTask(db.tasks.find((task) => task.id === taskId && task.user === userId));
}

async function createTask(userId, payload) {
  if (!useLocalStore()) {
    return normalizeTask(
      await Task.create({
        user: userId,
        ...payload
      })
    );
  }

  const db = await readDb();
  const now = new Date().toISOString();
  const id = createId();
  const task = {
    id,
    _id: id,
    user: userId,
    title: payload.title,
    description: payload.description || "",
    status: payload.status || "todo",
    priority: payload.priority || "medium",
    dueDate: payload.dueDate || null,
    createdAt: now,
    updatedAt: now
  };

  db.tasks.push(task);
  await writeDb(db);
  return normalizeTask(task);
}

async function updateTask(taskId, userId, updates) {
  if (!useLocalStore()) {
    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      return null;
    }

    Object.entries(updates).forEach(([field, value]) => {
      task[field] = value === "" && field === "dueDate" ? null : value;
    });

    await task.save();
    return normalizeTask(task);
  }

  const db = await readDb();
  const index = db.tasks.findIndex((task) => task.id === taskId && task.user === userId);

  if (index === -1) {
    return null;
  }

  db.tasks[index] = {
    ...db.tasks[index],
    ...updates,
    dueDate: updates.dueDate === "" ? null : updates.dueDate ?? db.tasks[index].dueDate,
    updatedAt: new Date().toISOString()
  };

  await writeDb(db);
  return normalizeTask(db.tasks[index]);
}

async function deleteTask(taskId, userId) {
  if (!useLocalStore()) {
    return normalizeTask(await Task.findOneAndDelete({ _id: taskId, user: userId }));
  }

  const db = await readDb();
  const index = db.tasks.findIndex((task) => task.id === taskId && task.user === userId);

  if (index === -1) {
    return null;
  }

  const [task] = db.tasks.splice(index, 1);
  await writeDb(db);
  return normalizeTask(task);
}

async function getTaskStats(userId) {
  if (!useLocalStore()) {
    const now = new Date();
    const [total, todo, inProgress, completed, overdue, byPriority] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: "todo" }),
      Task.countDocuments({ user: userId, status: "in-progress" }),
      Task.countDocuments({ user: userId, status: "completed" }),
      Task.countDocuments({ user: userId, status: { $ne: "completed" }, dueDate: { $lt: now } }),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      todo,
      inProgress,
      completed,
      overdue,
      byPriority: byPriority.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        { low: 0, medium: 0, high: 0 }
      )
    };
  }

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const db = await readDb();
  const tasks = db.tasks.filter((task) => task.user === userId);

  return tasks.reduce(
    (stats, task) => {
      stats.total += 1;
      stats.byPriority[task.priority] += 1;

      if (task.status === "todo") stats.todo += 1;
      if (task.status === "in-progress") stats.inProgress += 1;
      if (task.status === "completed") stats.completed += 1;

      if (task.dueDate && task.status !== "completed" && new Date(task.dueDate) < todayDate) {
        stats.overdue += 1;
      }

      return stats;
    },
    {
      total: 0,
      todo: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      byPriority: { low: 0, medium: 0, high: 0 }
    }
  );
}

module.exports = {
  createTask,
  deleteTask,
  getTaskById,
  getTaskStats,
  getTasks,
  updateTask
};
