
import { LogOut, UserCircle } from "lucide-react";
import { logout } from "@/actions/team-actions";

export default function AppHeader({ user }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div>
        <h1 className="text-sm font-semibold text-gray-900">
          Project Todo
        </h1>
        <p className="text-xs text-gray-500">
          Manage your projects and tasks
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <UserCircle className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">
              {user.role}
            </p>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
