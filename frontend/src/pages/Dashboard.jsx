import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { useAuth } from "../context/AuthContext";

const defaultStats = {
  total: 0,
  todo: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0,
  byPriority: { low: 0, medium: 0, high: 0 }
};

const statCards = [
  { key: "total", label: "Total", icon: ClipboardList },
  { key: "todo", label: "To do", icon: Clock3 },
  { key: "inProgress", label: "In progress", icon: AlertCircle },
  { key: "completed", label: "Completed", icon: CheckCircle2 }
];

const statusFilters = [
  { value: "all", label: "All tasks" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" }
];

function completionRate(stats) {
  return stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
}

function Dashboard() {
  const { logout, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [filters, setFilters] = useState({ status: "all", priority: "all", sort: "newest", search: "" });
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    return params.toString();
  }, [filters]);

  const loadDashboard = async () => {
    setError("");
    setLoading(true);

    try {
      const [tasksResponse, statsResponse] = await Promise.all([
        api.get(`/tasks?${queryParams}`),
        api.get("/tasks/stats")
      ]);

      setTasks(tasksResponse.data.tasks);
      setStats(statsResponse.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [queryParams]);

  const updateFilter = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const setStatusFilter = (status) => {
    setFilters((current) => ({
      ...current,
      status
    }));
  };

  const saveTask = async (payload) => {
    setSaving(true);
    setError("");

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      setShowForm(false);
      setEditingTask(null);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save task");
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm("Delete this task?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete task");
    }
  };

  const quickComplete = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: "completed" });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update task");
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startCreate = () => {
    setEditingTask(null);
    setShowForm((current) => !current);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white">
            <ListChecks size={21} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-500">Task Manager</p>
            <h1 className="truncate text-lg font-bold text-zinc-950">Classic Desk</h1>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <div>
            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-zinc-400">Views</p>
            <div className="space-y-1">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStatusFilter(item.value)}
                  className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${
                    filters.status === item.value ? "bg-teal-50 text-teal-800" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <LayoutDashboard size={17} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-zinc-700">Progress</p>
              <BarChart3 size={17} className="text-teal-700" aria-hidden="true" />
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-3xl font-bold text-zinc-950">{completionRate(stats)}%</span>
              <span className="pb-1 text-sm font-semibold text-zinc-500">complete</span>
            </div>
            <div className="h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-teal-600" style={{ width: `${completionRate(stats)}%` }} />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 p-4">
          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-bold text-zinc-950">{user?.name}</p>
            <p className="truncate text-xs font-semibold text-zinc-500">{user?.email}</p>
          </div>
          <button type="button" onClick={logout} className="btn btn-secondary w-full" title="Log out">
            <LogOut size={18} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white">
              <ListChecks size={21} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-zinc-500">Task Manager</p>
              <h1 className="truncate text-base font-bold text-zinc-950">Hi, {user?.name}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={startCreate} className="btn btn-primary h-10 w-10 p-0" title="New task">
              <Plus size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={logout} className="btn btn-secondary h-10 w-10 p-0" title="Log out">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="min-w-0">
        <div className="hidden h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 lg:flex">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-500">Dashboard</p>
            <h2 className="truncate text-xl font-bold text-zinc-950">Tasks and productivity</h2>
          </div>
          <button type="button" onClick={startCreate} className="btn btn-primary">
            <Plus size={18} aria-hidden="true" />
            New task
          </button>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-6 xl:px-8">
          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.key} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-zinc-500">{item.label}</p>
                    <Icon size={18} className="shrink-0 text-zinc-400" aria-hidden="true" />
                  </div>
                  <p className="text-2xl font-bold text-zinc-950 sm:text-3xl">{stats[item.key]}</p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <SlidersHorizontal size={18} className="shrink-0 text-teal-700" aria-hidden="true" />
                    <h3 className="truncate text-base font-bold text-zinc-950">Task board</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setStatusFilter(item.value)}
                        className={`h-9 rounded-md px-3 text-sm font-semibold transition ${
                          filters.status === item.value
                            ? "bg-teal-700 text-white"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_150px_150px_150px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
                    <input
                      name="search"
                      value={filters.search}
                      onChange={updateFilter}
                      className="field pl-9"
                      placeholder="Search tasks"
                    />
                  </div>
                  <select name="status" value={filters.status} onChange={updateFilter} className="field">
                    <option value="all">All status</option>
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select name="priority" value={filters.priority} onChange={updateFilter} className="field">
                    <option value="all">All priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select name="sort" value={filters.sort} onChange={updateFilter} className="field">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="dueDate">Due date</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>

              {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}

              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_150px_122px] gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500 md:grid">
                  <span>Task</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Due date</span>
                  <span className="text-right">Actions</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-sm font-semibold text-zinc-500">Loading tasks...</div>
                ) : tasks.length > 0 ? (
                  <div className="divide-y divide-zinc-200">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onDelete={deleteTask}
                        onEdit={startEdit}
                        onQuickComplete={quickComplete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <ClipboardList className="mx-auto mb-3 text-zinc-400" size={34} aria-hidden="true" />
                    <h3 className="text-lg font-bold text-zinc-950">No tasks found</h3>
                    <p className="mt-1 text-sm text-zinc-500">Create a task or adjust your filters.</p>
                  </div>
                )}
              </div>
            </div>

            <aside className="order-first space-y-4 xl:order-none xl:sticky xl:top-20 xl:self-start">
              {showForm ? (
                <TaskForm
                  initialTask={editingTask}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                  onSubmit={saveTask}
                  saving={saving}
                />
              ) : (
                <button type="button" onClick={startCreate} className="btn btn-primary hidden w-full xl:inline-flex">
                  <Plus size={18} aria-hidden="true" />
                  Create task
                </button>
              )}

              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-base font-bold text-zinc-950">Priority mix</h3>
                <div className="space-y-3">
                  {["high", "medium", "low"].map((priority) => (
                    <div key={priority}>
                      <div className="mb-1 flex items-center justify-between text-sm font-semibold capitalize text-zinc-600">
                        <span>{priority}</span>
                        <span>{stats.byPriority?.[priority] || 0}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100">
                        <div
                          className={`h-2 rounded-full ${priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${stats.total ? ((stats.byPriority?.[priority] || 0) / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {stats.overdue > 0 ? (
                  <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                    {stats.overdue} overdue task{stats.overdue === 1 ? "" : "s"}
                  </div>
                ) : null}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
