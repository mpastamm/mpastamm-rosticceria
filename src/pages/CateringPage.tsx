import React from 'react';
import { PartyPopper, Users, Calendar, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { BusinessSettings } from '../types';
import { generateDirectWhatsAppUrl } from '../services/whatsapp';
import { INITIAL_SITE_CONTENT } from '../services/storage';

interface CateringPageProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

export const CateringPage: React.FC<CateringPageProps> = ({ settings, onNavigate }) => {
  const content = { ...INITIAL_SITE_CONTENT, ...(settings.site_content || {}) };
  const whatsappUrl = generateDirectWhatsAppUrl(
    settings.whatsapp_notification_phone,
    "Buongiorno 'Mpastamm, vorrei ricevere informazioni e un preventivo per un servizio di catering ed eventi."
  );

  return (
    <div className="bg-[#E5DFD4] min-h-screen text-[#1C211E] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <span className="font-script text-3xl sm:text-4xl text-[#16251A]">
            {content.catering_eyebrow}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#16251A]">
            {content.catering_title}
          </h1>
          <p className="text-sm sm:text-base text-[#4E4438] max-w-xl mx-auto">
            {content.catering_description}
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-xl border border-[#D5CABB]">
          <img
            src={content.catering_image_url}
            alt={content.catering_image_alt}
            className="w-full h-56 sm:h-72 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#16251A] text-white flex items-center justify-center">
              <PartyPopper className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              {content.catering_feature_1_title}
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              {content.catering_feature_1_description}
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#16251A] text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              {content.catering_feature_2_title}
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              {content.catering_feature_2_description}
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#16251A] text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              {content.catering_feature_3_title}
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              {content.catering_feature_3_description}
            </p>
          </div>
        </div>

        {/* Action card */}
        <div className="bg-[#16251A] text-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#2B4332] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold text-white">
              {content.catering_action_title}
            </h3>
            <p className="text-xs sm:text-sm text-[#C9B9A6]">
              {content.catering_action_description}
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
              <span>{content.catering_whatsapp_label}</span>
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
