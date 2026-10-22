
import Link from "next/link";
import {
  CalendarClock,
  ArrowRight,
  Clock3,
} from "lucide-react";

const priorityStyles = {
  HIGH: "bg-red-50 text-red-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW: "bg-gray-100 text-gray-600",
};

const statusLabels = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
};

function formatDeadline(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UpcomingDeadlines({ tasks }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h2 className="font-semibold text-gray-900">
            Upcoming Deadlines
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tasks due within the next seven days
          </p>
        </div>

        <Link
          href="/tasks"
          className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
        >
          View tasks
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-700">
            No upcoming deadlines
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Tasks due in the next seven days will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-gray-900">
                  {task.title}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {task.project.name}
                  {" · "}
                  Assigned to {task.assignee.name}
                </p>

                <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  Due {formatDeadline(task.deadlineAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    priorityStyles[task.priority] ||
                    priorityStyles.MEDIUM
                  }`}
                >
                  {task.priority}
                </span>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {statusLabels[task.status] || task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
