import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-[#E8DFD1] shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#F4EFE6] flex items-center justify-center text-[#1B3B2B] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display text-lg font-bold text-[#1C211E] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#7A8A7E] max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
