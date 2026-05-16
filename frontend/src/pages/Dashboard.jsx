import { BriefcaseBusiness, Building2, CheckCircle2, FileText, LayoutDashboard, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import JobForm from "../components/JobForm";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const statusLabels = {
  applied: "Applied",
  reviewing: "Reviewing",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected"
};

const statusClasses = {
  applied: "bg-slate-100 text-slate-700",
  reviewing: "bg-blue-50 text-blue-700",
  interview: "bg-cyan-50 text-cyan-700",
  offer: "bg-indigo-50 text-indigo-700",
  rejected: "bg-rose-50 text-rose-700"
};

function formatDate(value) {
  if (!value) return "New";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function StatCard({ label, value, icon: Icon, tone = "slate" }) {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-blue-50 text-blue-700",
    amber: "bg-cyan-50 text-cyan-700",
    sky: "bg-indigo-50 text-indigo-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-md ${toneClasses[tone]}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.get("/applications/me");
      setApplications(data.applications);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const stats = useMemo(
    () => ({
      total: applications.length,
      interviews: applications.filter((application) => application.status === "interview").length,
      offers: applications.filter((application) => application.status === "offer").length
    }),
    [applications]
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Applications" value={stats.total} icon={FileText} tone="slate" />
        <StatCard label="Interviews" value={stats.interviews} icon={Users} tone="amber" />
        <StatCard label="Offers" value={stats.offers} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-700 text-white">
              <LayoutDashboard size={21} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-slate-950">{user?.name}</h2>
              <p className="truncate text-sm font-bold text-slate-500">{user?.headline || user?.email}</p>
            </div>
          </div>
          {user?.location ? <p className="mb-3 text-sm font-bold text-slate-600">{user.location}</p> : null}
          {user?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span key={skill} className="badge bg-slate-100 text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
          <Link to="/jobs" className="btn btn-primary mt-5 w-full">
            Browse jobs
          </Link>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-xl font-black text-slate-950">Applications</h2>
          </div>
          {error ? <div className="m-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</div> : null}
          {loading ? (
            <div className="p-8 text-center text-sm font-bold text-slate-500">Loading applications...</div>
          ) : applications.length ? (
            <div className="divide-y divide-slate-200">
              {applications.map((application) => (
                <article key={application._id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_140px_130px] md:items-center">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-950">{application.job?.title}</h3>
                    <p className="mt-1 truncate text-sm font-bold text-slate-500">
                      {application.job?.company} · {application.job?.location}
                    </p>
                  </div>
                  <span className={`badge w-fit ${statusClasses[application.status]}`}>{statusLabels[application.status]}</span>
                  <p className="text-sm font-bold text-slate-500 md:text-right">{formatDate(application.createdAt)}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="mx-auto mb-3 text-slate-400" size={34} aria-hidden="true" />
              <h3 className="text-lg font-black text-slate-950">No applications yet</h3>
              <Link to="/jobs" className="btn btn-primary mt-4">
                Find jobs
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([api.get("/jobs/employer/mine"), api.get("/applications/employer")]);
      setJobs(jobsResponse.data.jobs);
      setApplications(applicationsResponse.data.applications);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(
    () => ({
      jobs: jobs.length,
      active: jobs.filter((job) => job.status === "active").length,
      applicants: applications.length
    }),
    [applications.length, jobs]
  );

  const startCreate = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const saveJob = async (payload) => {
    setSaving(true);
    setError("");

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
      } else {
        await api.post("/jobs", payload);
      }

      setShowForm(false);
      setEditingJob(null);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save job");
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await api.delete(`/jobs/${jobId}`);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete job");
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update application");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">{user?.company || "Employer"}</p>
          <h1 className="text-3xl font-black text-slate-950">Hiring dashboard</h1>
        </div>
        <button type="button" onClick={startCreate} className="btn btn-primary">
          <Plus size={18} aria-hidden="true" />
          Post job
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Posted jobs" value={stats.jobs} icon={BriefcaseBusiness} tone="slate" />
        <StatCard label="Active roles" value={stats.active} icon={Building2} tone="emerald" />
        <StatCard label="Applicants" value={stats.applicants} icon={Users} tone="sky" />
      </div>

      {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-xl font-black text-slate-950">Jobs</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm font-bold text-slate-500">Loading jobs...</div>
          ) : jobs.length ? (
            <div className="divide-y divide-slate-200">
              {jobs.map((job) => (
                <article key={job._id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_110px_110px_120px] lg:items-center">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-950">{job.title}</h3>
                    <p className="mt-1 truncate text-sm font-bold text-slate-500">
                      {job.location} · {job.type} · {job.workplace}
                    </p>
                  </div>
                  <span className={`badge w-fit ${job.status === "active" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                    {job.status}
                  </span>
                  <p className="text-sm font-bold text-slate-500">{job.applicantCount || 0} applicants</p>
                  <div className="flex gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingJob(job);
                        setShowForm(true);
                      }}
                      className="btn btn-secondary h-9 w-9 p-0"
                      title="Edit job"
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => deleteJob(job._id)} className="btn btn-danger h-9 w-9 p-0" title="Delete job">
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BriefcaseBusiness className="mx-auto mb-3 text-slate-400" size={34} aria-hidden="true" />
              <h3 className="text-lg font-black text-slate-950">No jobs posted</h3>
            </div>
          )}
        </section>

        <aside className="order-first space-y-5 xl:order-none xl:sticky xl:top-20 xl:self-start">
          {showForm ? (
            <JobForm
              initialJob={editingJob}
              onSubmit={saveJob}
              onCancel={() => {
                setShowForm(false);
                setEditingJob(null);
              }}
              saving={saving}
              user={user}
            />
          ) : (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Applicants</h2>
              <div className="mt-4 space-y-3">
                {applications.slice(0, 5).map((application) => (
                  <div key={application._id} className="rounded-lg border border-slate-200 p-3">
                    <p className="truncate text-sm font-black text-slate-950">{application.candidate?.name}</p>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">{application.job?.title}</p>
                    <select value={application.status} onChange={(event) => updateStatus(application._id, event.target.value)} className="field mt-3 h-10">
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {!applications.length ? <p className="text-sm font-bold text-slate-500">No applicants yet.</p> : null}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-blue-50 text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {user?.role === "employer" ? <EmployerDashboard /> : <CandidateDashboard />}
      </main>
    </div>
  );
}

export default Dashboard;
