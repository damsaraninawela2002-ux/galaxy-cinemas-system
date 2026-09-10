import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, genres }) => {
  return (
    <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-15 p-4 rounded-3 mb-5">
      <div className="row g-3 align-items-center">
        {/* Search Input */}
        <div className="col-md-7">
          <div className="input-group">
            <span className="input-group-text bg-black bg-opacity-50 border-secondary border-opacity-25 text-secondary">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control bg-black bg-opacity-50 border-secondary border-opacity-25 text-white shadow-none"
              placeholder="Search movies by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="col-md-5">
          <select
            className="form-select bg-black bg-opacity-50 border-secondary border-opacity-25 text-white shadow-none"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
