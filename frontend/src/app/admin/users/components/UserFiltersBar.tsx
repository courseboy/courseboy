import { Privilege } from "@/types";

interface UserFiltersBarProps {
  searchQuery: string;
  roleFilter: string;
  privileges: Privilege[];
  onSearchChange: (query: string) => void;
  onRoleChange: (role: string) => void;
}

export function UserFiltersBar({
  searchQuery,
  roleFilter,
  privileges,
  onSearchChange,
  onRoleChange,
}: UserFiltersBarProps) {
  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-2">
      <SearchInput value={searchQuery} onChange={onSearchChange} />
      <RoleSelect
        value={roleFilter}
        privileges={privileges}
        onChange={onRoleChange}
      />
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="flex-1 relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-lg focus:bg-white focus:border-[#3A7BD5] focus:ring-0 text-sm placeholder:text-[#6B7280]/70 transition-all"
        placeholder="Search by username or email..."
      />
    </div>
  );
}

interface RoleSelectProps {
  value: string;
  privileges: Privilege[];
  onChange: (value: string) => void;
}

function RoleSelect({ value, privileges, onChange }: RoleSelectProps) {
  return (
    <div className="flex gap-2">
      <div className="relative min-w-[140px]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border-transparent rounded-lg py-3 pl-4 pr-10 text-sm text-[#1F2933] font-medium focus:border-[#3A7BD5] focus:ring-0 cursor-pointer"
        >
          <option value="all">All Roles</option>
          {privileges.map((privilege) => (
            <option key={privilege.id} value={privilege.name}>
              {privilege.name}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none text-sm">
          expand_more
        </span>
      </div>
    </div>
  );
}
