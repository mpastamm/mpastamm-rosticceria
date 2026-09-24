import React, { useState } from 'react';
import {
  Settings,
  Power,
  MessageSquare,
  MapPin,
  Phone,
  Instagram,
  Save,
  CheckCircle2,
  Database,
  RotateCcw,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface AdminSettingsPageProps {
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
  onResetFactoryData: () => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  settings,
  onSaveSettings,
  onResetFactoryData,
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
            Impostazioni Locale & Prenotazioni
          </h2>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Gestisci la chiusura d'emergenza delle prenotazioni e le coordinate della rosticceria.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto active:scale-95 transition-transform"
        >
          <Save className="w-4 h-4" />
          <span>Salva Modifiche</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Impostazioni aggiornate con successo!</span>
        </div>
      )}

      {/* MASTER ORDERS TOGGLE SWITCH (SECTION 22: CHIUDI PRENOTAZIONI) */}
      <div
        className={`p-6 rounded-3xl border shadow-sm transition-colors ${
          formData.orders_enabled
            ? 'bg-emerald-50/50 border-emerald-300'
            : 'bg-amber-50/70 border-amber-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-2xl ${
                formData.orders_enabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#1C211E]">
                  Stato Ricezione Prenotazioni Online
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    formData.orders_enabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {formData.orders_enabled ? 'ATTIVE (ON)' : 'SOSPESE (OFF)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#55645A] mt-1 max-w-xl">
                {formData.orders_enabled
                  ? 'I clienti possono inviare prenotazioni per le fasce orarie disponibili di oggi.'
                  : 'Il carrello e il checkout sono disattivati. I clienti possono comunque esplorare la vetrina e i prezzi.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, orders_enabled: !formData.orders_enabled })
            }
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 shrink-0 ${
              formData.orders_enabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {formData.orders_enabled ? 'Sospendi Prenotazioni' : 'Riapri Prenotazioni'}
          </button>
        </div>

        {/* Message shown when closed */}
        {!formData.orders_enabled && (
          <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-1.5 animate-fadeIn">
            <label className="text-xs font-bold text-amber-900 uppercase">
              Messaggio di avviso per i clienti sul sito
            </label>
            <input
              type="text"
              value={formData.orders_disabled_message}
              onChange={(e) =>
                setFormData({ ...formData, orders_disabled_message: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium"
            />
          </div>
        )}
      </div>

      {/* WHATSAPP NOTIFICATION CONFIGURATION (SECTION 12) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
        <h3 className="font-display font-bold text-base text-[#1C211E] flex items-center gap-2 border-b border-[#F0EBE1] pb-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <span>Notifiche WhatsApp Nuovi Ordini</span>
        </h3>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
            Numero WhatsApp Titolare per la Notifica
          </label>
          <input
            type="tel"
            value={formData.whatsapp_notification_phone}
            onChange={(e) =>
              setFormData({ ...formData, whatsapp_notification_phone: e.target.value })
            }
            placeholder="393331234567"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm font-mono bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
          />
          <p className="text-[11px] text-[#7A8A7E]">
            Inserisci il prefisso internazionale senza il + (es. 39 per Italia, seguito dal cellulare: 393331234567).
          </p>
        </div>
      </div>

      {/* STORE CONTACTS & LOCATION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
        <h3 className="font-display font-bold text-base text-[#1C211E] flex items-center gap-2 border-b border-[#F0EBE1] pb-2">
          <MapPin className="w-5 h-5 text-[#1B3B2B]" />
          <span>Dati Rosticceria & Locale</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              Nome Locale
            </label>
            <input
              type="text"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              Telefono Locale
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              Indirizzo
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              Città
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              Instagram
            </label>
            <input
              type="text"
              value={formData.instagram_handle}
              onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2]"
            />
          </div>
        </div>
      </div>

      {/* FACTORY RESET CARD */}
      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-stone-600" />
            <span>Ripristina Catalogo e Dati di Fabbrica</span>
          </h4>
          <p className="text-xs text-stone-500">
            Ricarica i prodotti demo iniziali ('Mpastamm, Crunchy, Sfizioso, Bun, Arancini...).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors shrink-0"
        >
          Ripristina Catalogo
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Ripristinare i dati iniziali?"
        message="Verranno ripristinati tutti i prodotti, le categorie e le impostazioni predefinite di 'Mpastamm."
        confirmText="Ripristina Tutto"
        onConfirm={() => {
          onResetFactoryData();
          setConfirmResetOpen(false);
          setFormData(settings);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
