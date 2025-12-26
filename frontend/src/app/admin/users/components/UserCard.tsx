import { AdminUser } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { getPrivilegeBadgeStyle, getUserInitials } from "../utils";

interface UserCardProps {
  user: AdminUser;
  isLoading: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

export function UserCard({
  user,
  isLoading,
  onEdit,
  onDeactivate,
  onActivate,
}: UserCardProps) {
  const initials = getUserInitials(user);

  return (
    <div
      className={`group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-xl border shadow-sm hover:shadow-md transition-all gap-4 ${
        user.isActive
          ? "bg-white border-slate-200/60 hover:border-[#3A7BD5]/20"
          : "bg-slate-50 border-slate-200 opacity-80"
      }`}
    >
      <UserInfo user={user} initials={initials} />
      <UserActions
        user={user}
        isLoading={isLoading}
        onEdit={onEdit}
        onDeactivate={onDeactivate}
        onActivate={onActivate}
      />
    </div>
  );
}

function UserInfo({ user, initials }: { user: AdminUser; initials: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`size-12 rounded-full flex items-center justify-center font-bold text-lg ring-2 ring-slate-100 ${
          user.isActive
            ? "bg-[#3A7BD5]/10 text-[#3A7BD5]"
            : "bg-slate-100 text-slate-400 grayscale"
        }`}
      >
        {initials}
      </div>
      <div className="flex flex-col">
        <span
          className={`text-base font-bold transition-colors ${
            user.isActive
              ? "text-[#1F2933] group-hover:text-[#3A7BD5]"
              : "text-[#6B7280] line-through decoration-slate-400"
          }`}
        >
          {user.username || "No username"}
        </span>
        <span className="text-sm text-[#6B7280]">{user.email}</span>
      </div>
    </div>
  );
}

interface UserActionsProps {
  user: AdminUser;
  isLoading: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

function UserActions({
  user,
  isLoading,
  onEdit,
  onDeactivate,
  onActivate,
}: UserActionsProps) {
  return (
    <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/2">
      <UserPrivileges user={user} />
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="size-10 flex items-center justify-center">
            <Spinner size="sm" />
          </div>
        ) : user.isActive ? (
          <>
            <ActionButton
              icon="edit"
              title="Edit User"
              onClick={onEdit}
              hoverClass="hover:bg-[#EEF2F7] hover:text-[#3A7BD5]"
            />
            <ActionButton
              icon="block"
              title="Deactivate User"
              onClick={onDeactivate}
              hoverClass="hover:bg-red-50 hover:text-red-500"
            />
          </>
        ) : (
          <ActionButton
            icon="history"
            title="Restore User"
            onClick={onActivate}
            hoverClass="hover:bg-[#EEF2F7]"
          />
        )}
      </div>
    </div>
  );
}

function UserPrivileges({ user }: { user: AdminUser }) {
  if (!user.isActive) {
    return (
      <div className="flex flex-col md:items-end gap-1">
        <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          Deactivated
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:items-end gap-1">
      <div className="flex flex-wrap gap-1">
        {user.privileges.map((privilege) => (
          <span
            key={privilege}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPrivilegeBadgeStyle(
              privilege
            )}`}
          >
            {privilege}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: string;
  title: string;
  onClick: () => void;
  hoverClass: string;
}

function ActionButton({ icon, title, onClick, hoverClass }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`size-10 flex items-center justify-center rounded-lg text-[#6B7280] transition-colors ${hoverClass}`}
      title={title}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
