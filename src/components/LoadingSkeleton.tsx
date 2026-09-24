import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-[#E8DFD1] shadow-xs animate-pulse"
        >
          <div className="aspect-[4/3] bg-stone-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-stone-200 rounded w-3/4" />
            <div className="h-3.5 bg-stone-100 rounded w-full" />
            <div className="h-3.5 bg-stone-100 rounded w-2/3" />
            <div className="pt-2 flex justify-between items-center">
              <div className="h-5 bg-stone-200 rounded w-16" />
              <div className="h-8 bg-stone-200 rounded-lg w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
