"use client";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1F2933] tracking-tight">
            Dashboard
          </h2>
          <p className="text-[#6B7280] mt-1 text-base">
            Welcome to the admin dashboard.
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200/60 text-center">
        <span className="material-symbols-outlined text-6xl text-[#6B7280] mb-4">
          construction
        </span>
        <h3 className="text-xl font-bold text-[#1F2933] mb-2">Coming Soon</h3>
        <p className="text-[#6B7280]">
          Dashboard analytics and statistics will be available here.
        </p>
      </div>
    </div>
  );
}
