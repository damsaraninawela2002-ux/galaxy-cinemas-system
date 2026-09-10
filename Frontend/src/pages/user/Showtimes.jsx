import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import bookingService from '../../services/bookingService';
import API from '../../services/api';
import movieService from '../../services/movieService';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Tv,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Film,
  Check
} from 'lucide-react';

// Safe helper to generate the next 7 consecutive days starting from today
const generateNext7Days = () => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${dayNum}`;

    const weekdayShort = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const dayStr = d.getDate();

    days.push({
      iso,
      weekday: weekdayShort,
      formatted: `${monthShort} ${dayStr}`,
      dayNumber: dayStr,
      month: monthShort,
      isToday: i === 0
    });
  }

  return days;
};

// Loading indicator component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#080B14] text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Showtimes...</span>
    </div>
  </div>
);

const Showtimes = () => {
  const params = useParams();
  const movieId = params?.movieId;
  const navigate = useNavigate();

  // Guard against missing or unmounted context
  const bookingCtx = useBooking();
  const booking = bookingCtx?.booking || {};
  const setSelectedMovie = bookingCtx?.setSelectedMovie || (() => {});
  const setShowtimeSelection = bookingCtx?.setShowtimeSelection || (() => {});

  // Guaranteed safe initial states
  const [dateList] = useState(generateNext7Days);
  const [selectedDate, setSelectedDate] = useState(dateList[0] || null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [movie, setMovie] = useState(booking?.movie || null);
  const [loading, setLoading] = useState(true);
  const [showtimesLoading, setShowtimesLoading] = useState(false);

  // 1. Fetch / Resolve movie details with safe fallbacks
  useEffect(() => {
    let isMounted = true;
    const targetId = movieId || booking?.movie?.movie_id || booking?.movie?.id || 1;

    const loadMovie = async () => {
      // If already in context and matching, use it immediately
      if (booking?.movie && (String(booking.movie.movie_id) === String(targetId) || String(booking.movie.id) === String(targetId))) {
        if (isMounted) {
          setMovie(booking.movie);
          setLoading(false);
        }
        return;
      }

      try {
        if (targetId) {
          const data = await movieService.getMovie(targetId);
          if (isMounted && data) {
            setMovie(data);
            setSelectedMovie(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Movie details load failed:', err?.message);
        if (isMounted) {
          setMovie(null);
          setSelectedMovie(null);
          setLoading(false);
        }
      }
    };

    loadMovie();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  // 2. Fetch showtimes for selected movie & date
  useEffect(() => {
    let isMounted = true;
    setShowtimesLoading(true);
    setSelectedShowtime(null);

    const activeId = movie?.movie_id || movie?.id || movieId || 1;
    const activeDateIso = selectedDate?.iso || new Date().toISOString().slice(0, 10);

    bookingService.getShowtimesForMovie(activeId, activeDateIso)
      .then(data => {
        if (isMounted) {
          setShowtimes(Array.isArray(data) ? data : []);
          setShowtimesLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setShowtimes([]);
          setShowtimesLoading(false);
          toast.error('Showtimes could not be loaded. Please try another date.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie, selectedDate, movieId]);

  // Early return guard: Do not render until movie object is ready
  if (loading || !movie) {
    return <LoadingSpinner />;
  }

  // Safe genre string formatting
  const genreFormatted = Array.isArray(movie?.genre)
    ? movie.genre.join(', ')
    : typeof movie?.genre === 'string' && movie.genre.trim()
    ? movie.genre
    : Array.isArray(movie?.genres)
    ? movie.genres.join(', ')
    : 'Action, Sci-Fi';

  // Safe duration
  const movieDuration = movie?.duration || movie?.duration_minutes || 120;

  // Handle continuing to seat selection
  const handleContinue = () => {
    if (!movie || !movieId || !selectedDate || !selectedShowtime?.showtime_id) {
      toast.error('Please select a valid movie and showtime first.');
      return;
    }

    setShowtimeSelection({
      date: selectedDate.iso,
      time: selectedShowtime.start_time,
      showtimeId: selectedShowtime.showtime_id,
      showtime: selectedShowtime,
      cinema: {
        name: selectedShowtime.cinema_name,
        location: selectedShowtime.location || 'Cinema City'
      }
    });

    navigate('/seat-selection');
  };

  const safeShowtimes = Array.isArray(showtimes) ? showtimes : [];
  const safeDateList = Array.isArray(dateList) ? dateList : [];

  return (
    <div className="bg-[#080B14] text-slate-100 min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to={movie?.movie_id ? `/movies/${movie.movie_id}` : '/movies'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-xl hover:bg-white/[0.08]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Movie Details
          </Link>
        </div>

        {/* Header Movie Card Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-r from-[#0F1426] via-[#12182F] to-[#0B0F1C] p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={movie.poster_url || '/images/1.jfif'}
              alt={movie.title || 'Movie'}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400';
              }}
              className="w-24 sm:w-28 aspect-[2/3] rounded-2xl object-cover object-center shadow-lg border border-white/10 flex-shrink-0 bg-gray-800"
            />

            <div className="flex-1 text-center sm:text-left space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30">
                <Film className="w-3 h-3" /> Step 1: Select Showtime
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {movie.title || 'Movie Title'}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {movieDuration} mins
                </span>
                <span>•</span>
                <span>{genreFormatted}</span>
                <span>•</span>
                <span>{movie.language || 'English'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Date Selection Pills (Next 7 Days) */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E50914]" />
              Select Date (Next 7 Days)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Selected: <strong className="text-white">{selectedDate?.weekday || 'Today'}, {selectedDate?.formatted || ''}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
            {safeDateList.map((d) => {
              const isSelected = selectedDate?.iso === d.iso;

              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[90px] sm:min-w-[105px] py-3.5 px-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#E50914] to-[#B91C1C] border-[#E50914] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] scale-105'
                      : 'bg-[#101426] border-white/[0.08] text-slate-300 hover:border-white/25 hover:bg-[#151B33]'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                    {d.weekday}
                  </span>
                  <span className="text-xl sm:text-2xl font-black mt-0.5">
                    {d.dayNumber}
                  </span>
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {d.month}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Showtimes List */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E50914]" />
              Available Screening Times for {selectedDate?.formatted || 'Selected Date'}
            </h2>
            <span className="text-xs text-slate-400">
              {safeShowtimes.length} showtime{safeShowtimes.length === 1 ? '' : 's'} found
            </span>
          </div>

          {showtimesLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Loading showtimes for {selectedDate?.formatted || ''}...
              </span>
            </div>
          ) : safeShowtimes.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#101426] text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Showtimes Scheduled</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active screening sessions scheduled on {selectedDate?.formatted || 'this date'}. Please select another date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safeShowtimes.map((st) => {
                const isFullyBooked = st?.available_seats !== undefined && Number(st.available_seats) <= 0;
                const isSelected = selectedShowtime?.showtime_id === st?.showtime_id;

                return (
                  <button
                    key={st?.showtime_id || Math.random()}
                    type="button"
                    disabled={isFullyBooked}
                    onClick={() => !isFullyBooked && setSelectedShowtime(st)}
                    className={`relative p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-4 ${
                      isFullyBooked
                        ? 'bg-white/[0.02] border-white/[0.04] opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gradient-to-br from-indigo-950/70 to-[#101426] border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/50 cursor-pointer'
                        : 'bg-[#101426] border-white/[0.08] hover:border-white/25 hover:bg-[#151B33] cursor-pointer'
                    }`}
                  >
                    {/* Top Row: Time & Availability Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                          {st?.start_time || '10:00 AM'}
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                          {st?.cinema_name || 'Nova Cinema'}
                        </span>
                      </div>

                      {/* Sold out vs Available Badge */}
                      {isFullyBooked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Fully Booked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {st?.available_seats !== undefined ? `${st.available_seats} Seats Left` : 'Seats Available'}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Hall / Screen type & Ticket Price */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <Tv className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{st?.screen_name || st?.screen_type || 'Standard Hall'}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Price from</span>
                        <span className="text-sm font-black text-amber-400">
                          Rs. {Number(st?.ticket_price || 1500).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Sticky Continue Bar */}
        <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-[#101426]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-30">
          <div className="text-center sm:text-left">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Selected Showtime
            </span>
            <span className="text-sm sm:text-base font-black text-white">
              {selectedShowtime ? (
                <>
                  {selectedDate?.weekday}, {selectedDate?.formatted} • {selectedShowtime?.start_time} ({selectedShowtime?.cinema_name})
                </>
              ) : (
                <span className="text-slate-400 font-normal italic">Please pick an available time slot above</span>
              )}
            </span>
          </div>

          <button
            type="button"
            disabled={!selectedShowtime}
            onClick={handleContinue}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedShowtime
                ? 'bg-gradient-to-r from-[#E50914] to-[#B91C1C] text-white shadow-[0_0_25px_rgba(229,9,20,0.5)] hover:brightness-110 active:scale-95'
                : 'bg-white/[0.06] text-slate-500 border border-white/[0.08] cursor-not-allowed'
            }`}
          >
            Continue to Seat Selection <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Showtimes;
