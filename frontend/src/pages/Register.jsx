import { BriefcaseBusiness, Building2, UserRound, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    skills: "",
    resume: "",
    company: "",
    headline: "",
    location: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-700 text-white">
            <BriefcaseBusiness size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">HireHub</p>
            <h1 className="text-2xl font-bold text-slate-950">Create account</h1>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, role: "candidate" }))}
              className={`flex h-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
                form.role === "candidate" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
              }`}
            >
              <UserRound size={18} aria-hidden="true" />
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, role: "employer" }))}
              className={`flex h-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
                form.role === "employer" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
              }`}
            >
              <Building2 size={18} aria-hidden="true" />
              Employer
            </button>
          </div>

          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" value={form.name} onChange={updateField} className="field mt-1" required />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" value={form.email} onChange={updateField} className="field mt-1" required />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              className="field mt-1"
              minLength={6}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="location">
                Location
              </label>
              <input id="location" name="location" value={form.location} onChange={updateField} className="field mt-1" />
            </div>
            <div>
              <label className="label" htmlFor="headline">
                Headline
              </label>
              <input id="headline" name="headline" value={form.headline} onChange={updateField} className="field mt-1" />
            </div>
          </div>

          {form.role === "candidate" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="skills">
                  Skills
                </label>
                <input id="skills" name="skills" value={form.skills} onChange={updateField} className="field mt-1" />
              </div>
              <div>
                <label className="label" htmlFor="resume">
                  Resume link
                </label>
                <input id="resume" name="resume" value={form.resume} onChange={updateField} className="field mt-1" />
              </div>
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="company">
                Company
              </label>
              <input id="company" name="company" value={form.company} onChange={updateField} className="field mt-1" required />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            <UserPlus size={18} aria-hidden="true" />
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-700 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
