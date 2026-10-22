
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  CheckCircle2,
  UserRound,
  ClipboardList,
  X,
} from "lucide-react";

const adminLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "All Todos", href: "/todos", icon: ListTodo },
  { label: "Team Members", href: "/team", icon: Users },
  { label: "Completed Tasks", href: "/completed", icon: CheckCircle2 },
];

const memberLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Todos", href: "/todos", icon: ClipboardList },
  { label: "Completed Tasks", href: "/completed", icon: CheckCircle2 },
  { label: "My Profile", href: "/profile", icon: UserRound },
];

export default function AppSidebar({ role }) {
  const links = role === "ADMIN" ? adminLinks : memberLinks;

  return (
    <aside className="flex min-h-screen w-full shrink-0 flex-col border-r border-gray-200 bg-white md:w-64">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
          <CheckCircle2 size={21} />
        </div>
        <div>
          <p className="font-semibold tracking-tight">Project Todo</p>
          <p className="text-xs text-gray-500">Team workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        {links.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
          >
            <Icon size={19} strokeWidth={1.8} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-800">
            {role === "ADMIN" ? "Administrator" : "Team Member"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Project management workspace
          </p>
        </div>
      </div>
    </aside>
  );
}
