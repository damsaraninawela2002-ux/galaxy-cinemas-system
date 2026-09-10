import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooking } from './context/BookingContext';
import { MapPin, Calendar, Clock, Film, ArrowRight, ArrowLeft } from 'lucide-react';
import API from './services/api';
import movieService from './services/movieService';

const Booking = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { updateBooking } = useBooking();

  const [movie, setMovie] = useState(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState('1');
  const [selectedDate, setSelectedDate] = useState('2026-08-22');
  const [loading, setLoading] = useState(true);

  const sampleCinemas = [
    { cinema_id: 1, name: "Nova IMAX Colombo", location: "Colombo 03" },
    { cinema_id: 2, name: "Nova Cinema Kandy", location: "Kandy" },
    { cinema_id: 3, name: "Nova Galaxy Galle", location: "Galle" }
  ];

  const dateOptions = [
    { label: "Today, 22 Aug", value: "2026-08-22" },
    { label: "Tomorrow, 23 Aug", value: "2026-08-23" },
    { label: "Monday, 24 Aug", value: "2026-08-24" }
  ];

  const mockShowtimes = [
    { showtime_id: 101, start_time: "10:00 AM", screen_name: "Screen 1 (IMAX)", ticket_price: 1500 },
    { showtime_id: 102, start_time: "01:30 PM", screen_name: "Screen 1 (IMAX)", ticket_price: 1500 },
    { showtime_id: 103, start_time: "05:00 PM", screen_name: "Screen 2 (VIP Atmos)", ticket_price: 2000 },
    { showtime_id: 104, start_time: "08:30 PM", screen_name: "Screen 2 (VIP Atmos)", ticket_price: 2000 }
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    movieService.getMovie(movieId)
      .then((data) => {
        if (isMounted) setMovie(data);
      })
      .catch((err) => {
        console.warn('Booking movie fetch failed:', err);
        if (isMounted) setMovie(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [movieId]);

  const handleSelectShowtime = (showtime) => {
    const selectedCinema = sampleCinemas.find(c => c.cinema_id === parseInt(selectedCinemaId));
    
    updateBooking({
      movie,
      cinema: selectedCinema,
      showtime,
      date: selectedDate
    });

    // Proceed to Seat Selection
    navigate(`/booking/seats/${showtime.showtime_id}`);
  };

  if (loading || !movie) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-black text-white">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading scheduling options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-vh-100 py-5" style={{ background: '#0a0a0c' }}>
      <div className="container px-4 px-md-5">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-link text-secondary text-decoration-none d-flex align-items-center gap-1 hover-text-white transition-all p-0 mb-4 small"
        >
          <ArrowLeft size={16} /> Back to Movie Details
        </button>

        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="fw-bold display-5 text-white mb-2">Book Tickets</h1>
          <p className="text-secondary fs-5">Configure your cinema layout and choose show times for {movie.title}.</p>
        </div>

        {/* Step progress tracker */}
        <div className="row justify-content-center mb-5 d-none d-md-flex">
          <div className="col-8 text-center">
            <div className="d-flex align-items-center justify-content-between position-relative">
              <div className="position-absolute bg-secondary bg-opacity-25 w-100" style={{ height: '2px', zIndex: 1, left: 0, top: '50%' }}></div>
              
              <div className="bg-danger text-white rounded-circle p-2 px-3 fw-bold position-relative" style={{ zIndex: 5 }}>1</div>
              <div className="bg-secondary text-white rounded-circle p-2 px-3 fw-bold position-relative" style={{ zIndex: 5 }}>2</div>
              <div className="bg-secondary text-white rounded-circle p-2 px-3 fw-bold position-relative" style={{ zIndex: 5 }}>3</div>
              <div className="bg-secondary text-white rounded-circle p-2 px-3 fw-bold position-relative" style={{ zIndex: 5 }}>4</div>
            </div>
            <div className="d-flex justify-content-between mt-2 small text-secondary">
              <span className="text-danger fw-bold">Select Showtime</span>
              <span>Select Seats</span>
              <span>Confirm summary</span>
              <span>Success ticket</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Filters card */}
          <div className="col-lg-4 text-start">
            <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-15 p-4 rounded-3 mb-4">
              <h5 className="text-white fw-bold mb-4">Booking Parameters</h5>

              {/* Cinema */}
              <div className="mb-4">
                <label className="form-label text-secondary small d-flex align-items-center gap-2 mb-2">
                  <MapPin size={16} className="text-danger" /> SELECT THEATER
                </label>
                <select 
                  className="form-select bg-black border-secondary border-opacity-25 text-white shadow-none py-2"
                  value={selectedCinemaId}
                  onChange={(e) => setSelectedCinemaId(e.target.value)}
                >
                  {sampleCinemas.map(c => (
                    <option key={c.cinema_id} value={c.cinema_id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="mb-0">
                <label className="form-label text-secondary small d-flex align-items-center gap-2 mb-2">
                  <Calendar size={16} className="text-danger" /> SELECT SHOW DATE
                </label>
                <div className="d-flex flex-column gap-2">
                  {dateOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDate(opt.value)}
                      className={`btn btn-sm text-start py-2 px-3 ${
                        selectedDate === opt.value 
                          ? 'btn-danger fw-bold' 
                          : 'btn-outline-secondary text-secondary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Showtimes slots */}
          <div className="col-lg-8 text-start">
            <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-15 p-4 rounded-3">
              <h5 className="fw-bold text-white mb-4 border-bottom border-secondary border-opacity-10 pb-3">Available Showtime Slots</h5>
              
              <div className="row row-cols-1 row-cols-sm-2 g-3">
                {mockShowtimes.map((showtime) => (
                  <div key={showtime.showtime_id} className="col">
                    <div 
                      onClick={() => handleSelectShowtime(showtime)}
                      className="card bg-black bg-opacity-40 border border-secondary border-opacity-10 p-4 rounded-3 cursor-pointer hover-scale transition-all d-flex flex-row justify-content-between align-items-center"
                    >
                      <div>
                        <span className="text-secondary small d-block mb-1">{showtime.screen_name}</span>
                        <h4 className="text-danger fw-bold mb-2 d-flex align-items-center gap-2">
                          <Clock size={20} /> {showtime.start_time}
                        </h4>
                        <span className="text-secondary small d-block">Price: Rs. {showtime.ticket_price}</span>
                      </div>
                      <div className="p-2 bg-danger bg-opacity-10 text-danger rounded-circle d-flex">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;
