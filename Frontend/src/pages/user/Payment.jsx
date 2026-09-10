import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Film,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const Payment = () => {
  const navigate = useNavigate();
  const bookingCtx = useBooking();
  const booking = bookingCtx?.booking || {};
  const setBookingConfirmation = bookingCtx?.setBookingConfirmation || (() => {});

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'online'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Card form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Summary details
  const movie = booking?.movie || null;
  const showtime = booking?.showtime || null;
  const cinema = booking?.cinema || null;
  const selectedSeats = Array.isArray(booking?.selectedSeats) ? booking.selectedSeats : [];
  const seatNumbers = selectedSeats.map(s => s?.seat_number || '').filter(Boolean).join(', ');
  const subtotal = booking?.subtotal || selectedSeats.reduce((sum, s) => sum + (parseFloat(s?.price) || 1500), 0);
  const bookingFee = booking?.bookingFee !== undefined ? booking.bookingFee : 100;
  const totalAmount = subtotal > 0 ? subtotal + bookingFee : 0;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    if (formErrors.cardNumber) {
      setFormErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiryDate(raw);
    if (formErrors.expiryDate) {
      setFormErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  // Format CVV (3 digits)
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(raw);
    if (formErrors.cvv) {
      setFormErrors(prev => ({ ...prev, cvv: '' }));
    }
  };

  // Submission handler
  const handlePayNow = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedSeats.length === 0) {
      toast.error('No seats selected. Please select your seats first.');
      navigate('/seat-selection');
      return;
    }

    // Validate if Card method
    if (paymentMethod === 'card') {
      const validation = paymentService.validateCardDetails({
        cardholderName,
        cardNumber,
        expiryDate,
        cvv
      });

      if (!validation.isValid) {
        setFormErrors(validation.errors);
        toast.error('Please fix the errors in the payment form.');
        return;
      }
    }

    // Set loading state on the entire payment panel
    setIsProcessing(true);

    try {
      // Execute payment and atomic booking process
      const confirmation = await paymentService.processPayment({
        amount: totalAmount,
        paymentMethod,
        cardDetails: {
          cardholderName,
          cardNumber,
          expiryDate,
          cvv
        },
        bookingData: booking
      });

      // Save confirmation into BookingContext
      setBookingConfirmation(confirmation);

      toast.success('Payment verified! Booking confirmed.');

      // On success -> navigate to /booking-success
      navigate('/booking-success');
    } catch (err) {
      // On failure -> show error toast/banner, re-enable form, do not navigate away
      console.error('Payment failure:', err);
      const errMsg = err.message || 'Payment failed, please try again.';
      setErrorMessage(errMsg);
      toast.error(errMsg);
      setIsProcessing(false);
    }
  };

  // Fallback if user navigated with zero seats
  if (selectedSeats.length === 0 && !isProcessing) {
    return (
      <div className="bg-[#080B14] text-slate-100 min-h-screen py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 rounded-3xl border border-white/[0.08] bg-[#101426] p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Seats Selected</h2>
          <p className="text-xs text-slate-400">
            Please pick a showtime and select your seats before proceeding to payment.
          </p>
          <Link
            to="/movies"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#E50914] text-white font-bold text-xs hover:bg-[#F40612] transition"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#080B14] text-slate-100 min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-6">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-xl hover:bg-white/[0.08] cursor-pointer disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Seat Selection
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
            <Lock className="w-3 h-3" /> Step 3: Secure Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Review & Finalize Payment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete your purchase to guarantee and lock your reserved seats.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-rose-200">Transaction Failed</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Payment Form Panel with Loading Overlay */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl border border-white/[0.08] bg-[#0E1222] p-6 sm:p-8 shadow-2xl overflow-hidden">

              {/* Whole-Panel Loading Overlay when Processing */}
              {isProcessing && (
                <div className="absolute inset-0 z-50 bg-[#080B14]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E50914] to-indigo-600 p-0.5 animate-spin mb-5">
                    <div className="w-full h-full bg-[#080B14] rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white">Processing Payment...</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Communicating securely with the payment gateway and reserving your seats. Please do not close or refresh this page.
                  </p>
                </div>
              )}

              <form onSubmit={handlePayNow} className="space-y-6">

                {/* 1. Payment Method Tabs */}
                <div>
                  <label className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-3">
                    Choose Payment Method
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Card Option */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500'
                          : 'bg-[#12162A] border-white/[0.08] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div>
                        <span className="text-xs font-black block text-white">Credit / Debit Card</span>
                        <span className="text-[10px] text-slate-400">Visa, Mastercard</span>
                      </div>
                    </button>

                    {/* Online / Wallet Option */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setPaymentMethod('online')}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === 'online'
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500'
                          : 'bg-[#12162A] border-white/[0.08] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Smartphone className={`w-5 h-5 ${paymentMethod === 'online' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div>
                        <span className="text-xs font-black block text-white">Online Payment</span>
                        <span className="text-[10px] text-slate-400">Digital Gateway</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Card Inputs Section */}
                {paymentMethod === 'card' ? (
                  <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                    {/* Cardholder Name */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        disabled={isProcessing}
                        placeholder="John Doe"
                        value={cardholderName}
                        onChange={(e) => {
                          setCardholderName(e.target.value);
                          if (formErrors.cardholderName) {
                            setFormErrors(prev => ({ ...prev, cardholderName: '' }));
                          }
                        }}
                        className={`w-full bg-[#12162A] border rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                          formErrors.cardholderName
                            ? 'border-rose-500 focus:ring-rose-500/40'
                            : 'border-white/[0.12] focus:ring-indigo-500/40 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.cardholderName && (
                        <span className="text-[10px] text-rose-400 mt-1 block">{formErrors.cardholderName}</span>
                      )}
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                        Card Number (16 Digits)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled={isProcessing}
                          placeholder="4532 8901 2345 6789"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className={`w-full bg-[#12162A] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                            formErrors.cardNumber
                              ? 'border-rose-500 focus:ring-rose-500/40'
                              : 'border-white/[0.12] focus:ring-indigo-500/40 focus:border-indigo-500'
                          }`}
                        />
                        <CreditCard className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
                      </div>
                      {formErrors.cardNumber && (
                        <span className="text-[10px] text-rose-400 mt-1 block">{formErrors.cardNumber}</span>
                      )}
                    </div>

                    {/* Expiry & CVV Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          disabled={isProcessing}
                          placeholder="12/28"
                          value={expiryDate}
                          onChange={handleExpiryChange}
                          className={`w-full bg-[#12162A] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                            formErrors.expiryDate
                              ? 'border-rose-500 focus:ring-rose-500/40'
                              : 'border-white/[0.12] focus:ring-indigo-500/40 focus:border-indigo-500'
                          }`}
                        />
                        {formErrors.expiryDate && (
                          <span className="text-[10px] text-rose-400 mt-1 block">{formErrors.expiryDate}</span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                          CVV (3 Digits)
                        </label>
                        <input
                          type="password"
                          disabled={isProcessing}
                          placeholder="•••"
                          maxLength={3}
                          value={cvv}
                          onChange={handleCvvChange}
                          className={`w-full bg-[#12162A] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                            formErrors.cvv
                              ? 'border-rose-500 focus:ring-rose-500/40'
                              : 'border-white/[0.12] focus:ring-indigo-500/40 focus:border-indigo-500'
                          }`}
                        />
                        {formErrors.cvv && (
                          <span className="text-[10px] text-rose-400 mt-1 block">{formErrors.cvv}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-2 text-xs text-slate-300">
                    <span className="font-bold text-white block">Galaxy Online Instant Checkout</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Clicking Pay will simulate an authenticated digital banking payment confirmation. Your selected seats will be immediately locked and confirmed.
                    </p>
                  </div>
                )}

                {/* 3. Security Guarantee Strip */}
                <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>256-Bit SSL Encrypted & PCI-DSS Compliant Gateway</span>
                </div>

                {/* 4. Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] hover:brightness-110 text-white font-black text-sm shadow-[0_0_25px_rgba(229,9,20,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Pay Rs. {totalAmount.toLocaleString()}
                </button>

              </form>
            </div>
          </div>

          {/* Right Column: Order Summary & Price Breakdown */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 shadow-2xl space-y-5">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                <Ticket className="w-4 h-4 text-[#E50914]" />
                Order Review
              </h2>

              {/* Movie info snippet */}
              {movie && (
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                  <img
                    src={movie.poster_url || '/images/1.jfif'}
                    alt={movie.title}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200';
                    }}
                    className="w-14 aspect-[2/3] rounded-xl object-cover object-center border border-white/10 shadow-sm flex-shrink-0 bg-gray-800"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-white line-clamp-1">
                      {movie.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {cinema?.name || showtime?.cinema_name || 'Nova IMAX Colombo'}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">
                      {showtime?.screen_name || 'Hall 1'}
                    </span>
                  </div>
                </div>
              )}

              {/* Date & Time specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Show Date
                  </span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {booking.date || '2026-09-12'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Showtime
                  </span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {booking.time || showtime?.start_time || '10:00 AM'}
                  </span>
                </div>
              </div>

              {/* Reserved Seats List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reserved Seats ({selectedSeats.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.seat_id}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300"
                    >
                      {s.seat_number}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-white/[0.08] text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Seats Subtotal</span>
                  <span className="font-mono font-bold text-white">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Booking Fee (fixed)</span>
                  <span className="font-mono font-bold text-white">
                    Rs. {bookingFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-sm">
                  <span className="font-black text-white">Total Amount</span>
                  <span className="font-black font-mono text-lg text-amber-400">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Payment;
