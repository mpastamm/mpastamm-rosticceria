import React, { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Check } from 'lucide-react';
import { Product, Category, AvailabilityStatus } from '../../types';
import { ImageUploader } from '../../components/admin/ImageUploader';

interface AdminProductEditPageProps {
  product: Product | null; // null if creating new
  categories: Category[];
  onSave: (productData: Partial<Product>) => void;
  onCancel: () => void;
}

const BADGE_OPTIONS = [
  { value: 'none', label: 'Nessun Badge' },
  { value: 'Novità', label: 'Novità' },
  { value: 'Consigliato', label: 'Consigliato' },
  { value: 'Più richiesto', label: 'Più richiesto' },
  { value: 'Speciale del giorno', label: 'Speciale del giorno' },
];

export const AdminProductEditPage: React.FC<AdminProductEditPageProps> = ({
  product,
  categories,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || '');
  const [description, setDescription] = useState(product?.description || '');
  const [ingredients, setIngredients] = useState(product?.ingredients || '');
  const [price, setPrice] = useState(product ? product.price.toString() : '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    product?.availability_status || 'available'
  );
  const [stockManagementEnabled, setStockManagementEnabled] = useState(
    product?.stock_management_enabled || false
  );
  const [stockQuantity, setStockQuantity] = useState(
    product ? product.stock_quantity.toString() : '10'
  );
  const [featured, setFeatured] = useState(product?.featured || false);
  const [badge, setBadge] = useState(product?.badge || 'none');
  const [displayOrder, setDisplayOrder] = useState(product ? product.display_order.toString() : '0');
  const [visible, setVisible] = useState(product?.visible ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Il nome prodotto è obbligatorio';
    if (!categoryId) newErrors.categoryId = 'Seleziona una categoria';
    if (!price || isNaN(Number(price.replace(',', '.'))) || Number(price.replace(',', '.')) <= 0) {
      newErrors.price = 'Inserisci un prezzo valido in euro';
    }
    if (!imageUrl) {
      newErrors.imageUrl = 'Carica o seleziona una fotografia del prodotto';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedPrice = parseFloat(price.replace(',', '.'));
    const parsedStock = parseInt(stockQuantity, 10) || 0;
    const parsedOrder = parseInt(displayOrder, 10) || 0;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    onSave({
      id: product?.id,
      name: name.trim(),
      slug: slug || `prodotto-${Date.now()}`,
      category_id: categoryId,
      description: description.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      price: parsedPrice,
      image_url: imageUrl,
      availability_status: availabilityStatus,
      stock_management_enabled: stockManagementEnabled,
      stock_quantity: parsedStock,
      featured,
      badge: badge === 'none' ? undefined : badge,
      visible,
      display_order: parsedOrder,
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1C211E]">
              {isEditing ? `Modifica "${product?.name}"` : 'Aggiungi Nuovo Prodotto'}
            </h2>
            <p className="text-xs text-[#55645A]">
              Compila le informazioni del prodotto per la vetrina e il menu online.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Salva Prodotto</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Essential details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h3 className="font-display font-bold text-base text-[#1C211E] border-b border-[#F0EBE1] pb-2">
              Dati Principali
            </h3>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                Nome Prodotto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Es. Crunchy, Saltimbocca Tradizionale..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2] ${
                  errors.name ? 'border-red-500' : 'border-[#D8C3A5]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-600 font-medium">{errors.name}</p>}
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                  Categoria *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                  Prezzo (€) *
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors({ ...errors, price: '' });
                  }}
                  placeholder="10.00"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2] ${
                    errors.price ? 'border-red-500' : 'border-[#D8C3A5]'
                  }`}
                />
                {errors.price && <p className="text-[11px] text-red-600 font-medium">{errors.price}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                Descrizione
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve presentazione artigianale del prodotto..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                Ingredienti
              </label>
              <textarea
                rows={2}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Es. Cotoletta di pollo fresca panata a mano, insalata croccante, maionese artigianale..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Stock & Availability Card (Section 18: Quantità automatica opzionale) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h3 className="font-display font-bold text-base text-[#1C211E] border-b border-[#F0EBE1] pb-2">
              Disponibilità & Giacenza
            </h3>

            {/* Status Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                Stato di Disponibilità Immediato
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
              >
                <option value="available">🟢 DISPONIBILE</option>
                <option value="low_stock">🟡 QUASI FINITO (Ultimi disponibili)</option>
                <option value="sold_out">🔴 SOLD OUT (Esaurito per oggi)</option>
                <option value="hidden">⚪ NASCOSTO (Non visibile ai clienti)</option>
              </select>
            </div>

            {/* Auto Stock Switch */}
            <div className="pt-2 border-t border-[#F0EBE1] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockManagementEnabled}
                  onChange={(e) => setStockManagementEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1B3B2B] focus:ring-[#1B3B2B]"
                />
                <span className="text-xs sm:text-sm font-bold text-[#1C211E]">
                  Attiva gestione quantità automatica (decremento automatico ad ogni ordine)
                </span>
              </label>

              {stockManagementEnabled && (
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD1] space-y-1 animate-fadeIn">
                  <label className="text-xs font-bold text-[#1B3B2B] uppercase">
                    Quantità disponibile rimasta oggi
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-32 px-3 py-1.5 rounded-lg border border-[#D8C3A5] text-sm font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
                  />
                  <p className="text-[11px] text-[#7A8A7E]">
                    Quando la quantità raggiunge 0, il prodotto passerà automaticamente a <strong>SOLD OUT</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Photography, Editorial badge, Display order */}
        <div className="lg:col-span-5 space-y-6">
          {/* Photo Management Card (Section 19: Fotografie) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-3">
            <h3 className="font-display font-bold text-base text-[#1C211E] border-b border-[#F0EBE1] pb-2">
              Fotografia del Prodotto *
            </h3>
            <ImageUploader
              value={imageUrl}
              onChange={(url) => {
                setImageUrl(url);
                if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
              }}
              aspectRatio="4/3"
            />
            {errors.imageUrl && (
              <p className="text-[11px] text-red-600 font-medium">{errors.imageUrl}</p>
            )}
          </div>

          {/* Badges and Sorting */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h3 className="font-display font-bold text-base text-[#1C211E] border-b border-[#F0EBE1] pb-2">
              Impostazioni Vetrina
            </h3>

            {/* Editorial Badge */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                Badge Speciale
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
              >
                {BADGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Order */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                Ordine di Visualizzazione (0 = primo)
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D8C3A5] text-sm font-mono bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
              />
            </div>

            {/* Featured toggle */}
            <div className="pt-2 border-t border-[#F0EBE1] space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1B3B2B] focus:ring-[#1B3B2B]"
                />
                <span className="text-xs sm:text-sm font-semibold text-[#1C211E]">
                  Mostra tra le "Specialità in evidenza" in Homepage
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1B3B2B] focus:ring-[#1B3B2B]"
                />
                <span className="text-xs sm:text-sm font-semibold text-[#1C211E]">
                  Visibile nel catalogo
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
