import React, { useState, useMemo } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiFilm } from 'react-icons/fi';
import Pagination from './Pagination';

const DataTable = ({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchField = 'title',
  filterableFields = [],
  defaultSortField = null,
  pageSize = 10,
  actionButton = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(term);
        });
      });
    }

    // Dropdown filter
    if (selectedFilter !== 'all' && filterableFields.length > 0) {
      result = result.filter((item) => {
        const fieldName = filterableFields[0].field;
        return item[fieldName] === selectedFilter;
      });
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [data, searchTerm, selectedFilter, sortField, sortDirection, filterableFields]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#10131E]/95 shadow-card backdrop-blur-xl overflow-hidden">
      {/* Table Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/[0.06] bg-[#0E111B]/40">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-white/[0.08] bg-[#141824] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition"
          />
        </div>

        {/* Filter Dropdown + Action Button */}
        <div className="flex items-center gap-3">
          {filterableFields.length > 0 && (
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-white/[0.08] bg-[#141824] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20"
            >
              <option value="all">All {filterableFields[0].label}</option>
              {filterableFields[0].options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {actionButton}
        </div>
      </div>

      {/* Table Wrapper for Responsive Scrolling */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead className="bg-[#0A0C14]/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-6 py-4 ${col.sortable ? 'cursor-pointer hover:text-white select-none' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && sortField === col.key && (
                      sortDirection === 'asc' ? (
                        <FiChevronUp className="h-3.5 w-3.5 text-[#E50914]" />
                      ) : (
                        <FiChevronDown className="h-3.5 w-3.5 text-[#E50914]" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || row.movie_id || row.booking_id || row.theater_id || row.user_id || idx}
                  className="hover:bg-white/[0.03] transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-slate-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-400">
                      <FiFilm className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 mt-1">No cinema records found</p>
                    <p className="text-xs text-slate-500">Try adjusting your search criteria or clear your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default DataTable;
