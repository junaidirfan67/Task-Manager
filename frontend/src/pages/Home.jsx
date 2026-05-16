import { ArrowRight, BriefcaseBusiness, Building2, MapPin, Search, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ search: "", location: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/jobs?sort=newest")
      .then(({ data }) => {
        if (active) setJobs(data.jobs.slice(0, 3));
      })
      .catch(() => {
        if (active) setJobs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Open roles", value: jobs.length ? `${jobs.length}+` : "Live", icon: BriefcaseBusiness },
      { label: "Hiring teams", value: new Set(jobs.map((job) => job.company)).size || 3, icon: Building2 },
      { label: "Applicants", value: jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0), icon: Users }
    ],
    [jobs]
  );

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (form.search.trim()) params.set("search", form.search.trim());
    if (form.location.trim()) params.set("location", form.location.trim());

    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-blue-50 text-slate-950">
      <Navbar />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8 lg:py-14">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                <Sparkles size={16} aria-hidden="true" />
                MERN Job Portal
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                HireHub
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                A focused workspace for discovering roles, managing applications, and running employer pipelines.
              </p>

              <form onSubmit={submitSearch} className="mt-7 grid gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                  <input name="search" value={form.search} onChange={updateField} className="field pl-10" placeholder="Role, skill, or company" />
                </label>
                <label className="relative block">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                  <input name="location" value={form.location} onChange={updateField} className="field pl-10" placeholder="Lahore, Pakistan" />
                </label>
                <button type="submit" className="btn btn-primary h-11 px-5">
                  Search
                </button>
              </form>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                      <Icon className="mb-3 text-slate-400" size={20} aria-hidden="true" />
                      <p className="text-2xl font-black text-slate-950">{item.value}</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-lg border border-blue-800 bg-blue-950 p-5 text-white shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-cyan-200">Pipeline snapshot</p>
                  <h2 className="text-2xl font-black">Today at HireHub</h2>
                </div>
                <BriefcaseBusiness className="text-cyan-200" size={28} aria-hidden="true" />
              </div>
              <div className="space-y-3">
                {(jobs.length ? jobs : [{ title: "Loading roles", company: "HireHub", location: "Remote" }]).map((job) => (
                  <div key={`${job.title}-${job.company}`} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="truncate text-base font-bold">{job.title}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                      {job.company} · {job.location}
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/jobs" className="btn mt-5 w-full bg-white text-blue-900 hover:bg-blue-50">
                Browse jobs
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Featured</p>
              <h2 className="text-2xl font-black text-slate-950">Fresh roles</h2>
            </div>
            <Link to="/jobs" className="btn btn-secondary">
              View all
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">Loading jobs...</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} compact />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
