
"use client";

import { ListTodo, CircleDashed, Clock3, CircleCheck } from "lucide-react";

const FILTERS = [
  { value: "ALL", label: "All Todos", icon: ListTodo },
  { value: "PENDING", label: "Pending", icon: CircleDashed },
  { value: "IN_PROGRESS", label: "In progress", icon: Clock3 },
  { value: "COMPLETED", label: "Completed", icon: CircleCheck },
];

export default function TodoFilterBar({
  value = "ALL",
  onChange,
  counts = {},
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1"
      aria-label="Filter Todos by status"
    >
      {FILTERS.map(({ value: filterValue, label, icon: Icon }) => {
        const active = value === filterValue;
        const count =
          filterValue === "ALL"
            ? counts.ALL
            : counts[filterValue];

        return (
          <button
            key={filterValue}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filterValue)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-slate-950 font-medium text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
            <span
              className={`text-xs tabular-nums ${
                active ? "text-slate-300" : "text-slate-400"
              }`}
            >
              {count ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
