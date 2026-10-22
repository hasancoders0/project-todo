
"use client";

import {
  ArrowDownUp,
  Plus,
  Search,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Todos" },
  { value: "PENDING", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All priorities" },
  { value: "HIGH", label: "High priority" },
  { value: "MEDIUM", label: "Medium priority" },
  { value: "LOW", label: "Low priority" },
];

export default function ProjectTodoToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  stats,
  totalTodos,
  filteredCount,
  hasFilters,
  clearFilters,
  onCreateTodo,
  isActive,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Todos..."
            aria-label="Search Todos"
            className="h-9 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:shrink-0">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter by priority"
            className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="relative col-span-2 sm:col-span-1">
            <ArrowDownUp
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort Todos"
              className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="DEADLINE">Deadline</option>
              <option value="PRIORITY">Priority</option>
              <option value="CREATED">Newest first</option>
              <option value="TITLE">Title A–Z</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateTodo}
          disabled={!isActive}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={15} />
          New Todo
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-slate-100 pt-2">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500">
            Showing {filteredCount} of {totalTodos} Todos
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-slate-600 hover:text-slate-950"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>
            <strong className="font-semibold text-slate-800">
              {stats.completed}
            </strong>{" "}
            completed
          </span>

          <span>
            <strong className="font-semibold text-slate-800">
              {stats.inProgress}
            </strong>{" "}
            in progress
          </span>

          <span>
            <strong className="font-semibold text-slate-800">
              {stats.pending}
            </strong>{" "}
            not started
          </span>

          <span className="font-semibold text-slate-800">
            {stats.progress}%
          </span>
        </div>
      </div>

      <div
        className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Project Todo completion progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stats.progress}
      >
        <div
          className="h-full rounded-full bg-slate-950 transition-all duration-300"
          style={{ width: `${stats.progress}%` }}
        />
      </div>
    </section>
  );
}
