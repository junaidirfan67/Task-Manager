import { ArrowRight, BriefcaseBusiness, Building2, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

const workplaceClasses = {
  Remote: "bg-blue-50 text-blue-700",
  Hybrid: "bg-cyan-50 text-cyan-700",
  "On-site": "bg-indigo-50 text-indigo-700"
};

function formatPosted(value) {
  if (!value) return "New";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function JobCard({ job, compact = false }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`badge ${workplaceClasses[job.workplace] || "bg-slate-100 text-slate-700"}`}>{job.workplace}</span>
            <span className="badge bg-slate-100 text-slate-700">{job.type}</span>
            <span className="badge bg-blue-100 text-blue-800">{formatPosted(job.createdAt)}</span>
          </div>
          <h2 className="break-words text-xl font-bold text-slate-950">{job.title}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-600">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">{job.company}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">{job.location}</span>
            </span>
          </div>
          {!compact ? <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-slate-600">{job.description}</p> : null}
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-slate-950">{job.salary || "Salary undisclosed"}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-500">
              <Users size={14} aria-hidden="true" />
              {job.applicantCount || 0} applicants
            </p>
          </div>
          <Link to={`/jobs/${job._id}`} className="btn btn-secondary shrink-0" title="View job">
            <BriefcaseBusiness size={17} aria-hidden="true" />
            <span className="hidden sm:inline">View</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default JobCard;
