import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [showData, setShowData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    API.get(`/shows/${showId}`)
      .then((res) => setShowData(res.data))
      .catch((err) => console.error(err));
  }, [showId]);

  const toggleSeat = (seat) => {
    if (showData.bookedSeatIds.includes(seat.seat_id)) return;
    
    if (selectedSeats.find(s => s.seat_id === seat.seat_id)) {
      setSelectedSeats(selectedSeats.filter(s => s.seat_id !== seat.seat_id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return alert('Select at least one seat');

    const totalAmount = selectedSeats.length * showData.show.ticket_price;
    try {
      const res = await API.post('/bookings/create', {
        userId: 1, // User authentication handle කළ පසු auth user ID එක ලබා දෙන්න
        showId: showData.show.show_id,
        seatIds: selectedSeats.map(s => s.seat_id),
        totalAmount,
        paymentMethod: 'card'
      });

      alert(`Booking Successful! Ref Code: ${res.data.bookingCode}`);
      navigate('/');
    } catch (err) {
      alert('Booking Failed!');
    }
  };

  if (!showData) return <div>Loading Seats...</div>;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>{showData.show.title} - Select Seats</h2>
      <p>Ticket Price: Rs. {showData.show.ticket_price}</p>

      {/* Screen Area */}
      <div style={{ background: '#444', color: '#fff', padding: '8px', margin: '20px auto', width: '60%' }}>
        SCREEN
      </div>

      {/* Seat Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', width: '300px', margin: '0 auto' }}>
        {showData.seats.map((seat) => {
          const isBooked = showData.bookedSeatIds.includes(seat.seat_id);
          const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);

          return (
            <button
              key={seat.seat_id}
              disabled={isBooked}
              onClick={() => toggleSeat(seat)}
              style={{
                padding: '10px',
                backgroundColor: isBooked ? '#ccc' : isSelected ? '#4CAF50' : '#fff',
                cursor: isBooked ? 'not-allowed' : 'pointer',
                border: '1px solid #333',
                borderRadius: '4px'
              }}
            >
              {seat.seat_number}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>Selected Seats: {selectedSeats.map(s => s.seat_number).join(', ')}</p>
        <p>Total: Rs. {selectedSeats.length * showData.show.ticket_price}</p>
        <button onClick={handleBooking} style={{ padding: '10px 20px', background: '#e50914', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Confirm & Pay
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;