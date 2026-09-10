import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Ticket,
  Play,
  Star,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Armchair,
  RefreshCw,
  Tag,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import MovieCard from './components/MovieCard';
import TrailerModal from './components/TrailerModal';
import movieService from './services/movieService';
import { MOCK_OFFERS } from './data/mockData';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await movieService.getMovies();
        if (isMounted) {
          setMovieList(data || []);
        }
      } catch (err) {
        console.error('Failed to load movies for Home:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMovies();
    return () => {
      isMounted = false;
    };
  }, []);

  const nowShowingMovies = movieList.filter((m) => m.status === 'now_showing');
  const upcomingMovies = movieList.filter((m) => m.status === 'coming_soon' || m.status === 'upcoming');
  const heroMovies = nowShowingMovies.length > 0 ? nowShowingMovies : (movieList.length > 0 ? movieList : []);

  // Auto-advance hero carousel every 6 seconds
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const handleCopyPromo = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const activeHero = heroMovies[currentSlide] || heroMovies[0] || null;

  if (loading && movieList.length === 0) {
    return (
      <div className="bg-[#080B14] text-slate-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Galaxy Cinemas...</span>
        </div>
      </div>
    );
  }

  if (!activeHero) {
    return (
      <div className="bg-[#080B14] text-slate-100 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Movies Currently Available</h2>
          <p className="text-xs text-slate-400">Please check back soon for our latest cinema screenings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#080B14] text-slate-100 min-h-screen">
      {/* 1. HERO SECTION: Cinematic Auto-Playing Banner Slider */}
      <section className="relative w-full h-[85vh] min-h-[580px] max-h-[820px] overflow-hidden">
        {/* Background Backdrop Image with Crossfade */}
        {heroMovies.map((movie, index) => (
          <div
            key={movie.movie_id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={movie.backdrop_url || movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
            />
            {/* Multi-layered Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-[#080B14]/60 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B14] via-[#080B14]/70 to-transparent" />
          </div>
        ))}

        {/* Hero Content Overlay */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20">
          <div className="max-w-2xl space-y-4 animate-fadeIn">
            {/* Tagline & Formats Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-xs tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> FEATURED PREMIERE
              </span>
              {activeHero.formats?.slice(0, 2).map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-0.5 rounded-lg bg-white/[0.1] border border-white/[0.15] text-[11px] font-bold text-slate-300 backdrop-blur-md"
                >
                  {fmt}
                </span>
              ))}
              <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-black/60 px-2.5 py-0.5 rounded-lg border border-white/[0.1]">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {activeHero.rating} ({activeHero.votes || '10K+'} ratings)
              </span>
            </div>

            {/* Giant Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {activeHero.title}
            </h1>

            {/* Genre & Runtime */}
            <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold">
              <span>{Array.isArray(activeHero.genre) ? activeHero.genre.join(', ') : activeHero.genre}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {activeHero.duration} mins
              </span>
              <span>•</span>
              <span>{activeHero.language || 'English'}</span>
            </div>

            {/* Synopsis Snippet */}
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
              {activeHero.description || activeHero.synopsis}
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                to={`/movies/${activeHero.movie_id}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98]"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Tickets</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveTrailerMovie(activeHero)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] border border-white/[0.15] text-white font-bold text-sm backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div className="absolute z-20 bottom-6 right-4 sm:right-8 flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/[0.15] text-white flex items-center justify-center backdrop-blur-md transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {heroMovies.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentSlide ? 'w-6 bg-indigo-500' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroMovies.length)}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/[0.15] text-white flex items-center justify-center backdrop-blur-md transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 2. PROMOTIONS & DISCOUNT STRIP */}
      <section className="bg-gradient-to-r from-indigo-950 via-[#11162C] to-indigo-950 border-y border-white/[0.08] py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-2">
                Special Cinema Promotions
                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">LIMITED TIME</span>
              </p>
              <p className="text-[11px] text-slate-400">Apply coupon code during checkout for instant savings</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {MOCK_OFFERS.slice(0, 2).map((off) => (
              <button
                key={off.code}
                onClick={() => handleCopyPromo(off.code)}
                className="flex items-center gap-2 bg-[#0C101F] hover:bg-[#151C33] border border-white/[0.1] px-3.5 py-1.5 rounded-xl text-xs transition group"
              >
                <span className="font-mono font-bold text-amber-400">{off.code}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-semibold">{off.discount}</span>
                {copiedCode === off.code ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NOW SHOWING SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366F1]" />
              <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest">
                IN THEATRES NOW
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Now Showing
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Explore the latest Hollywood blockbusters, IMAX spectacles, and critically acclaimed releases
            </p>
          </div>

          <Link
            to="/movies?filter=now_showing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition group self-start sm:self-auto"
          >
            <span>View All Movies</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid of Movie Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nowShowingMovies.map((movie) => (
            <MovieCard
              key={movie.movie_id}
              movie={movie}
              onPlayTrailer={(m) => setActiveTrailerMovie(m)}
            />
          ))}
        </div>
      </section>

      {/* 4. COMING SOON SECTION */}
      <section className="bg-[#0A0D1A] border-t border-white/[0.06] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest">
                  NEXT BLOCKBUSTERS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Coming Soon
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Set reminders and be the first to secure premier seats when advanced bookings open
              </p>
            </div>

            <Link
              to="/movies?filter=upcoming"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition group self-start sm:self-auto"
            >
              <span>Explore Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {upcomingMovies.map((movie) => (
              <MovieCard
                key={movie.movie_id}
                movie={movie}
                onPlayTrailer={(m) => setActiveTrailerMovie(m)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE GALAXY CINEMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest">
            THE GALAXY ADVANTAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Engineered for Cinema Connoisseurs
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Every auditorium is calibrated to reference laboratory standards for acoustic precision, optical brilliance, and absolute patron comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#101426] p-6 text-center hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-white">Instant Seat Booking</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time interactive seat reservation with zero booking delay and instant QR digital tickets.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#101426] p-6 text-center hover:border-amber-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-white">IMAX & Dolby Atmos</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Custom-built 4K Laser projection engines paired with 64-channel spatial sound stages.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#101426] p-6 text-center hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Armchair className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-white">VIP Luxury Lounges</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Heated motorized leather recliners, personal side-tables, and gourmet in-seat waiter service.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#101426] p-6 text-center hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-white">Frictionless Refunds</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Plans change? Cancel your tickets up to 2 hours before showtime for an instant 100% refund.
            </p>
          </div>
        </div>
      </section>

      {/* Trailer Modal Player */}
      <TrailerModal
        isOpen={!!activeTrailerMovie}
        onClose={() => setActiveTrailerMovie(null)}
        movie={activeTrailerMovie}
      />
    </div>
  );
};

export default Home;