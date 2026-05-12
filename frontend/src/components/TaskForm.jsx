import { CalendarDays, Flag, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

const emptyTask = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: ""
};

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function TaskForm({ initialTask, onCancel, onSubmit, saving }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "todo",
        priority: initialTask.priority || "medium",
        dueDate: formatDateForInput(initialTask.dueDate)
      });
    } else {
      setForm(emptyTask);
    }
  }, [initialTask]);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      dueDate: form.dueDate || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-500">{initialTask ? "Edit task" : "New task"}</p>
          <h2 className="truncate text-xl font-bold text-zinc-950">{initialTask ? "Update details" : "Create a task"}</h2>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-secondary h-9 w-9 p-0" title="Close form">
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={updateField}
            className="field mt-1"
            placeholder="Plan sprint tasks"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={updateField}
            className="textarea-field mt-1"
            placeholder="Add notes or acceptance criteria"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select id="status" name="status" value={form.status} onChange={updateField} className="field mt-1">
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="priority">
              Priority
            </label>
            <div className="relative mt-1">
              <Flag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <select id="priority" name="priority" value={form.priority} onChange={updateField} className="field pl-9">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="dueDate">
              Due date
            </label>
            <div className="relative mt-1">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={updateField}
                className="field pl-9"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={saving}>
          <Save size={18} aria-hidden="true" />
          {saving ? "Saving..." : initialTask ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
