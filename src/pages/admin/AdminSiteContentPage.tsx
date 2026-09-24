import React, { useMemo, useState } from 'react';
import { CheckCircle2, Image as ImageIcon, Save, Type } from 'lucide-react';
import { BusinessSettings, Category } from '../../types';
import { ASSET_IMAGES } from '../../services/imageMap';
import { ImageUploader } from '../../components/admin/ImageUploader';

interface AdminSiteContentPageProps {
  settings: BusinessSettings;
  categories: Category[];
  onSaveSettings: (settings: BusinessSettings) => void;
  onSaveCategory: (category: Partial<Category>) => void;
}

interface CategoryDraft {
  name: string;
  description: string;
  image_url: string;
}

const CATEGORY_FALLBACKS: Record<string, { description: string; image_url: string }> = {
  saltimbocca: { description: "L'arte del gusto in un morso.", image_url: ASSET_IMAGES.saltimbocca },
  bun: { description: 'Soffice, fragrante, ineguagliabile.', image_url: ASSET_IMAGES.bun },
  'rutiello-2-0': { description: 'La tradizione si rinnova.', image_url: ASSET_IMAGES.rutiello },
  rutiello: { description: 'La tradizione si rinnova.', image_url: ASSET_IMAGES.rutiello },
  padellino: { description: 'Tutta la bontà della rosticceria.', image_url: ASSET_IMAGES.padellino },
  friggitoria: { description: 'Croccante fuori, irresistibile dentro.', image_url: ASSET_IMAGES.friggitoria },
};

function getCategoryFallback(category: Category) {
  return CATEGORY_FALLBACKS[category.slug] || {
    description: '',
    image_url: ASSET_IMAGES.hero,
  };
}

export const AdminSiteContentPage: React.FC<AdminSiteContentPageProps> = ({
  settings,
  categories,
  onSaveSettings,
  onSaveCategory,
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryDraft>>(() =>
    Object.fromEntries(
      categories.map((category) => {
        const fallback = getCategoryFallback(category);
        return [
          category.id,
          {
            name: category.name,
            description: category.description || fallback.description,
            image_url: category.image_url || fallback.image_url,
          },
        ];
      })
    )
  );
  const [isSaved, setIsSaved] = useState(false);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.display_order - b.display_order),
    [categories]
  );

  const updateCategoryDraft = (id: string, partial: Partial<CategoryDraft>) => {
    setCategoryDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...partial },
    }));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveSettings({
      ...formData,
      hero_title: formData.hero_title?.trim() || 'La Vetrina',
      hero_description: formData.hero_description?.trim() || '',
      hero_image_alt: formData.hero_image_alt?.trim() || 'Mpastamm Rosticceria Interno e Vetrina',
      footer_claim: formData.footer_claim?.trim() || 'Nun è fame, è voglia e sfizio.',
    });

    sortedCategories.forEach((category) => {
      const draft = categoryDrafts[category.id];
      if (!draft) return;
      onSaveCategory({
        id: category.id,
        name: draft.name.trim() || category.name,
        description: draft.description.trim(),
        image_url: draft.image_url,
      });
    });

    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn max-w-6xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
            Contenuti del sito
          </h2>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Modifica testi e immagini della vetrina pubblica senza intervenire sul codice.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto active:scale-95 transition-transform"
        >
          <Save className="w-4 h-4" />
          <span>Salva contenuti</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Contenuti aggiornati: la vetrina pubblica è stata sincronizzata.</span>
        </div>
      )}

      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-5">
        <div className="flex items-start gap-3 border-b border-[#F0EBE1] pb-3">
          <div className="p-2.5 rounded-xl bg-[#EAF1E7] text-[#1B3B2B]"><Type className="w-5 h-5" /></div>
          <div>
            <h3 className="font-display font-bold text-base text-[#1C211E]">Hero della vetrina</h3>
            <p className="text-xs text-[#7A8A7E]">È la prima sezione che i clienti vedono entrando nel sito.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">Titolo hero</label>
              <input
                type="text"
                value={formData.hero_title || ''}
                onChange={(event) => setFormData({ ...formData, hero_title: event.target.value })}
                placeholder="La Vetrina"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">Testo descrittivo</label>
              <textarea
                rows={4}
                value={formData.hero_description || ''}
                onChange={(event) => setFormData({ ...formData, hero_description: event.target.value })}
                placeholder="I nostri lievitati..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2] resize-y focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">Testo alternativo immagine</label>
              <input
                type="text"
                value={formData.hero_image_alt || ''}
                onChange={(event) => setFormData({ ...formData, hero_image_alt: event.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              <ImageIcon className="w-4 h-4 text-[#1B3B2B]" /> Immagine hero
            </div>
            <ImageUploader
              value={formData.hero_image_url || ASSET_IMAGES.hero}
              onChange={(url) => setFormData({ ...formData, hero_image_url: url })}
              aspectRatio="16/9"
              mode="site"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-[#1C211E]">Card delle sezioni</h3>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Per ogni categoria puoi cambiare titolo, descrizione e fotografia mostrata nella vetrina.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {sortedCategories.map((category) => {
            const draft = categoryDrafts[category.id] || {
              name: category.name,
              description: category.description || '',
              image_url: category.image_url || getCategoryFallback(category).image_url,
            };

            return (
              <article key={category.id} className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display font-bold text-lg text-[#1C211E]">{category.name}</h4>
                    <p className="text-[11px] text-[#7A8A7E]">Slug: {category.slug}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7D6C] bg-[#EEF3EA] px-2 py-1 rounded-full">
                    Card vetrina
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">Titolo card</label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(event) => updateCategoryDraft(category.id, { name: event.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">Descrizione breve</label>
                    <textarea
                      rows={2}
                      value={draft.description}
                      onChange={(event) => updateCategoryDraft(category.id, { description: event.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2] resize-y focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">Immagine card</label>
                    <ImageUploader
                      value={draft.image_url}
                      onChange={(url) => updateCategoryDraft(category.id, { image_url: url })}
                      aspectRatio="16/9"
                      mode="site"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
        <div className="flex items-start gap-3 border-b border-[#F0EBE1] pb-3">
          <div className="p-2.5 rounded-xl bg-[#EAF1E7] text-[#1B3B2B]"><Type className="w-5 h-5" /></div>
          <div>
            <h3 className="font-display font-bold text-base text-[#1C211E]">Claim del footer</h3>
            <p className="text-xs text-[#7A8A7E]">La frase breve visualizzata nella fascia verde in fondo al sito.</p>
          </div>
        </div>

        <input
          type="text"
          value={formData.footer_claim || ''}
          onChange={(event) => setFormData({ ...formData, footer_claim: event.target.value })}
          placeholder="Nun è fame, è voglia e sfizio."
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
        />
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-3 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Save className="w-4 h-4" />
          Salva tutti i contenuti
        </button>
      </div>
    </form>
  );
};
