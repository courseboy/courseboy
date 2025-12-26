import { PaginationMeta } from "@/types";

interface PaginationProps {
  pagination: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

const MAX_VISIBLE_PAGES = 5;

export function Pagination({
  pagination,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, pagination.total);

  return (
    <div className="flex items-center justify-center md:justify-end gap-2 pt-4 pb-12">
      <span className="text-sm text-[#6B7280] mr-4">
        Showing {startItem}-{endItem} of {pagination.total} users
      </span>

      <PageButton
        icon="chevron_left"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      />

      {Array.from(
        { length: Math.min(MAX_VISIBLE_PAGES, pagination.totalPages) },
        (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`size-9 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                currentPage === pageNum
                  ? "bg-[#3A7BD5] text-white shadow-md shadow-[#3A7BD5]/30"
                  : "border border-slate-200 text-[#6B7280] hover:bg-white hover:text-[#1F2933]"
              }`}
            >
              {pageNum}
            </button>
          );
        }
      )}

      <PageButton
        icon="chevron_right"
        onClick={() =>
          onPageChange(Math.min(pagination.totalPages, currentPage + 1))
        }
        disabled={currentPage === pagination.totalPages}
      />
    </div>
  );
}

interface PageButtonProps {
  icon: string;
  onClick: () => void;
  disabled: boolean;
}

function PageButton({ icon, onClick, disabled }: PageButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-[#6B7280] hover:bg-white hover:text-[#1F2933] transition-colors disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
    </button>
  );
}
