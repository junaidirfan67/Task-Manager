import { BriefcaseBusiness, LayoutDashboard, LogIn, LogOut, Search, UserPlus } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const linkClass = ({ isActive }) =>
    `inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
      isActive ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
            <BriefcaseBusiness size={21} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-wide text-blue-700">HireHub</p>
            <h1 className="truncate text-lg font-bold text-slate-950">Talent Workspace</h1>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/jobs" className={linkClass}>
            <Search size={17} aria-hidden="true" />
            Jobs
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard size={17} aria-hidden="true" />
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden max-w-44 truncate text-sm font-semibold text-slate-600 sm:inline">{user?.name}</span>
              <button type="button" onClick={logout} className="btn btn-secondary h-10 w-10 p-0 sm:w-auto sm:px-4" title="Log out">
                <LogOut size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary h-10 w-10 p-0 sm:w-auto sm:px-4" title="Sign in">
                <LogIn size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link to="/register" className="btn btn-primary h-10 w-10 p-0 sm:w-auto sm:px-4" title="Create account">
                <UserPlus size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Join</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
