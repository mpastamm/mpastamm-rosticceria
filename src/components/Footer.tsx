import React from 'react';
import { MapPin, Clock, Sparkles, Instagram, Facebook, ShieldCheck } from 'lucide-react';
import { BusinessSettings } from '../types';

interface FooterProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-[#16251A] text-[#FAF7F2] border-t border-[#233B29] py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Brand Logo */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
            <span className="font-script text-3xl sm:text-4xl text-[#FAF7F2] leading-none">
              Mpastamm
            </span>
            <span className="text-[8.5px] tracking-[0.28em] text-[#C2B79E] uppercase font-bold pl-0.5 mt-0.5">
              ROSTICCERIA
            </span>
          </div>

          {/* Center Info Items (Exact match to screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-8 text-xs text-[#DDD7CC]">
            {/* Address */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C2B79E] shrink-0" />
              <div className="text-left">
                <span className="block font-medium leading-tight">{settings.address}</span>
                <span className="text-[11px] text-[#A69E8F] leading-tight">{settings.city}</span>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C2B79E] shrink-0" />
              <div className="text-left">
                <span className="block font-medium leading-tight">Aperti tutti i giorni</span>
                <span className="text-[11px] text-[#A69E8F] leading-tight">10:00 - 22:00</span>
              </div>
            </div>

            {/* Quality & Tradition */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C2B79E] shrink-0" />
              <div className="text-left">
                <span className="block font-medium leading-tight">Ingredienti di qualità</span>
                <span className="text-[11px] text-[#A69E8F] leading-tight">Tradizione napoletana</span>
              </div>
            </div>

            {/* Signature Quote in Cursive Handwriting */}
            <div className="font-script text-xl sm:text-2xl text-[#F0EBE1] italic tracking-wide px-2">
              {settings.footer_claim || "Nun c'è fame, è voglia e sfizio."}
            </div>
          </div>

          {/* Right: Social icons & Admin link */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full text-[#C2B79E] hover:text-white hover:bg-[#233B29] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-full text-[#C2B79E] hover:text-white hover:bg-[#233B29] transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="p-2 rounded-full text-[#C2B79E] hover:text-white hover:bg-[#233B29] transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>

            {/* Quick Admin Access */}
            <button
              onClick={() => onNavigate('/admin')}
              className="p-2 rounded-full text-[#A69E8F] hover:text-[#E8DFD1] hover:bg-[#233B29] transition-colors ml-1"
              title="Accesso Amministratore"
              aria-label="Area Amministratore"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
