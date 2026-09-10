import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFilm,
  FiExternalLink,
  FiSearch,
  FiCalendar,
  FiClock,
  FiStar,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../../services/api';
import movieService from '../../services/movieService';
import toast from 'react-hot-toast';

const MovieManagement = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals & Target State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getMovies();
      setMovies(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await movieService.deleteMovie(deleteTarget.movie_id);

      setMovies((prev) => prev.filter((m) => m.movie_id !== deleteTarget.movie_id));
      toast.success(`"${deleteTarget.title}" removed from rotation`);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to remove movie');
    } finally {
      setIsDeleting(false);
    }
  };

  // Collect all unique genres across all loaded movies
  const allAvailableGenres = useMemo(() => {
    const genreSet = new Set();
    movies.forEach((m) => {
      if (Array.isArray(m.genre)) {
        m.genre.forEach((g) => genreSet.add(g));
      } else if (typeof m.genre === 'string' && m.genre.trim()) {
        m.genre.split(',').forEach((g) => genreSet.add(g.trim()));
      }
    });
    return Array.from(genreSet).sort();
  }, [movies]);

  // Filter movies by Search, Status, and Genre
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      // Title search
      const matchesTitle = !searchQuery.trim() ||
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'archived' && (m.status === 'archived' || m.status === 'ended')) ||
        m.status === statusFilter;

      // Genre filter
      let matchesGenre = genreFilter === 'all';
      if (!matchesGenre) {
        if (Array.isArray(m.genre)) {
          matchesGenre = m.genre.some((g) => g.toLowerCase() === genreFilter.toLowerCase());
        } else if (typeof m.genre === 'string') {
          matchesGenre = m.genre.toLowerCase().includes(genreFilter.toLowerCase());
        }
      }

      return matchesTitle && matchesStatus && matchesGenre;
    });
  }, [movies, searchQuery, statusFilter, genreFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / pageSize) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovies.slice(start, start + pageSize);
  }, [filteredMovies, currentPage, pageSize]);

  // Stats calculation
  const stats = useMemo(() => {
    const nowShowing = movies.filter((m) => m.status === 'now_showing').length;
    const comingSoon = movies.filter((m) => m.status === 'coming_soon').length;
    const archived = movies.filter((m) => m.status === 'archived' || m.status === 'ended').length;
    return { total: movies.length, nowShowing, comingSoon, archived };
  }, [movies]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FiFilm className="h-6 w-6 text-[#E50914]" />
            Movie Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain active movie rotations, classification ratings, genre tags, and media trailers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMovies}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#121522] px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
            title="Refresh list"
          >
            <FiRefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>

          <Link
            to="/admin/movies/add"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-5 py-2.5 text-xs font-black text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:brightness-110 transition active:scale-95"
          >
            <FiPlus className="h-4 w-4" /> Add Movie
          </Link>
        </div>
      </div>

      {/* Quick Summary Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/[0.08] bg-[#10131E]/90 p-3.5">
          <span className="text-[11px] font-bold text-slate-400 block">Total Films</span>
          <span className="text-xl font-black text-white">{stats.total}</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
          <span className="text-[11px] font-bold text-emerald-400 block">Now Showing</span>
          <span className="text-xl font-black text-white">{stats.nowShowing}</span>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
          <span className="text-[11px] font-bold text-amber-400 block">Coming Soon</span>
          <span className="text-xl font-black text-white">{stats.comingSoon}</span>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <span className="text-[11px] font-bold text-slate-400 block">Archived</span>
          <span className="text-xl font-black text-white">{stats.archived}</span>
        </div>
      </div>

      {/* Controls Bar: Search by title + Filter by Status & Genre */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#10131E]/95 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-card">
        {/* Search by title */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search movie by title or director..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#141824] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-white/[0.08] bg-[#141824] px-3 py-2 text-xs font-semibold text-white focus:border-[#E50914] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="now_showing">🟢 Now Showing</option>
              <option value="coming_soon">🟡 Coming Soon</option>
              <option value="archived">⚪ Archived</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold hidden sm:inline">Genre:</span>
            <select
              value={genreFilter}
              onChange={(e) => {
                setGenreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-white/[0.08] bg-[#141824] px-3 py-2 text-xs font-semibold text-white focus:border-[#E50914] focus:outline-none cursor-pointer"
            >
              <option value="all">All Genres</option>
              {allAvailableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== 'all' || genreFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setGenreFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs text-[#E50914] hover:underline font-bold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Movie Management Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#10131E]/95 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader rows={6} cols={7} />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FiFilm className="h-12 w-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Movies Match Criteria</h3>
            <p className="text-xs max-w-sm mx-auto">
              Try adjusting your search query, status filter, or genre tags to discover records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/[0.08] bg-[#0E111B] text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                <tr>
                  <th className="px-5 py-4">Poster Thumbnail</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Genre</th>
                  <th className="px-5 py-4">Release Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedMovies.map((movie) => {
                  const genreArray = Array.isArray(movie.genre)
                    ? movie.genre
                    : typeof movie.genre === 'string'
                    ? movie.genre.split(',').map((g) => g.trim())
                    : [];

                  return (
                    <tr
                      key={movie.movie_id}
                      className="hover:bg-white/[0.02] transition duration-150 group"
                    >
                      {/* 1. Poster Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="relative w-12 aspect-[2/3] rounded-lg overflow-hidden border border-white/[0.1] bg-gray-800 flex-shrink-0 shadow-md">
                          <img
                            src={movie.poster_url || '/images/shrek5.jpg'}
                            alt={movie.title}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100';
                            }}
                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </td>

                      {/* 2. Title */}
                      <td className="px-5 py-3.5">
                        <div className="max-w-xs space-y-1">
                          <span className="font-extrabold text-white text-xs block truncate group-hover:text-[#E50914] transition-colors">
                            {movie.title}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                            <FiClock className="h-3 w-3 text-[#E50914]" />
                            {movie.duration || movie.duration_minutes || 120} min • {movie.language || 'English'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Genre (Chips) */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {genreArray.length > 0 ? (
                            genreArray.map((g) => (
                              <span
                                key={g}
                                className="rounded-lg bg-red-500/10 border border-red-500/25 px-2 py-0.5 text-[10px] font-bold text-red-400"
                              >
                                {g}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[11px]">Uncategorized</span>
                          )}
                        </div>
                      </td>

                      {/* 4. Release Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium font-mono text-[11px]">
                          <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                          {movie.release_date || 'TBD'}
                        </div>
                      </td>

                      {/* 5. Status (Badge) */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {movie.status === 'now_showing' ? (
                          <Badge variant="brand" showDot>Now Showing</Badge>
                        ) : movie.status === 'coming_soon' ? (
                          <Badge variant="warning" showDot>Coming Soon</Badge>
                        ) : (
                          <Badge variant="default">Archived</Badge>
                        )}
                      </td>

                      {/* 6. Rating */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-amber-400 font-black text-xs">
                            <FiStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {movie.rating || '4.5'}
                          </span>
                          <span className="rounded-md border border-white/[0.1] bg-[#161B2B] px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                            {movie.age_rating || 'PG-13'}
                          </span>
                        </div>
                      </td>

                      {/* 7. Actions (Edit / Delete) */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {movie.trailer_url && (
                            <a
                              href={movie.trailer_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 hover:text-amber-400 hover:bg-white/[0.08] transition"
                              title="Watch Trailer"
                            >
                              <FiExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => navigate(`/admin/movies/edit/${movie.movie_id}`)}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
                            title="Edit Movie"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(movie)}
                            className="rounded-xl border border-red-500/20 bg-red-500/5 p-2 text-red-400 hover:bg-red-500/15 transition"
                            title="Delete Movie"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination */}
        {!loading && filteredMovies.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-white/[0.06] bg-[#0E111B]/40 text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-white">{Math.min(currentPage * pageSize, filteredMovies.length)}</strong> of{' '}
              <strong className="text-white">{filteredMovies.length}</strong> movies
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/[0.08] bg-[#141824] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.05] transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                    currentPage === page
                      ? 'bg-[#E50914] text-white'
                      : 'border border-white/[0.08] bg-[#141824] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-white/[0.08] bg-[#141824] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.05] transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMovie}
        title="Remove Film from Catalog"
        message={`Are you sure you want to remove "${deleteTarget?.title}"? All scheduled screening showtimes will also be removed.`}
        confirmText={isDeleting ? 'Deleting...' : 'Confirm Delete'}
        confirmVariant="danger"
      />
    </div>
  );
};

export default MovieManagement;
