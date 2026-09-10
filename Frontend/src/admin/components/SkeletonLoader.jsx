import React from 'react';

const SkeletonLoader = ({ type = 'table', rows = 5, cols = 4 }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-[#121522] border border-white/[0.05] p-6" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="h-80 w-full rounded-2xl bg-[#121522] border border-white/[0.05] p-6 animate-pulse" />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#10131E] p-6 animate-pulse">
      <div className="mb-4 h-6 w-1/4 rounded-xl bg-[#1A1F30]" />
      <div className="space-y-3">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="flex gap-4">
            {[...Array(cols)].map((_, c) => (
              <div key={c} className="h-8 flex-1 rounded-xl bg-[#161B2B]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
