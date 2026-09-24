import React from 'react';
import { Sparkles, Heart, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { BusinessSettings } from '../types';
import { ASSET_IMAGES } from '../services/imageMap';

interface AboutPageProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  return (
    <div className="bg-[#E5DFD4] min-h-screen text-[#1C211E] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="font-script text-3xl sm:text-4xl text-[#16251A]">
            La nostra storia
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#16251A]">
            Chi Siamo
          </h1>
          <p className="text-sm sm:text-base text-[#4E4438] max-w-xl mx-auto">
            'Mpastamm nasce dal desiderio di portare nel cuore della città i profumi veri della rosticceria e del forno tradizionale campano.
          </p>
        </div>

        {/* Hero Photo */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#D5CABB]">
          <img
            src={ASSET_IMAGES.hero}
            alt="'Mpastamm Locale"
            className="w-full h-72 sm:h-96 object-cover"
          />
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-2">
            <Sparkles className="w-6 h-6 text-[#16251A]" />
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              Lievitazione Lenta
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              Oltre 24 ore di maturazione a temperatura controllata per un impasto leggero, profumato e altamente digeribile.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-2">
            <Award className="w-6 h-6 text-[#16251A]" />
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              Ingredienti Selezionati
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              Mozzarella e provola affumicata dei monti Lattari, pomodoro San Marzano e farine italiane macinate a pietra.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5CABB] space-y-2">
            <Heart className="w-6 h-6 text-[#16251A]" />
            <h3 className="font-serif text-lg font-bold text-[#16251A]">
              Passione Quotidiana
            </h3>
            <p className="text-xs text-[#5B5044] leading-relaxed">
              "Nun c'è fame, è voglia e sfizio": ogni nostra preparazione è pensata per regalare un momento di autentica gioia.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-3 rounded-full bg-[#16251A] hover:bg-[#203626] text-white font-medium text-sm inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>Scopri La Vetrina di Oggi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
