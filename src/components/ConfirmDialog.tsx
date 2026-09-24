import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-white w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-xl border border-[#E8DFD1] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-full ${
                isDestructive ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#1C211E]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600 p-1"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#55645A] leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg min-h-[40px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors min-h-[40px] ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1B3B2B] hover:bg-[#28553E]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
