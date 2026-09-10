import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Bell, Play, Film } from 'lucide-react';
import toast from 'react-hot-toast';

const MovieCard = ({ movie, onPlayTrailer }) => {
  const [notified, setNotified] = useState(false);

  // Status & flags
  const isUpcoming = movie.status === 'coming_soon' || movie.status === 'upcoming';
  
  // Safe genre list handling (array or comma string)
  const genreList = Array.isArray(movie.genre)
    ? movie.genre
    : typeof movie.genre === 'string' && movie.genre.trim()
    ? movie.genre.split(',').map((g) => g.trim())
    : ['Action'];

  // Resolve age rating & user rating
  const ageRating = movie.age_rating || (['G', 'PG', 'PG-13', 'R', 'NC-17'].includes(movie.rating) ? movie.rating : 'PG-13');
  const userRating = movie.rating && !['G', 'PG', 'PG-13', 'R', 'NC-17'].includes(movie.rating)
    ? movie.rating
    : '4.5';
  const durationMins = movie.duration || movie.duration_minutes || 120;

  const handleNotifyMe = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNotified(true);
    toast.success(`We'll notify you when tickets for "${movie.title}" drop!`);
  };

  return (
    <div className="group relative rounded-2xl bg-[#101426] border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:border-red-500/40 hover:shadow-[0_12px_32px_rgba(229,9,20,0.25)] transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Poster Image Container with 2:3 Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-800">
        <img
          src={movie.poster_url || '/images/shrek5.jpg'}
          alt={movie.title}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600';
          }}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101426] via-transparent to-black/50 opacity-85 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges: Rating stars on top-left, Age Rating badge (small pill) on top-right */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {/* Rating Stars Badge (Top-Left) */}
          <span className="flex items-center gap-1 rounded-lg bg-black/75 backdrop-blur-md border border-amber-500/30 px-2 py-1 text-[11px] font-black text-amber-400 shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{userRating}</span>
          </span>

          {/* Age Rating Badge: Small pill in top-right corner of poster */}
          <span className="rounded-full bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-black font-mono text-white shadow-md tracking-wider uppercase">
            {ageRating}
          </span>
        </div>

        {/* Quick Trailer Play Button on Hover */}
        {onPlayTrailer && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlayTrailer(movie);
            }}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#E50914]/90 hover:bg-[#E50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_25px_rgba(229,9,20,0.7)] hover:scale-110 z-20"
            title="Watch Trailer"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        )}

        {/* Status Pill in Lower Poster area */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none z-10">
          <span
            className={`rounded-md px-2 py-0.5 text-[9px] font-black tracking-wider uppercase backdrop-blur-md shadow-sm ${
              isUpcoming
                ? 'bg-amber-500/90 text-black'
                : 'bg-red-600/90 text-white'
            }`}
          >
            {isUpcoming ? 'COMING SOON' : 'NOW SHOWING'}
          </span>
        </div>
      </div>

      {/* Movie Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre Chips (first 2-3 genres) + Duration */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {genreList.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] font-bold text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md"
              >
                {g}
              </span>
            ))}
            {durationMins && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto font-medium">
                <Clock className="w-3 h-3 text-slate-500" />
                {durationMins}m
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="font-black text-sm sm:text-base text-white group-hover:text-[#E50914] transition-colors line-clamp-1"
            title={movie.title}
          >
            {movie.title}
          </h3>

          {/* Synopsis / Description preview */}
          {(movie.description || movie.synopsis) && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {movie.description || movie.synopsis}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          {isUpcoming ? (
            <button
              onClick={handleNotifyMe}
              disabled={notified}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                notified
                  ? 'bg-white/[0.05] text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 hover:text-amber-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{notified ? 'Notified!' : 'Notify Me'}</span>
            </button>
          ) : (
            <Link
              to={`/movies/${movie.movie_id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] hover:brightness-110 text-white font-bold text-xs shadow-[0_0_15px_rgba(229,9,20,0.35)] transition-all active:scale-[0.98]"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </Link>
          )}

          <Link
            to={`/movies/${movie.movie_id}`}
            className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition"
            title="View Movie Details"
          >
            Info
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
