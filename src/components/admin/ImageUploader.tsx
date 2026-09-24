import React, { useRef, useState } from 'react';
import { Upload, X, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { ASSET_IMAGES } from '../../services/imageMap';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { uploadProductImage } from '../../services/supabaseStore';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: '4/3' | '16/9' | '1/1';
}

const PRESET_PHOTOS = [
  { name: 'Saltimbocca', url: ASSET_IMAGES.saltimbocca },
  { name: 'Bun Gourmet', url: ASSET_IMAGES.bun },
  { name: 'Rutiello 2.0', url: ASSET_IMAGES.rutiello },
  { name: 'Padellino', url: ASSET_IMAGES.padellino },
  { name: 'Friggitoria', url: ASSET_IMAGES.friggitoria },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  aspectRatio = '4/3',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTecaPreview, setShowTecaPreview] = useState(false);

  // Compress image on client to max 1200px width WebP/JPEG for high performance
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          canvas.toBlob(async (blob) => {
            try {
              const remoteUrl = isSupabaseConfigured && blob ? await uploadProductImage(blob) : null;
              onChange(remoteUrl || compressedDataUrl);
            } catch {
              setError('Impossibile salvare la foto nello storage remoto');
            } finally {
              setIsCompressing(false);
            }
          }, 'image/jpeg', 0.88);
          return;
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setError('Impossibile caricare il file selezionato');
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setError('Errore di lettura file');
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : 'aspect-[4/3]';

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="space-y-2">
          <div
            className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden border border-[#D8C3A5] group bg-stone-900 shadow-sm`}
          >
            {showTecaPreview ? (
              /* LIVE PREVIEW INSIDE THE EXACT TECA DISPLAY CASE */
              <div className="relative w-full h-full bg-[#1F140C] overflow-hidden">
                <img
                  src={ASSET_IMAGES.glassDisplayCase}
                  alt="Teca Preview"
                  className="w-full h-full object-cover"
                />
                {/* Spotlights */}
                <div className="absolute top-[6%] left-[22%] w-12 h-16 bg-amber-200/25 rounded-full blur-md pointer-events-none" />
                <div className="absolute top-[6%] right-[22%] w-12 h-16 bg-amber-200/25 rounded-full blur-md pointer-events-none" />
                {/* Product Inside the Teca */}
                <div className="absolute top-[17%] bottom-[29%] left-[13%] right-[13%] flex items-center justify-center overflow-hidden rounded-md">
                  <img
                    src={value}
                    alt="Prodotto in Teca"
                    className="w-full h-full object-cover rounded shadow-md"
                  />
                </div>
              </div>
            ) : (
              <img
                src={value}
                alt="Foto Prodotto"
                className="w-full h-full object-cover"
              />
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/95 hover:bg-white text-[#16251A] text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sostituisci
              </button>
              <button
                type="button"
                onClick={() => setShowTecaPreview(!showTecaPreview)}
                className="px-3 py-1.5 bg-[#16251A] hover:bg-[#253E2B] text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> {showTecaPreview ? 'Foto Standard' : 'Anteprima Teca'}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#7A8A7E]">
            💡 Clicca su <strong>Anteprima Teca</strong> per vedere come apparirà la foto esposta sotto i faretti della vetrina.
          </p>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-[#D8C3A5] hover:border-[#16251A] rounded-2xl p-6 ${aspectClass} flex flex-col items-center justify-center text-center cursor-pointer bg-[#FAF7F2] hover:bg-[#F4EFE6] transition-colors`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center gap-2 text-stone-500">
              <RefreshCw className="w-6 h-6 animate-spin text-[#16251A]" />
              <span className="text-xs font-medium">Ottimizzazione foto per la teca...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#16251A] shadow-xs border border-[#E8DFD1]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1C211E]">Carica fotografia per la teca</p>
                <p className="text-xs text-[#7A8A7E] mt-0.5">
                  Trascina qui o tocca per selezionare dal dispositivo
                </p>
              </div>
              <span className="text-[11px] text-[#A89F91]">JPG, PNG o WEBP ad alta definizione</span>
            </div>
          )}
        </div>
      )}

      {/* Preset Quick-picks */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-[#706456] flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-700" /> Oppure scegli una foto della rosticceria:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PHOTOS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.url)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EFE9DF] hover:bg-[#E2D8C7] text-[#332A20] border border-[#D5C7B5] transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
