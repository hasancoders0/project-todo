
import AppSidebar from "@/components/layout/app-sidebar";
import AppHeader from "@/components/layout/app-header";

export default function WorkspaceShell({ user, children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">
      <AppSidebar role={user.role} />
      <div className="min-w-0 flex-1">
        <AppHeader user={user} />
        <main className="p-2 sm:p-3 lg:p-4">
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
