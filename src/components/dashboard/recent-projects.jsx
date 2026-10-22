
import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";

const statusStyles = {
  ACTIVE: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export default function RecentProjects({ projects }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h2 className="font-semibold text-gray-900">Recent Projects</h2>
          <p className="mt-1 text-sm text-gray-500">
            Your latest project activity
          </p>
        </div>

        <Link
          href="/projects"
          className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center">
          <FolderKanban className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-700">
            No projects yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Projects will appear here when they're created.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {projects.map((project) => {
            const total = project._count.todos;
            const completed = project.todos.length;
            const progress =
              total === 0 ? 0 : Math.round((completed / total) * 100);

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-5 transition hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Deadline:{" "}
                      {new Date(project.deadlineAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusStyles[project.status] || statusStyles.ARCHIVED
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs text-gray-500">
                    <span>Task progress</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
