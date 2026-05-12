import { CalendarDays, CheckCircle2, Edit3, Trash2 } from "lucide-react";

const priorityClasses = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-red-200 bg-red-50 text-red-700"
};

const statusClasses = {
  todo: "bg-zinc-100 text-zinc-700",
  "in-progress": "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700"
};

const statusLabels = {
  todo: "To do",
  "in-progress": "In progress",
  completed: "Completed"
};

function formatDueDate(value) {
  if (!value) {
    return "No due date";
  }

  const datePart = String(value).slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(localDate);
}

function isPastDue(value) {
  if (!value) {
    return false;
  }

  const datePart = String(value).slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return dueDate < todayDate;
}

function TaskCard({ task, onDelete, onEdit, onQuickComplete }) {
  const isComplete = task.status === "completed";
  const isOverdue = !isComplete && isPastDue(task.dueDate);

  return (
    <article className="bg-white p-4 md:grid md:grid-cols-[minmax(0,1fr)_120px_120px_150px_122px] md:items-center md:gap-4 md:px-4 md:py-3">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 md:hidden">
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${statusClasses[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          <span className={`rounded-md border px-2 py-1 text-xs font-bold capitalize ${priorityClasses[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <h3 className={`break-words text-base font-bold ${isComplete ? "text-zinc-400 line-through" : "text-zinc-950"}`}>
          {task.title}
        </h3>
        {task.description ? (
          <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">{task.description}</p>
        ) : (
          <p className="mt-1 text-sm font-medium text-zinc-400">No description</p>
        )}
      </div>

      <div className="mt-4 hidden md:block">
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${statusClasses[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </div>

      <div className="mt-4 hidden md:block">
        <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-bold capitalize ${priorityClasses[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className={`mt-4 flex items-center gap-2 text-sm font-semibold md:mt-0 ${isOverdue ? "text-red-700" : "text-zinc-500"}`}>
        <CalendarDays size={16} className="shrink-0" aria-hidden="true" />
        <span className="truncate">{isOverdue ? `Overdue: ${formatDueDate(task.dueDate)}` : formatDueDate(task.dueDate)}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 md:mt-0 md:justify-end">
        {!isComplete ? (
          <button
            type="button"
            onClick={() => onQuickComplete(task)}
            className="btn btn-secondary h-9 w-9 p-0"
            title="Mark complete"
          >
            <CheckCircle2 size={17} aria-hidden="true" />
          </button>
        ) : null}
        <button type="button" onClick={() => onEdit(task)} className="btn btn-secondary h-9 w-9 p-0" title="Edit task">
          <Edit3 size={17} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onDelete(task._id)} className="btn btn-danger h-9 w-9 p-0" title="Delete task">
          <Trash2 size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
