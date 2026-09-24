import React from 'react';
import { AvailabilityStatus } from '../types';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'available':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/70 rounded-md ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Disponibile
        </span>
      );

    case 'low_stock':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50/95 border border-amber-300/80 rounded-md ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Ultimi disponibili
        </span>
      );

    case 'sold_out':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold tracking-wide text-red-700 bg-red-100/90 border border-red-300 rounded-md ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          SOLD OUT
        </span>
      );

    case 'hidden':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium text-stone-600 bg-stone-100 border border-stone-200 rounded-md ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          Nascosto ai clienti
        </span>
      );

    default:
      return null;
  }
};
