import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, totalItems = 0, pageSize = 10 }) => {
  if (totalPages <= 1) return null;

  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] px-6 py-4 bg-[#0E111B]/60">
      <div className="text-xs text-slate-400">
        Showing <span className="font-semibold text-slate-200">{start}</span> to{' '}
        <span className="font-semibold text-slate-200">{end}</span> of{' '}
        <span className="font-semibold text-white">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-[#121522] text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous Page"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`flex h-8 min-w-[2rem] px-2 items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 ${
              currentPage === num
                ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                : 'border border-white/[0.08] bg-[#121522] text-slate-300 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-[#121522] text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next Page"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
