import React from 'react';
import { MapPin, Clock, Sparkles, Instagram, Facebook, Music2, ShieldCheck } from 'lucide-react';
import { BusinessSettings, OpeningHourDay } from '../types';
import mpastammLogo from '../assets/images/mpastamm_logo_white.ts';
import { getSocialUrl } from '../utils/socialLinks';

interface FooterProps {
  settings: BusinessSettings;
  openingHours: OpeningHourDay[];
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, openingHours, onNavigate }) => {
  const instagramUrl = getSocialUrl('instagram', settings.instagram_url || settings.instagram_handle);
  const facebookUrl = getSocialUrl('facebook', settings.facebook_url);
  const tiktokUrl = getSocialUrl('tiktok', settings.tiktok_url);
  const openDays = openingHours.filter((day) => day.is_open);
  const uniqueTimeRanges = Array.from(
    new Set(openDays.map((day) => `${day.evening_open} – ${day.evening_close}`))
  );
  const openingLabel = openDays.length === openingHours.length
    ? 'Aperti tutti i giorni'
    : openDays.length > 0
      ? `Aperti ${openDays.map((day) => day.day_name.slice(0, 3)).join(', ')}`
      : 'Orari da configurare';
  const openingDetail = uniqueTimeRanges.length === 1
    ? uniqueTimeRanges[0]
    : 'Orari variabili · vedi Contatti';

  return (
    <footer className="bg-[#16251A] text-[#FAF7F2] border-t border-[#233B29] py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Brand Logo */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
            <img
              src={mpastammLogo}
              alt="Mpastamm - officina dei lievitati"
              className="block w-36 sm:w-44 h-auto object-contain"
            />
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
                <span className="block font-medium leading-tight">{openingLabel}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/dove-siamo')}
                  className="text-[11px] text-[#A69E8F] leading-tight hover:text-white hover:underline text-left"
                >
                  {openingDetail}
                </button>
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
              {settings.footer_claim || 'Nun è fame, è voglia e sfizio.'}
            </div>
          </div>

          {/* Right: Social icons & Admin link */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Instagram */}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full text-[#C2B79E] hover:text-white hover:bg-[#233B29] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}

            {/* Facebook */}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full text-[#C2B79E] hover:text-white hover:bg-[#233B29] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}

            {/* TikTok */}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 rounded-full text-[#C2B79E] hover:text-white hover:bg-[#233B29] transition-colors"
              >
                <Music2 className="w-4 h-4" />
              </a>
            )}

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
