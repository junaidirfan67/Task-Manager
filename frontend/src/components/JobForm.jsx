import { BriefcaseBusiness, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

const emptyJob = {
  title: "",
  company: "",
  location: "",
  salary: "",
  type: "Full-time",
  workplace: "Remote",
  description: "",
  requirements: "",
  status: "active"
};

function JobForm({ initialJob, onCancel, onSubmit, saving, user }) {
  const [form, setForm] = useState(emptyJob);

  useEffect(() => {
    if (initialJob) {
      setForm({
        title: initialJob.title || "",
        company: initialJob.company || "",
        location: initialJob.location || "",
        salary: initialJob.salary || "",
        type: initialJob.type || "Full-time",
        workplace: initialJob.workplace || "Remote",
        description: initialJob.description || "",
        requirements: initialJob.requirements || "",
        status: initialJob.status || "active"
      });
    } else {
      setForm({ ...emptyJob, company: user?.company || "" });
    }
  }, [initialJob, user?.company]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-blue-700">{initialJob ? "Edit role" : "New role"}</p>
          <h2 className="truncate text-xl font-bold text-slate-950">{initialJob ? initialJob.title : "Post a job"}</h2>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-secondary h-9 w-9 p-0" title="Close form">
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">
            Job title
          </label>
          <input id="title" name="title" value={form.title} onChange={updateField} className="field mt-1" required />
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input id="company" name="company" value={form.company} onChange={updateField} className="field mt-1" required />
        </div>
        <div>
          <label className="label" htmlFor="location">
            Location
          </label>
          <input id="location" name="location" value={form.location} onChange={updateField} className="field mt-1" placeholder="Lahore, Pakistan" required />
        </div>
        <div>
          <label className="label" htmlFor="salary">
            Salary
          </label>
          <input id="salary" name="salary" value={form.salary} onChange={updateField} className="field mt-1" placeholder="PKR 180k - 300k/month" />
        </div>
        <div>
          <label className="label" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" value={form.type} onChange={updateField} className="field mt-1">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="workplace">
            Workplace
          </label>
          <select id="workplace" name="workplace" value={form.workplace} onChange={updateField} className="field mt-1">
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea id="description" name="description" value={form.description} onChange={updateField} className="textarea-field mt-1" required />
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="requirements">
          Requirements
        </label>
        <textarea id="requirements" name="requirements" value={form.requirements} onChange={updateField} className="textarea-field mt-1" />
      </div>

      {initialJob ? (
        <div className="mt-4">
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" value={form.status} onChange={updateField} className="field mt-1">
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={saving}>
        {initialJob ? <Save size={18} aria-hidden="true" /> : <BriefcaseBusiness size={18} aria-hidden="true" />}
        {saving ? "Saving..." : initialJob ? "Save changes" : "Post job"}
      </button>
    </form>
  );
}

export default JobForm;
