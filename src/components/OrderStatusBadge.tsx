import React from 'react';
import { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'NUOVO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-sky-800 bg-sky-100/90 border border-sky-300 rounded-md ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-ping" />
          NUOVO
        </span>
      );

    case 'ACCETTATO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-indigo-800 bg-indigo-100/90 border border-indigo-300 rounded-md ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          ACCETTATO
        </span>
      );

    case 'IN PREPARAZIONE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-amber-900 bg-amber-100 border border-amber-300 rounded-md ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          IN PREPARAZIONE
        </span>
      );

    case 'PRONTO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-md ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          PRONTO AL RITIRO
        </span>
      );

    case 'RITIRATO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-stone-700 bg-stone-100 border border-stone-300 rounded-md ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
          RITIRATO
        </span>
      );

    case 'ANNULLATO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-red-800 bg-red-100 border border-red-300 rounded-md ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          ANNULLATO
        </span>
      );

    default:
      return null;
  }
};
