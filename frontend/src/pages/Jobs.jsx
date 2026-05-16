import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";

const initialFilters = {
  search: "",
  location: "",
  type: "all",
  workplace: "all",
  sort: "newest"
};

function filtersFromParams(params) {
  return {
    search: params.get("search") || "",
    location: params.get("location") || "",
    type: params.get("type") || "all",
    workplace: params.get("workplace") || "all",
    sort: params.get("sort") || "newest"
  };
}

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .get(`/jobs?${queryString}`)
      .then(({ data }) => {
        if (active) setJobs(data.jobs);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Unable to load jobs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queryString]);

  const updateField = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitFilters = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== initialFilters[key]) params.set(key, value);
    });
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-blue-50 text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-blue-700" aria-hidden="true" />
            <h1 className="text-2xl font-black text-slate-950">Jobs</h1>
          </div>

          <form onSubmit={submitFilters} className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_160px_160px_120px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input name="search" value={filters.search} onChange={updateField} className="field pl-10" placeholder="Search jobs" />
            </label>
            <input name="location" value={filters.location} onChange={updateField} className="field" placeholder="Lahore, Pakistan" />
            <select name="type" value={filters.type} onChange={updateField} className="field">
              <option value="all">All types</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
            <select name="workplace" value={filters.workplace} onChange={updateField} className="field">
              <option value="all">Any workplace</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
            <button type="submit" className="btn btn-primary h-11">
              Filter
            </button>
          </form>
        </section>

        {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</div> : null}

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">Loading jobs...</div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job._id} job={job} />)
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
              <h2 className="text-xl font-black text-slate-950">No jobs found</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">Try a different search or filter set.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Jobs;
