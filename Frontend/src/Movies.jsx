import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import TrailerModal from './components/TrailerModal';
import movieService from './services/movieService';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await movieService.getMovies();
        if (isMounted) {
          setMovies(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMovies();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic unique genres gathered from current movie list
  const genresList = useMemo(() => {
    const genreSet = new Set();
    movies?.forEach((m) => {
      if (Array.isArray(m.genre)) {
        m.genre.forEach((g) => genreSet.add(g));
      } else if (typeof m.genre === 'string' && m.genre.trim()) {
        m.genre.split(',').forEach((g) => genreSet.add(g.trim()));
      }
    });
    return Array.from(genreSet).sort();
  }, [movies]);

  // Filter movies based on search, status, and genre
  const filteredMovies = useMemo(() => {
    return (movies || []).filter((movie) => {
      const genreArray = Array.isArray(movie.genre)
        ? movie.genre
        : typeof movie.genre === 'string'
        ? movie.genre.split(',').map((g) => g.trim())
        : [];

      const genreStr = genreArray.join(' ');
      const matchesSearch =
        !searchQuery.trim() ||
        (movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        genreStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.director && movie.director.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre =
        selectedGenre === 'all' ||
        genreArray.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'coming_soon' && (movie.status === 'coming_soon' || movie.status === 'upcoming')) ||
        (selectedStatus === 'now_showing' && movie.status === 'now_showing');

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [movies, searchQuery, selectedGenre, selectedStatus]);

  return (
    <div className="bg-[#080B14] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Explore Movies
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Discover blockbusters now showing and anticipated releases coming soon to Galaxy Cinemas.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-2xl border border-white/[0.08] bg-[#101426] p-1.5 shadow-md">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedStatus === 'all'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Movies ({movies.length})
            </button>
            <button
              onClick={() => setSelectedStatus('now_showing')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedStatus === 'now_showing'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => setSelectedStatus('coming_soon')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedStatus === 'coming_soon'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Search Bar Component */}
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          genres={genresList}
        />

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-white/[0.06] bg-[#101426]/40 p-8 space-y-3">
            <h4 className="text-base font-bold text-slate-300">No movies found matching your criteria.</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, status tab, or selected genre filter to discover films.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setSelectedStatus('all');
              }}
              className="mt-2 text-xs text-[#E50914] font-bold hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies?.map((movie) => (
              <div key={movie.movie_id} className="h-full">
                <MovieCard
                  movie={movie}
                  onPlayTrailer={(m) => setActiveTrailerMovie(m)}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Trailer Modal */}
      {activeTrailerMovie && (
        <TrailerModal
          isOpen={!!activeTrailerMovie}
          onClose={() => setActiveTrailerMovie(null)}
          movie={activeTrailerMovie}
        />
      )}
    </div>
  );
};

export default Movies;
