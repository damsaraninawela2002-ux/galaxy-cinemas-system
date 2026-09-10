import API from './api';
import bookingService from './bookingService';

/**
 * Service for payment processing and atomic booking settlement.
 */
export const paymentService = {
  /**
   * Validates credit/debit card fields.
   */
  validateCardDetails({ cardNumber, expiryDate, cvv, cardholderName }) {
    const errors = {};

    // 16-digit card validation (ignoring whitespace and dashes)
    const cleanedNumber = (cardNumber || '').replace(/[\s-]/g, '');
    if (!/^\d{16}$/.test(cleanedNumber)) {
      errors.cardNumber = 'Card number must be exactly 16 digits.';
    }

    // MM/YY format validation and expiration check
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate || '')) {
      errors.expiryDate = 'Expiry date must be in MM/YY format.';
    } else {
      const match = expiryDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
      const expMonth = parseInt(match[1], 10);
      const expYear = parseInt('20' + match[2], 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        errors.expiryDate = 'Card has already expired.';
      }
    }

    // 3-digit CVV validation
    if (!/^\d{3}$/.test(cvv || '')) {
      errors.cvv = 'CVV must be exactly 3 digits.';
    }

    if (!cardholderName || cardholderName.trim().length < 2) {
      errors.cardholderName = 'Cardholder name is required.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * CRITICAL: Payment and Booking Finalization Order:
   * 1. Validate payment details & execute payment endpoint/gateway.
   * 2. If payment succeeds, create booking with atomic seat reservation & payment record.
   * 3. Generate GC-YYYYMMDD-### booking ID.
   * 4. Return full booking confirmation.
   * If payment fails at step 1, steps 2-6 NEVER execute (no seat lock).
   */
  async processPayment({ amount, paymentMethod, cardDetails, bookingData }) {
    // 1. Validate card details if card method chosen
    if (paymentMethod === 'card') {
      const validation = this.validateCardDetails(cardDetails || {});
      if (!validation.isValid) {
        const firstErrMsg = Object.values(validation.errors)[0];
        throw new Error(firstErrMsg || 'Invalid payment details');
      }
    }

    // Simulate realistic payment network latency
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Simulated card test failure trigger for testing failure safety (e.g. card number ending in '0000')
    const cleanedNumber = (cardDetails?.cardNumber || '').replace(/[\s-]/g, '');
    if (cleanedNumber.endsWith('0000')) {
      throw new Error('Payment declined by card issuing bank (insufficient funds or security check failed).');
    }

    // Generate transaction reference
    const transactionRef = 'TXN-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);

    // Step 2 & 3: Finalize booking only now that payment succeeded
    const userStorage = localStorage.getItem('user');
    let userId = 4; // Default guest customer
    try {
      if (userStorage) {
        const u = JSON.parse(userStorage);
        userId = u.user_id || u.id || 4;
      }
    } catch {}

    const seatIds = (bookingData.selectedSeats || []).map(s => s.seat_id);
    const dateFormatted = bookingData.date || new Date().toISOString().slice(0, 10);

    const bookingPayload = {
      user_id: userId,
      showtime_id: bookingData.showtimeId || bookingData.showtime?.showtime_id || 101,
      seat_ids: seatIds,
      total_amount: amount,
      payment_method: paymentMethod,
      transaction_ref: transactionRef,
      date: dateFormatted
    };

    // Calls backend booking creation with transaction wrapping
    const bookingResult = await bookingService.createBooking(bookingPayload);

    // Construct full confirmation payload
    const bookingCode = bookingResult.booking_code || `GC-${dateFormatted.replace(/-/g, '')}-${String(bookingResult.booking_id || 101).padStart(3, '0')}`;

    return {
      success: true,
      bookingId: bookingResult.booking_id,
      bookingCode,
      transactionRef,
      paymentMethod,
      amount,
      movie: bookingData.movie,
      date: bookingData.date,
      time: bookingData.time || bookingData.showtime?.start_time,
      cinema: bookingData.cinema || bookingData.showtime?.cinema_name,
      screen: bookingData.showtime?.screen_name || 'Standard Screen',
      seats: bookingData.selectedSeats,
      seatNumbers: (bookingData.selectedSeats || []).map(s => s.seat_number).join(', '),
      paidAt: new Date().toISOString()
    };
  }
};

export default paymentService;
