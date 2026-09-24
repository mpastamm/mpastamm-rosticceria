import React, { useState } from 'react';
import { Clock, Save, CheckCircle2 } from 'lucide-react';
import { OpeningHourDay, BusinessSettings } from '../../types';

interface AdminHoursPageProps {
  openingHours: OpeningHourDay[];
  settings: BusinessSettings;
  onSaveHours: (hours: OpeningHourDay[], slotInterval: number) => void;
}

export const AdminHoursPage: React.FC<AdminHoursPageProps> = ({
  openingHours,
  settings,
  onSaveHours,
}) => {
  const [hours, setHours] = useState<OpeningHourDay[]>(openingHours);
  const [slotInterval, setSlotInterval] = useState(settings.slot_interval_minutes || 15);
  const [isSaved, setIsSaved] = useState(false);

  const handleDayToggle = (dayIndex: number) => {
    setHours((prev) =>
      prev.map((d) => (d.day_of_week === dayIndex ? { ...d, is_open: !d.is_open } : d))
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'evening_open' | 'evening_close', val: string) => {
    setHours((prev) =>
      prev.map((d) => (d.day_of_week === dayIndex ? { ...d, [field]: val } : d))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveHours(hours, slotInterval);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
            Orari di Servizio & Slot Ritiro
          </h2>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Configura i giorni di apertura e l'intervallo degli orari selezionabili dai clienti.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto active:scale-95 transition-transform"
        >
          <Save className="w-4 h-4" />
          <span>Salva Orari</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Orari e slot di ritiro aggiornati con successo!</span>
        </div>
      )}

      {/* Slot Interval Settings Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-3">
        <h3 className="font-display font-bold text-base text-[#1C211E] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1B3B2B]" />
          <span>Frequenza Fasce Orarie di Ritiro</span>
        </h3>
        <p className="text-xs text-[#55645A]">
          Ogni quanti minuti generare uno slot per il cliente al checkout (es. 15 minuti crea slot alle 18:30, 18:45, 19:00...)
        </p>

        <div className="flex items-center gap-3 pt-1">
          {[10, 15, 20, 30].map((intVal) => (
            <button
              type="button"
              key={intVal}
              onClick={() => setSlotInterval(intVal)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors min-h-[40px] ${
                slotInterval === intVal
                  ? 'bg-[#1B3B2B] text-white shadow-xs'
                  : 'bg-[#FAF7F2] border border-[#D8C3A5] text-[#2E3B32] hover:bg-[#EAE4D7]'
              }`}
            >
              Ogni {intVal} minuti
            </button>
          ))}
        </div>
      </div>

      {/* Weekday Hours Schedule */}
      <div className="bg-white rounded-2xl border border-[#E8DFD1] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#F0EBE1]">
          <h3 className="font-display font-bold text-base text-[#1C211E]">
            Orari Giornalieri Banco Asporto
          </h3>
        </div>

        <div className="divide-y divide-[#F5F2EB]">
          {hours.map((day) => (
            <div
              key={day.day_of_week}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Day title & open toggle */}
              <div className="flex items-center gap-3 w-40">
                <input
                  type="checkbox"
                  id={`day_${day.day_of_week}`}
                  checked={day.is_open}
                  onChange={() => handleDayToggle(day.day_of_week)}
                  className="w-4 h-4 rounded text-[#1B3B2B] focus:ring-[#1B3B2B]"
                />
                <label
                  htmlFor={`day_${day.day_of_week}`}
                  className="font-bold text-sm text-[#1C211E] cursor-pointer"
                >
                  {day.day_name}
                </label>
              </div>

              {/* Open / Close Time inputs */}
              {day.is_open ? (
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#7A8A7E]">Apre:</span>
                    <input
                      type="time"
                      value={day.evening_open || '18:30'}
                      onChange={(e) =>
                        handleTimeChange(day.day_of_week, 'evening_open', e.target.value)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-[#D8C3A5] text-xs font-mono font-bold bg-[#FAF7F2]"
                    />
                  </div>

                  <span className="text-stone-400">—</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#7A8A7E]">Chiude:</span>
                    <input
                      type="time"
                      value={day.evening_close || '23:30'}
                      onChange={(e) =>
                        handleTimeChange(day.day_of_week, 'evening_close', e.target.value)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-[#D8C3A5] text-xs font-mono font-bold bg-[#FAF7F2]"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  Chiuso al pubblico
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
