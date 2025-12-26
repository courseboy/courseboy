interface Privilege {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  _count?: {
    userPrivileges: number;
    courses: number;
  };
}

interface PrivilegeCardProps {
  privilege: Privilege;
  onEdit: () => void;
  onDelete: () => void;
}

export function PrivilegeCard({
  privilege,
  onEdit,
  onDelete,
}: PrivilegeCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3A7BD5]/10 text-[#3A7BD5]">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{privilege.name}</h3>
            {privilege.price !== null && (
              <span className="text-sm font-medium text-green-600">
                ฿{privilege.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ActionButton
            icon="edit"
            onClick={onEdit}
            hoverClass="hover:bg-gray-100 hover:text-[#3A7BD5]"
            title="Edit"
          />
          <ActionButton
            icon="delete"
            onClick={onDelete}
            hoverClass="hover:bg-red-50 hover:text-red-600"
            title="Delete"
          />
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 min-h-[40px] text-sm text-gray-600">
        {privilege.description || "No description"}
      </p>

      {/* Stats */}
      {privilege._count && <PrivilegeStats count={privilege._count} />}
    </div>
  );
}

interface PrivilegeStatsProps {
  count: {
    userPrivileges: number;
    courses: number;
  };
}

function PrivilegeStats({ count }: PrivilegeStatsProps) {
  return (
    <div className="flex gap-4 border-t border-gray-100 pt-3">
      <StatItem icon="group" label="users" value={count.userPrivileges} />
      <StatItem icon="book_2" label="courses" value={count.courses} />
    </div>
  );
}

interface StatItemProps {
  icon: string;
  label: string;
  value: number;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {value} {label}
    </div>
  );
}

interface ActionButtonProps {
  icon: string;
  onClick: () => void;
  hoverClass: string;
  title: string;
}

function ActionButton({ icon, onClick, hoverClass, title }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-1.5 text-gray-500 transition-colors ${hoverClass}`}
      title={title}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </button>
  );
}

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
      <span className="material-symbols-outlined text-4xl text-gray-400">
        verified_user
      </span>
      <p className="mt-2 text-gray-600">No privileges created yet</p>
      <button
        onClick={onCreateClick}
        className="mt-4 text-sm font-medium text-[#3A7BD5] hover:underline"
      >
        Create your first privilege
      </button>
    </div>
  );
}
