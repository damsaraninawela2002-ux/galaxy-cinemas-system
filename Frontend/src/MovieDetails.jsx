import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API, { apiService } from './services/api';
import { useBooking } from './context/BookingContext';
import {
  Calendar,
  Clock,
  Star,
  Play,
  Film,
  User,
  Tag,
  Globe,
  Shield,
  ArrowLeft,
  Ticket,
  ChevronRight,
  Share2
} from 'lucide-react';
import TrailerModal from './components/TrailerModal';
import movieService from './services/movieService';
import toast from 'react-hot-toast';

// Helper to extract YouTube video ID from URL
const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedMovie, updateBooking } = useBooking();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  // Fallback showtimes for booking interaction
  const fallbackShowtimes = [
    { show_id: 101, cinema_name: "Nova IMAX Colombo", start_time: "10:00 AM", ticket_price: 1500, screen: "Hall 1 (IMAX Laser)" },
    { show_id: 102, cinema_name: "Nova IMAX Colombo", start_time: "02:30 PM", ticket_price: 1500, screen: "Hall 1 (IMAX Laser)" },
    { show_id: 103, cinema_name: "Nova Atmos Cinema Kandy", start_time: "06:00 PM", ticket_price: 1200, screen: "Hall 2 (Dolby Atmos)" },
    { show_id: 104, cinema_name: "Nova Galaxy Galle", start_time: "08:30 PM", ticket_price: 1000, screen: "Hall 3 (Prime 2D)" }
  ];

  useEffect(() => {
    setLoading(true);

    const fetchMovieData = async () => {
      try {
        const data = await movieService.getMovie(id);
        setMovie(data);
      } catch (err) {
        console.warn('Movie fetch failed or not found:', err?.message);
        setMovie(null);
      }
    };

    const fetchShowsData = async () => {
      try {
        const res = await API.get('/showtimes.php', { params: { movie_id: id } }).catch(() => null);
        if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setShows(res.data.data);
        } else {
          setShows(fallbackShowtimes);
        }
      } catch {
        setShows(fallbackShowtimes);
      }
    };

    Promise.all([fetchMovieData(), fetchShowsData()]).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080B14] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Movie Details...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#080B14] text-white flex flex-col items-center justify-center p-6 text-center">
        <Film className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-black text-white">Movie Not Found</h2>
        <p className="text-slate-400 text-xs mt-2 max-w-sm">The movie you requested could not be found in our current catalog.</p>
        <Link
          to="/movies"
          className="mt-6 px-6 py-2.5 rounded-xl bg-[#E50914] text-white font-bold text-xs hover:bg-[#F40612] transition"
        >
          Browse All Movies
        </Link>
      </div>
    );
  }

  // Genre list resolution
  const genreList = Array.isArray(movie.genre)
    ? movie.genre
    : typeof movie.genre === 'string' && movie.genre.trim()
    ? movie.genre.split(',').map((g) => g.trim())
    : ['Action'];

  // Cast list resolution (array of strings or object array)
  const castList = Array.isArray(movie.cast)
    ? movie.cast.map((c) => (typeof c === 'string' ? { name: c, role: 'Cast Member' } : c))
    : typeof movie.cast === 'string' && movie.cast.trim()
    ? movie.cast.split(',').map((c) => ({ name: c.trim(), role: 'Cast Member' }))
    : [];

  const ageRating = movie.age_rating || (['G', 'PG', 'PG-13', 'R', 'NC-17'].includes(movie.rating) ? movie.rating : 'PG-13');
  const userRating = movie.rating && !['G', 'PG', 'PG-13', 'R', 'NC-17'].includes(movie.rating) ? movie.rating : '4.7';
  const duration = movie.duration || movie.duration_minutes || 120;
  const youtubeVideoId = getYouTubeId(movie.trailer_url) || movie.trailer_id || 'dQw4w9WgXcQ';
  const isUpcoming = movie.status === 'coming_soon' || movie.status === 'upcoming';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out ${movie.title} at Galaxy Cinemas!`,
        url: window.location.href,
      }).catch(() => null);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Movie link copied to clipboard!');
    }
  };

  const handleBookNow = () => {
    setSelectedMovie({
      ...movie,
      genre: genreList,
      rating: userRating,
      duration
    });
    navigate(`/showtimes/${id}`);
  };

  return (
    <div className="bg-[#080B14] text-slate-100 min-h-screen pb-24">
      {/* ======================================================== */}
      {/* 1. FULL BACKDROP HERO BANNER */}
      {/* ======================================================== */}
      <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] overflow-hidden bg-black">
        {/* Backdrop Image */}
        <img
          src={movie.backdrop_url || movie.poster_url || '/images/shrek5.jpg'}
          alt={movie.title}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600';
          }}
          className="w-full h-full object-cover object-center filter brightness-[0.75]"
        />

        {/* Cinematic Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-[#080B14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080B14] via-[#080B14]/40 to-transparent" />

        {/* Back Link & Breadcrumbs Overlay */}
        <div className="absolute top-6 left-4 sm:left-8 lg:left-12 z-20">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 text-xs font-bold text-white transition hover:border-white/25"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Movies
          </Link>
        </div>

        {/* Share Button Top Right */}
        <div className="absolute top-6 right-4 sm:right-8 lg:right-12 z-20">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 p-2.5 sm:px-4 sm:py-2 text-xs font-bold text-white transition hover:border-white/25"
            title="Share movie"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOVIE DETAILS CONTAINER */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Poster with Hover Play / Click to Open Modal */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div
              onClick={() => setIsTrailerModalOpen(true)}
              className="group relative w-64 sm:w-72 lg:w-full max-w-[320px] aspect-[2/3] rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer bg-gray-800"
              title="Click to watch trailer"
            >
              <img
                src={movie.poster_url || '/images/shrek5.jpg'}
                alt={movie.title}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600';
                }}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover Overlay with Big Play Button */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.8)] group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-wider backdrop-blur-sm bg-black/60 px-3 py-1 rounded-full border border-white/10">
                  Watch Trailer
                </span>
              </div>

              {/* Top-Right Age Rating Pill on Poster */}
              <div className="absolute top-3.5 right-3.5 z-10">
                <span className="rounded-full bg-black/85 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-black font-mono text-white shadow-lg tracking-wider uppercase">
                  {ageRating}
                </span>
              </div>
            </div>

            {/* CTA Buttons Below Poster on Mobile / Side */}
            <div className="w-full max-w-[320px] mt-5 space-y-3">
              {isUpcoming ? (
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                    Coming Soon to Theaters
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Expected Release: <strong className="text-white">{movie.release_date}</strong>
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] hover:brightness-110 text-white font-black text-sm shadow-[0_0_25px_rgba(229,9,20,0.4)] transition-all active:scale-95 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" /> Book Now
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsTrailerModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#161B2B] hover:bg-white/[0.08] border border-white/[0.08] text-white font-bold text-xs transition"
              >
                <Play className="w-4 h-4 fill-white" /> Open Trailer in Modal
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Genre Chips, Synopsis, Cast, Director */}
          <div className="lg:col-span-8 space-y-6 text-left">
            
            {/* Title & Status Row */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Age Rating Pill */}
                <span className="rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-black font-mono text-red-400 tracking-wider">
                  {ageRating}
                </span>

                {/* Status Badge */}
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                    isUpcoming
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isUpcoming ? 'Coming Soon' : 'Now Showing'}
                </span>

                {/* Star Rating */}
                <span className="flex items-center gap-1 text-xs font-black text-amber-400 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {userRating} / 5.0
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {movie.title}
              </h1>

              {/* Genre Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {genreList.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] px-3.5 py-1 text-xs font-bold text-slate-200 transition"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Specs Pill Row (Release Date, Duration, Language) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-white/[0.08] bg-[#101426]/90 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E50914] flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                  <span className="text-xs font-bold text-white">{duration} mins</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#E50914] flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Release Date</span>
                  <span className="text-xs font-bold text-white">{movie.release_date || 'TBD'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Globe className="w-4 h-4 text-[#E50914] flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Language</span>
                  <span className="text-xs font-bold text-white">{movie.language || 'English'}</span>
                </div>
              </div>
            </div>

            {/* Director Credit Line */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#101426]/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 text-[#E50914] flex items-center justify-center flex-shrink-0 border border-[#E50914]/20">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                  Director Credit
                </span>
                <span className="text-sm font-black text-white">
                  Directed by {movie.director || 'Christopher Nolan'}
                </span>
              </div>
            </div>

            {/* Full Synopsis / Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider">
                Full Synopsis
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed p-5 rounded-2xl border border-white/[0.08] bg-[#101426]/60 font-normal">
                {movie.description || movie.synopsis}
              </p>
            </div>

            {/* Cast Section: Horizontal Scroll of Name Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E50914]" />
                  Starring Cast
                </h3>
                <span className="text-[11px] text-slate-400">{castList.length} members</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {castList.map((actor, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-44 rounded-2xl border border-white/[0.08] bg-[#101426] p-3.5 flex items-center gap-3 hover:border-white/20 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914]/30 to-[#B91C1C]/10 text-white font-bold flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform">
                      {actor.name ? actor.name.charAt(0) : 'A'}
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold text-xs text-white block truncate group-hover:text-[#E50914] transition-colors">
                        {actor.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {actor.role || 'Actor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Trailer Section */}
            {youtubeVideoId && (
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
                    Official Trailer
                  </h3>
                  <button
                    onClick={() => setIsTrailerModalOpen(true)}
                    className="text-xs text-[#E50914] hover:underline font-bold"
                  >
                    Watch in Fullscreen Modal &rarr;
                  </button>
                </div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}

            {/* Available Showtimes Section */}
            {!isUpcoming && (
              <div id="showtimes-section" className="space-y-4 pt-6 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#E50914]" />
                    Available Screening Showtimes
                  </h3>
                  <span className="text-xs text-slate-400">Select showtime to book seats</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {shows.map((show) => (
                    <div
                      key={show.show_id}
                      className="rounded-2xl border border-white/[0.08] bg-[#101426] p-4 flex flex-col justify-between gap-3 hover:border-red-500/30 transition shadow-card"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-[#E50914] uppercase tracking-wider block font-black">
                          {show.screen || 'Standard Screening'}
                        </span>
                        <h4 className="font-extrabold text-sm text-white mt-0.5">{show.cinema_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{show.start_time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                        <span className="text-xs font-bold text-amber-400">
                          Rs. {show.ticket_price}
                        </span>
                        <Link
                          to={`/booking/${show.show_id}`}
                          className="px-4 py-1.5 rounded-xl bg-[#E50914] hover:bg-[#F40612] text-white font-bold text-xs transition shadow-sm"
                        >
                          Book Seats
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Trailer Popup Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        movie={{
          ...movie,
          trailer_id: youtubeVideoId,
          genre: genreList
        }}
      />
    </div>
  );
};

export default MovieDetails;