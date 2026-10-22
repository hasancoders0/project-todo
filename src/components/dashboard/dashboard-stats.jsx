
import {
  FolderKanban,
  ListTodo,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";

const statConfig = [
  {
    key: "activeProjects",
    title: "Active Projects",
    description: "Currently active",
    icon: FolderKanban,
  },
  {
    key: "openTodos",
    title: "Open Tasks",
    description: "Pending or in progress",
    icon: ListTodo,
  },
  {
    key: "overdueTodos",
    title: "Overdue Tasks",
    description: "Past deadline and unfinished",
    icon: Clock3,
  },
  {
    key: "completedTodos",
    title: "Completed Tasks",
    description: "Successfully completed",
    icon: CheckCircle2,
  },
];

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statConfig.map((item) => (
        <DashboardStatCard
          key={item.key}
          title={item.title}
          value={stats[item.key] ?? 0}
          description={item.description}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
