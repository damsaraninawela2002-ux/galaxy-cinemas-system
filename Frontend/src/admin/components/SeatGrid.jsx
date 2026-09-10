import React from 'react';

const SeatGrid = ({
  seats = [],
  grid = {},
  selectedSeats = [],
  onSeatClick,
  interactive = false,
  showLegend = true,
}) => {
  const rowGroups = React.useMemo(() => {
    if (Object.keys(grid).length > 0) return grid;
    const grouped = {};
    seats.forEach((seat) => {
      const row = seat.row_label || seat.seat_number.charAt(0);
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(seat);
    });
    return grouped;
  }, [seats, grid]);

  const getSeatColor = (seat) => {
    const isSelected = selectedSeats.includes(seat.seat_id);
    if (isSelected) {
      return 'bg-[#E50914] text-white border-red-400 shadow-[0_0_16px_rgba(229,9,20,0.7)] scale-105';
    }

    if (seat.status === 'booked') {
      return 'bg-red-500/15 text-red-400 border-red-500/30 cursor-not-allowed opacity-75';
    }
    if (seat.status === 'maintenance') {
      return 'bg-slate-800/80 text-slate-500 border-slate-700/80 cursor-not-allowed line-through';
    }
    if (seat.status === 'reserved') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }

    // Available seat styles by tier
    if (seat.seat_type === 'vip') {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]';
    }
    if (seat.seat_type === 'couple') {
      return 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25 hover:border-purple-400 w-16';
    }

    // Standard available seat
    return 'bg-[#181D2E] text-slate-300 border-white/[0.1] hover:bg-[#20273D] hover:border-white/20 hover:text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full select-none">
      {/* Curved Cinema Screen */}
      <div className="w-full max-w-xl mb-10 flex flex-col items-center">
        <div className="h-2 w-full rounded-t-full bg-gradient-to-r from-transparent via-[#E50914] to-transparent shadow-[0_0_20px_rgba(229,9,20,0.6)]" />
        <div className="mt-2.5 text-center text-[11px] font-black tracking-widest text-slate-400 uppercase">
          AUDITORIUM SCREEN
        </div>
      </div>

      {/* Rows Container */}
      <div className="space-y-3 overflow-x-auto max-w-full pb-4 px-2">
        {Object.entries(rowGroups).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="flex items-center justify-center gap-2 sm:gap-3 min-w-max">
            <span className="w-6 text-center text-xs font-black text-slate-400 font-mono">
              {rowLabel}
            </span>

            <div className="flex items-center gap-2">
              {rowSeats.map((seat) => (
                <button
                  key={seat.seat_id}
                  type="button"
                  disabled={!interactive || seat.status === 'booked'}
                  onClick={() => onSeatClick && onSeatClick(seat)}
                  className={`flex h-8 min-w-[2rem] px-1.5 items-center justify-center rounded-xl border text-xs font-bold font-mono transition-all duration-150 ${getSeatColor(
                    seat
                  )} ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                  title={`${seat.seat_number} (${seat.seat_type}) - $${seat.price} [${seat.status}]`}
                >
                  {seat.seat_number}
                </button>
              ))}
            </div>

            <span className="w-6 text-center text-xs font-black text-slate-400 font-mono">
              {rowLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-t border-white/[0.06] pt-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-lg border border-white/[0.1] bg-[#181D2E]" />
            <span>Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-lg border border-amber-500/40 bg-amber-500/15" />
            <span className="text-amber-300 font-medium">VIP Recliner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-5 rounded-lg border border-purple-500/40 bg-purple-500/15" />
            <span className="text-purple-300 font-medium">Couple Love-Seat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-lg border border-red-500/40 bg-red-500/20" />
            <span className="text-red-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-lg border border-slate-700 bg-slate-800 line-through" />
            <span className="text-slate-400">Maintenance</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
