import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Enterprise-grade Pagination component.
 * Ensures consistent 10-documents-per-page navigation across all platform tables and views.
 *
 * @param {number} currentPage - Active page number (1-based)
 * @param {number} totalItems - Total count of matching items
 * @param {number} itemsPerPage - Number of items displayed per page (default: 10)
 * @param {function} onPageChange - Callback invoked when a new page is selected: (page) => void
 * @param {string} itemName - Noun for the item being paginated (e.g. "documents", "results")
 * @param {string} className - Additional CSS classes
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  itemName = 'documents',
  className = ''
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * itemsPerPage);

  const handlePageSelect = (page) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) return;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Generate page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    const leftBound = Math.max(2, safeCurrentPage - 1);
    const rightBound = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (leftBound > 2) {
      pages.push('ellipsis-left');
    }

    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }

    if (rightBound < totalPages - 1) {
      pages.push('ellipsis-right');
    }

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {/* Item Range Counter */}
      <div className="text-xs sm:text-sm text-slate-500 font-medium">
        {totalItems === 0 ? (
          <span>No {itemName} to display</span>
        ) : (
          <span>
            Showing <strong className="text-slate-800 font-bold">{startItem}</strong> to{' '}
            <strong className="text-slate-800 font-bold">{endItem}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{totalItems}</strong> {itemName}
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        {/* First Page Quick Jump */}
        {totalPages > 5 && (
          <button
            type="button"
            onClick={() => handlePageSelect(1)}
            disabled={safeCurrentPage === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="First Page"
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => handlePageSelect(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="inline-flex h-9 items-center justify-center gap-1 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex h-9 w-7 items-center justify-center text-xs text-slate-400 font-bold select-none"
                >
                  •••
                </span>
              );
            }

            const isActive = p === safeCurrentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePageSelect(p)}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-9 min-w-[36px] px-2.5 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 ring-2 ring-blue-600/20'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => handlePageSelect(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="inline-flex h-9 items-center justify-center gap-1 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>

        {/* Last Page Quick Jump */}
        {totalPages > 5 && (
          <button
            type="button"
            onClick={() => handlePageSelect(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Last Page"
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
