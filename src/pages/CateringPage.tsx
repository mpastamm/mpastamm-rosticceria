import React from 'react';
import { PartyPopper, Users, Calendar, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { BusinessSettings } from '../types';
import { generateDirectWhatsAppUrl } from '../services/whatsapp';

interface CateringPageProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

export const CateringPage: React.FC<CateringPageProps> = ({ settings, onNavigate }) => {
  const whatsappUrl = generateDirectWhatsAppUrl(
    settings.whatsapp_notification_phone,
    "Buongiorno 'Mpastamm, vorrei ricevere informazioni e un preventivo per un servizio di catering ed eventi."
  );

  return (
    <div className="bg-[#E5DFD4] min-h-screen text-[#1C211E] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <span className="font-script text-3xl sm:text-4xl text-[#16251A]">
            Eventi & Feste
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#16251A]">
            Catering 'Mpastamm
          </h1>
          <p className="text-sm sm:text-base text-[#4E4438] max-w-xl mx-auto">
            Porta l'eccellenza della rosticceria napoletana alle tue feste di compleanno, lauree, cene aziendali ed eventi privati.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#16251A] text-white flex items-center justify-center">
              <PartyPopper className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              Feste & Compleanni
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              Vassoi assortiti di mini saltimbocca caldi, bun soffici farciti, trancetti di rutiello e mix di friggitoria dorata.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#16251A] text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              Eventi Aziendali
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              Pausa pranzo o aperitivo di lavoro con confezioni curate e riscaldatori termici inclusi su richiesta per mantenere tutto croccante.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#16251A] text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              Personalizzazione Menu
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              Possibilità di concordare farciture speciali, alternative vegetariane e orari di consegna dedicati.
            </p>
          </div>
        </div>

        {/* Action card */}
        <div className="bg-[#16251A] text-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#2B4332] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold text-white">
              Vuoi organizzare il tuo catering?
            </h3>
            <p className="text-xs sm:text-sm text-[#C9B9A6]">
              Scrivici direttamente su WhatsApp o chiamaci per un preventivo personalizzato rapido.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#E5D8B8] hover:bg-white text-[#16251A] font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-emerald-800" />
              <span>Preventivo WhatsApp</span>
            </a>

            <a
              href={`tel:${settings.phone}`}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm inline-flex items-center gap-2 border border-white/20 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{settings.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
