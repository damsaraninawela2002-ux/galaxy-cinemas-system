import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Calendar, 
  Plus, 
  Minus, 
  ShoppingBag,
  Film,
  Lock
} from 'lucide-react';
import { useBooking } from './context/BookingContext';
import { MOCK_SNACKS, MOCK_OFFERS, MOCK_CINEMAS, MOCK_SHOWTIMES } from './data/mockData';

export default function BookingSummary() {
  const navigate = useNavigate();
  const { booking, clearBooking } = useBooking();

  // Fallback defaults if accessed directly without prior selection
  const movie = booking.movie || { title: 'Movie Selection', poster_url: '/images/1.jfif', genre: ['Action'] };
  const cinema = booking.cinema || MOCK_CINEMAS[0];
  const showtime = booking.showtime || MOCK_SHOWTIMES[0];
  const date = booking.date || "Today, Oct 12";
  const selectedSeats = booking.selectedSeats?.length > 0
    ? booking.selectedSeats
    : [
        { seat_id: 101, seat_number: "D4", tier: "vip", price: 22.00 },
        { seat_id: 102, seat_number: "D5", tier: "vip", price: 22.00 }
      ];

  // Concessions cart state: { snackId: quantity }
  const [snackCart, setSnackCart] = useState({});

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card form state
  const [cardDetails, setCardDetails] = useState({
    number: '4242 •••• •••• 9012',
    name: 'Alexander Mercer',
    expiry: '08/28',
    cvv: '884'
  });

  // Snack quantity handler
  const updateSnackQty = (snackId, delta) => {
    setSnackCart(prev => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return { ...prev, [snackId]: next };
    });
  };

  // Promo Code Validation
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    const found = MOCK_OFFERS.find(o => o.code === code);

    if (found) {
      setAppliedPromo(found);
    } else {
      setPromoError('Invalid coupon code. Try GALAXY25 or STUDENT10');
    }
  };

  // Calculations
  const ticketsSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const bookingFee = selectedSeats.length * 1.50;

  const snacksSubtotal = useMemo(() => {
    return Object.entries(snackCart).reduce((sum, [snackId, qty]) => {
      const item = MOCK_SNACKS.find(s => s.id === snackId);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [snackCart]);

  const rawTotal = ticketsSubtotal + bookingFee + snacksSubtotal;

  // Discount calculation
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percentage') {
      return ticketsSubtotal * appliedPromo.value;
    }
    if (appliedPromo.type === 'flat') {
      return Math.min(ticketsSubtotal, appliedPromo.value);
    }
    if (appliedPromo.type === 'snack') {
      return Math.min(snacksSubtotal, appliedPromo.value);
    }
    return 0;
  }, [appliedPromo, ticketsSubtotal, snacksSubtotal]);

  const grandTotal = Math.max(0, rawTotal - discountAmount);

  const handleCompletePayment = () => {
    setIsProcessing(true);

    const bookingCode = `GC-${Math.floor(100000 + Math.random() * 900000)}`;

    const confirmedBooking = {
      bookingCode,
      movie,
      cinema,
      showtime,
      date,
      selectedSeats,
      snackCart,
      ticketsSubtotal,
      bookingFee,
      snacksSubtotal,
      discountAmount,
      grandTotal,
      paymentMethod,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking/success', { state: { booking: confirmedBooking } });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            Back to Seat Map
          </button>
        </div>

        {/* Header */}
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
            Secure Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight mt-1">
            Review Order & Payment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete your purchase to receive your instant digital entrance ticket.
          </p>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Order Details, Concessions, Payment Methods (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Screening Details Card */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                Screening Details
              </h3>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#090C16] border border-white/[0.06]">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-20 aspect-[2/3] rounded-xl object-cover object-center border border-white/[0.1] shadow-md flex-shrink-0 bg-gray-800"
                />
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-bold text-base text-white truncate">{movie.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {cinema.name}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-300">{showtime.screen_name || 'Auditorium 1'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1 font-mono font-bold text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      {showtime.start_time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {date}
                    </span>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {selectedSeats.map(s => (
                      <span
                        key={s.seat_id}
                        className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-[11px] font-mono font-bold text-indigo-300"
                      >
                        Seat {s.seat_number}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Concessions & Snacks Selector */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    Cinema Snacks & Concessions
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-order snacks and skip the lines at the counter
                  </p>
                </div>
                {snacksSubtotal > 0 && (
                  <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    +${snacksSubtotal.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {MOCK_SNACKS.map((snack) => {
                  const qty = snackCart[snack.id] || 0;

                  return (
                    <div
                      key={snack.id}
                      className="p-3.5 rounded-2xl bg-[#090C16] border border-white/[0.06] flex items-center justify-between gap-4 hover:border-white/15 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={snack.image}
                          alt={snack.name}
                          className="w-14 h-14 rounded-xl object-cover border border-white/[0.08] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-white truncate">{snack.name}</h5>
                          <p className="text-[11px] text-slate-400 truncate">{snack.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono font-extrabold text-amber-400">
                              ${snack.price.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400">• {snack.calories}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-[#12172A] p-1 rounded-xl border border-white/[0.1]">
                            <button
                              onClick={() => updateSnackQty(snack.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 flex items-center justify-center transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono font-bold text-xs text-white w-4 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateSnackQty(snack.id, 1)}
                              className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateSnackQty(snack.id, 1)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-bold border border-white/[0.08] transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Payment Method Selection */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Select Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                      : 'bg-[#090C16] border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    {paymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Credit Card</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Visa, Mastercard, Amex</p>
                  </div>
                </button>

                {/* Digital Wallet */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    paymentMethod === 'wallet'
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                      : 'bg-[#090C16] border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    {paymentMethod === 'wallet' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Digital Wallet</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Apple Pay, Google Pay</p>
                  </div>
                </button>

                {/* PayPal */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    paymentMethod === 'paypal'
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                      : 'bg-[#090C16] border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Lock className="w-5 h-5 text-sky-400" />
                    {paymentMethod === 'paypal' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">PayPal</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Fast one-click checkout</p>
                  </div>
                </button>
              </div>

              {/* Card Inputs Mock */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-[#090C16] border border-white/[0.06] space-y-3 mt-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full rounded-xl bg-[#12172A] border border-white/[0.1] px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full rounded-xl bg-[#12172A] border border-white/[0.1] px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full rounded-xl bg-[#12172A] border border-white/[0.1] px-3.5 py-2 text-xs text-white font-mono font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full rounded-xl bg-[#12172A] border border-white/[0.1] px-3.5 py-2 text-xs text-white font-mono font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Order Breakdown, Promo Code, Pay Button (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Promo Code Input Card */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 shadow-xl space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Have a Promo Code or Voucher?
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. GALAXY25"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 rounded-xl bg-[#090C16] border border-white/[0.1] px-3.5 py-2 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Code {appliedPromo.code} applied ({appliedPromo.discount})
                  </span>
                  <button
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoInput('');
                    }}
                    className="text-slate-400 hover:text-rose-400 text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {promoError}
                </p>
              )}

              <p className="text-[10px] text-slate-500">
                Tip: Try code <span className="text-amber-300 font-mono">GALAXY25</span> for 25% off tickets.
              </p>
            </div>

            {/* Total Price Breakdown Card */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#101426] p-6 shadow-2xl space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                {/* Tickets */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    Cinema Tickets ({selectedSeats.length}x)
                  </span>
                  <span className="font-mono font-semibold text-white">
                    ${ticketsSubtotal.toFixed(2)}
                  </span>
                </div>

                {/* Booking Fee */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    Online Convenience Fee
                  </span>
                  <span className="font-mono font-semibold text-white">
                    ${bookingFee.toFixed(2)}
                  </span>
                </div>

                {/* Snacks */}
                {snacksSubtotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      Concessions & Snacks
                    </span>
                    <span className="font-mono font-semibold text-white">
                      ${snacksSubtotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-semibold pt-1">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Grand Total */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-white block">Grand Total</span>
                    <span className="text-[10px] text-slate-400">Inclusive of all local entertainment taxes</span>
                  </div>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Shield */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-400 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>256-bit TLS encrypted transaction with 100% money-back guarantee.</span>
              </div>

              {/* Complete Booking CTA Button */}
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(79,70,229,0.5)] transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ${grandTotal.toFixed(2)} & Complete
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
