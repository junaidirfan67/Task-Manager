import { CheckSquare, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout, user } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
            <CheckSquare size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-500">Task Manager</p>
            <h1 className="truncate text-lg font-bold text-slate-950">Welcome, {user?.name}</h1>
          </div>
        </div>
        <button type="button" onClick={logout} className="btn btn-secondary shrink-0" title="Log out">
          <LogOut size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
