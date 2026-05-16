import { BriefcaseBusiness, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-700 text-white">
            <BriefcaseBusiness size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">HireHub</p>
            <h1 className="text-2xl font-bold text-slate-950">Sign in</h1>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            <LogIn size={18} aria-hidden="true" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link to="/register" className="font-bold text-blue-700 underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
