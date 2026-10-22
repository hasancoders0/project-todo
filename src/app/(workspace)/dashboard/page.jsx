
import {
  getDashboardStats,
  getRecentProjects,
  getTasksDueSoon,
} from "@/lib/dashboard-queries";

import DashboardStats from "@/components/dashboard/dashboard-stats";
import RecentProjects from "@/components/dashboard/recent-projects";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";

export default async function DashboardPage() {
  const [stats, projects, upcomingTasks] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(),
    getTasksDueSoon(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your team's projects and tasks.
        </p>
      </header>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentProjects projects={projects} />
        <UpcomingDeadlines tasks={upcomingTasks} />
      </div>
    </div>
  );
}
