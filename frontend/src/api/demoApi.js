const DB_KEY = "task_manager_demo_db";

const initialDb = {
  users: [
    {
      id: "demo-user",
      name: "Demo User",
      email: "demo@taskmanager.com",
      password: "password123"
    }
  ],
  tasks: [
    {
      _id: "demo-task-1",
      id: "demo-task-1",
      user: "demo-user",
      title: "Customize your portfolio project",
      description: "Update the README, add screenshots, and prepare your LinkedIn post.",
      status: "in-progress",
      priority: "high",
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: "demo-task-2",
      id: "demo-task-2",
      user: "demo-user",
      title: "Deploy frontend demo",
      description: "Publish the React dashboard with GitHub Pages.",
      status: "todo",
      priority: "medium",
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

const priorityRank = { high: 3, medium: 2, low: 1 };

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

function createToken(userId) {
  return `demo.${userId}.${crypto.randomUUID()}`;
}

function getUserIdFromToken() {
  const token = localStorage.getItem("task_manager_token");

  if (!token?.startsWith("demo.")) {
    throw createError("Not authorized, token missing", 401);
  }

  return token.split(".")[1];
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

function parseUrl(url) {
  const parsed = new URL(url, "http://demo.local");
  return {
    pathname: parsed.pathname,
    params: Object.fromEntries(parsed.searchParams.entries())
  };
}

function filterTasks(tasks, params) {
  const search = params.search?.trim().toLowerCase();

  return tasks.filter((task) => {
    if (params.status && params.status !== "all" && task.status !== params.status) {
      return false;
    }

    if (params.priority && params.priority !== "all" && task.priority !== params.priority) {
      return false;
    }

    if (search) {
      return task.title.toLowerCase().includes(search) || (task.description || "").toLowerCase().includes(search);
    }

    return true;
  });
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

function getStats(tasks) {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return tasks.reduce(
    (stats, task) => {
      stats.total += 1;
      stats.byPriority[task.priority] += 1;

      if (task.status === "todo") stats.todo += 1;
      if (task.status === "in-progress") stats.inProgress += 1;
      if (task.status === "completed") stats.completed += 1;
      if (task.dueDate && task.status !== "completed" && new Date(task.dueDate) < todayDate) stats.overdue += 1;

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

function taskIdFromPath(pathname) {
  const match = pathname.match(/^\/tasks\/([^/]+)$/);
  return match?.[1];
}

const demoApi = {
  async get(url) {
    const db = readDb();
    const { pathname, params } = parseUrl(url);

    if (pathname === "/auth/me") {
      const userId = getUserIdFromToken();
      const user = db.users.find((item) => item.id === userId);

      if (!user) {
        throw createError("Not authorized, user not found", 401);
      }

      return response({ user: publicUser(user) });
    }

    if (pathname === "/tasks/stats") {
      const userId = getUserIdFromToken();
      const tasks = db.tasks.filter((task) => task.user === userId);
      return response({ stats: getStats(tasks) });
    }

    if (pathname === "/tasks") {
      const userId = getUserIdFromToken();
      const tasks = sortTasks(filterTasks(db.tasks.filter((task) => task.user === userId), params), params.sort);
      return response({ tasks });
    }

    const taskId = taskIdFromPath(pathname);

    if (taskId) {
      const userId = getUserIdFromToken();
      const task = db.tasks.find((item) => item._id === taskId && item.user === userId);

      if (!task) {
        throw createError("Task not found", 404);
      }

      return response({ task });
    }

    throw createError("Route not found", 404);
  },

  async post(url, body) {
    const db = readDb();
    const { pathname } = parseUrl(url);

    if (pathname === "/auth/register") {
      const name = body.name?.trim();
      const email = body.email?.trim().toLowerCase();

      if (!name || !email || !body.password) {
        throw createError("Name, email, and password are required");
      }

      if (body.password.length < 6) {
        throw createError("Password must be at least 6 characters");
      }

      if (db.users.some((user) => user.email === email)) {
        throw createError("An account with this email already exists", 409);
      }

      const user = { id: crypto.randomUUID(), name, email, password: body.password };
      db.users.push(user);
      writeDb(db);

      return response({ user: publicUser(user), token: createToken(user.id) });
    }

    if (pathname === "/auth/login") {
      const email = body.email?.trim().toLowerCase();
      const user = db.users.find((item) => item.email === email && item.password === body.password);

      if (!user) {
        throw createError("Invalid email or password", 401);
      }

      return response({ user: publicUser(user), token: createToken(user.id) });
    }

    if (pathname === "/tasks") {
      const userId = getUserIdFromToken();
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const task = {
        _id: id,
        id,
        user: userId,
        title: body.title,
        description: body.description || "",
        status: body.status || "todo",
        priority: body.priority || "medium",
        dueDate: body.dueDate || null,
        createdAt: now,
        updatedAt: now
      };

      if (!task.title?.trim()) {
        throw createError("Title is required");
      }

      db.tasks.push(task);
      writeDb(db);
      return response({ task });
    }

    throw createError("Route not found", 404);
  },

  async put(url, body) {
    const db = readDb();
    const { pathname } = parseUrl(url);
    const taskId = taskIdFromPath(pathname);

    if (!taskId) {
      throw createError("Route not found", 404);
    }

    const userId = getUserIdFromToken();
    const index = db.tasks.findIndex((task) => task._id === taskId && task.user === userId);

    if (index === -1) {
      throw createError("Task not found", 404);
    }

    db.tasks[index] = {
      ...db.tasks[index],
      ...body,
      dueDate: body.dueDate === "" ? null : body.dueDate ?? db.tasks[index].dueDate,
      updatedAt: new Date().toISOString()
    };

    writeDb(db);
    return response({ task: db.tasks[index] });
  },

  async delete(url) {
    const db = readDb();
    const { pathname } = parseUrl(url);
    const taskId = taskIdFromPath(pathname);

    if (!taskId) {
      throw createError("Route not found", 404);
    }

    const userId = getUserIdFromToken();
    const index = db.tasks.findIndex((task) => task._id === taskId && task.user === userId);

    if (index === -1) {
      throw createError("Task not found", 404);
    }

    db.tasks.splice(index, 1);
    writeDb(db);
    return response({ message: "Task deleted" });
  }
};

export default demoApi;
