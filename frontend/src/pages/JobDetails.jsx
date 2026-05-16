import { ArrowLeft, BriefcaseBusiness, Building2, CheckCircle2, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ coverLetter: "", resume: user?.resume || "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    api
      .get(`/jobs/${id}`)
      .then(({ data }) => {
        if (active) setJob(data.job);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Unable to load job");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitApplication = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.post(`/applications/apply/${id}`, form);
      setMessage("Application submitted");
      setForm((current) => ({ ...current, coverLetter: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit application");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/jobs" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft size={16} aria-hidden="true" />
          Jobs
        </Link>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">Loading job...</div>
        ) : error && !job ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">{error}</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="badge bg-blue-50 text-blue-700">{job.workplace}</span>
                    <span className="badge bg-slate-100 text-slate-700">{job.type}</span>
                    <span className="badge bg-cyan-50 text-cyan-700">{job.status}</span>
                  </div>
                  <h1 className="break-words text-3xl font-black text-slate-950">{job.title}</h1>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={16} className="text-slate-400" aria-hidden="true" />
                      {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={16} className="text-slate-400" aria-hidden="true" />
                      {job.location}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:text-right">
                  <p className="text-sm font-bold text-slate-500">Compensation</p>
                  <p className="mt-1 text-lg font-black text-slate-950">{job.salary || "Undisclosed"}</p>
                </div>
              </div>

              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-black text-slate-950">Overview</h2>
                  <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-slate-700">{job.description}</p>
                </section>
                {job.requirements ? (
                  <section>
                    <h2 className="text-lg font-black text-slate-950">Requirements</h2>
                    <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-slate-700">{job.requirements}</p>
                  </section>
                ) : null}
              </div>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-700 text-white">
                    <BriefcaseBusiness size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">Application</p>
                    <h2 className="text-xl font-black text-slate-950">{job.applicantCount || 0} applicants</h2>
                  </div>
                </div>

                {message ? (
                  <div className="mb-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {message}
                  </div>
                ) : null}

                {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</div> : null}

                {isAuthenticated && user?.role === "candidate" ? (
                  <form onSubmit={submitApplication} className="space-y-4">
                    <div>
                      <label className="label" htmlFor="resume">
                        Resume link
                      </label>
                      <input id="resume" name="resume" value={form.resume} onChange={updateField} className="field mt-1" />
                    </div>
                    <div>
                      <label className="label" htmlFor="coverLetter">
                        Cover letter
                      </label>
                      <textarea id="coverLetter" name="coverLetter" value={form.coverLetter} onChange={updateField} className="textarea-field mt-1" />
                    </div>
                    <button type="submit" className="btn btn-accent w-full" disabled={saving}>
                      <Send size={18} aria-hidden="true" />
                      {saving ? "Submitting..." : "Apply now"}
                    </button>
                  </form>
                ) : isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary w-full">
                    Employer dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary w-full">
                    Sign in to apply
                  </Link>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default JobDetails;
