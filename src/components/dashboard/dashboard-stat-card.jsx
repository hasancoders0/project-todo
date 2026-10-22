
export default function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}
