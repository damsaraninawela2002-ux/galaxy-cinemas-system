import React from 'react';
import { Link } from 'react-router-dom';

const MovieSlider = ({ featuredMovies }) => {
  return (
    <div id="heroMovieCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
      {/* Carousel Indicators */}
      <div className="carousel-indicators">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#heroMovieCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-current={index === 0 ? "true" : "false"}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Carousel Items */}
      <div className="carousel-inner">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.movie_id}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
            style={{ height: '550px' }}
          >
            {/* Background Image with Dark Linear Gradient Overlay */}
            <div
              className="w-100 h-100 position-absolute top-0 start-0"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.8) 100%), url(${movie.backdrop_url || movie.poster_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.85)'
              }}
            ></div>

            {/* Content Container */}
            <div className="container h-100 position-relative d-flex align-items-center" style={{ zIndex: 5 }}>
              <div className="row w-100 align-items-center">
                <div className="col-lg-7 text-start">
                  <span className="badge bg-danger mb-3 px-3 py-2 fw-semibold text-uppercase tracking-wider">
                    FEATURED BLOCKBUSTER
                  </span>
                  <h1 className="display-4 fw-bold text-white mb-2 leading-tight">
                    {movie.title}
                  </h1>
                  <p className="text-warning fw-semibold mb-3 fs-5">
                    {(Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre)} • ⏱ {movie.duration} mins • Rating: ★ {movie.rating}
                  </p>
                  <p className="text-secondary mb-4 col-md-10" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                    {movie.description || movie.synopsis || "Immerse yourself in the ultimate cinematic journey. Reserve your premium seats today and experience this masterpiece with Dolby Atmos audio."}
                  </p>
                  <div className="d-flex gap-3">
                    <Link to={`/booking/${movie.movie_id}`} className="btn btn-danger btn-lg px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                      Book Tickets Now
                    </Link>
                    <button 
                      className="btn btn-outline-light btn-lg px-4 fw-medium"
                      onClick={() => alert(`Play Trailer of ${movie.title}`)}
                    >
                      Watch Trailer
                    </button>
                  </div>
                </div>
                
                {/* Side Poster Preview on Large Screens */}
                <div className="col-lg-4 offset-lg-1 d-none d-lg-block">
                  <div className="card border border-secondary border-opacity-25 rounded-3 shadow-lg hover-scale overflow-hidden" style={{ width: '260px' }}>
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      className="w-100 object-fit-cover" 
                      style={{ height: '380px' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Navigation Buttons */}
      <button className="carousel-control-prev" type="button" data-bs-target="#heroMovieCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroMovieCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default MovieSlider;
