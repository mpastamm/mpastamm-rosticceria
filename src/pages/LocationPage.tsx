import React from 'react';
import { MapPin, Phone, Clock, Instagram, Facebook, Music2, Navigation } from 'lucide-react';
import { BusinessSettings, OpeningHourDay } from '../types';
import { getSocialUrl } from '../utils/socialLinks';

interface LocationPageProps {
  settings: BusinessSettings;
  openingHours: OpeningHourDay[];
}

export const LocationPage: React.FC<LocationPageProps> = ({ settings, openingHours }) => {
  const instagramUrl = getSocialUrl('instagram', settings.instagram_url || settings.instagram_handle);
  const facebookUrl = getSocialUrl('facebook', settings.facebook_url);
  const tiktokUrl = getSocialUrl('tiktok', settings.tiktok_url);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#556B2F] font-bold">
          Vieni a Trovarci
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1C211E]">
          Dove Siamo & Orari
        </h1>
        <p className="text-sm text-[#55645A]">
          Il laboratorio di 'Mpastamm ti aspetta per il ritiro dei tuoi ordini caldi appena sfornati.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contacts & Address Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-[#1C211E] mb-1">
              Rosticceria 'Mpastamm
            </h2>
            <p className="text-xs uppercase tracking-wider text-[#7A8A7E] font-semibold">
              {settings.tagline}
            </p>
          </div>

          <div className="space-y-4 text-sm text-[#1C211E]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#1B3B2B] flex items-center justify-center shrink-0 border border-[#E8DFD1]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#7A8A7E] block uppercase">Indirizzo</span>
                <p className="font-medium">{settings.address}</p>
                <p className="text-xs text-[#55645A]">{settings.city}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#1B3B2B] flex items-center justify-center shrink-0 border border-[#E8DFD1]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#7A8A7E] block uppercase">Telefono & Asporto</span>
                <a href={`tel:${settings.phone}`} className="font-medium text-[#1B3B2B] hover:underline">
                  {settings.phone}
                </a>
              </div>
            </div>

            {(instagramUrl || facebookUrl || tiktokUrl) && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#1B3B2B] flex items-center justify-center shrink-0 border border-[#E8DFD1]">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#7A8A7E] block uppercase">Social</span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[#1B3B2B] hover:underline"
                      >
                        <Instagram className="w-4 h-4" /> Instagram
                      </a>
                    )}
                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[#1B3B2B] hover:underline"
                      >
                        <Facebook className="w-4 h-4" /> Facebook
                      </a>
                    )}
                    {tiktokUrl && (
                      <a
                        href={tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[#1B3B2B] hover:underline"
                      >
                        <Music2 className="w-4 h-4" /> TikTok
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settings.address + ' ' + settings.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Apri indicazioni stradali su Google Maps</span>
            </a>
          </div>
        </div>

        {/* Opening Hours Schedule Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
            <Clock className="w-5 h-5 text-[#1B3B2B]" />
            <h2 className="font-display text-xl font-bold text-[#1C211E]">
              Orari di Apertura Banco
            </h2>
          </div>

          <div className="divide-y divide-[#F5F2EB] text-sm">
            {openingHours.map((oh) => (
              <div key={oh.day_of_week} className="py-2.5 flex items-center justify-between">
                <span className="font-medium text-[#1C211E]">{oh.day_name}</span>
                {oh.is_open ? (
                  <span className="font-mono text-xs font-semibold text-[#1B3B2B] bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#E8DFD1]">
                    {oh.evening_open} – {oh.evening_close}
                  </span>
                ) : (
                  <span className="text-xs text-red-700 bg-red-50 font-bold px-2 py-0.5 rounded">
                    Chiuso
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-[#7A8A7E] bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD1] leading-relaxed">
            I prodotti caldi da forno e friggitoria vengono preparati in base alle fasce di prenotazione per garantire la massima freschezza e croccantezza.
          </p>
        </div>
      </div>
    </div>
  );
};
