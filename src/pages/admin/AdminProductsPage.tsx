import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Product, Category } from '../../types';
import { AvailabilityBadge } from '../../components/AvailabilityBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface AdminProductsPageProps {
  products: Product[];
  categories: Category[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleVisibility: (productId: string, visible: boolean) => void;
  onToggleFeatured: (productId: string, featured: boolean) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  products,
  categories,
  onAddNew,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const getCategoryName = (catId: string) => {
    return categories.find((c) => c.id === catId)?.name || 'Nessuna';
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCatId !== 'all' && p.category_id !== selectedCatId) return false;
    if (!searchQuery.trim()) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
            Catalogo Prodotti
          </h2>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Aggiungi, modifica prezzi, ingredienti, fotografie e visibilità delle tue preparazioni.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Prodotto</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca prodotto..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] rounded-xl border border-[#E8DFD1] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              selectedCatId === 'all'
                ? 'bg-[#1B3B2B] text-white'
                : 'bg-[#FAF7F2] text-[#425046] hover:bg-[#EAE4D7]'
            }`}
          >
            Tutti ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                selectedCatId === c.id
                  ? 'bg-[#1B3B2B] text-white'
                  : 'bg-[#FAF7F2] text-[#425046] hover:bg-[#EAE4D7]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table/List */}
      <div className="bg-white rounded-2xl border border-[#E8DFD1] shadow-xs overflow-hidden">
        <div className="divide-y divide-[#F5F2EB]">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/50 transition-colors"
            >
              {/* Image & Basic info */}
              <div className="flex items-center gap-3.5">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-[#E8DFD1]"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-sm sm:text-base text-[#1C211E]">
                      {product.name}
                    </h4>
                    {product.featured && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A8A7E] mt-0.5">
                    <span className="font-medium text-[#556B2F]">
                      {getCategoryName(product.category_id)}
                    </span>
                    <span>·</span>
                    <span className="font-mono font-bold text-[#1B3B2B]">
                      €{product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span>·</span>
                    <AvailabilityBadge status={product.availability_status} size="sm" />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Toggle Featured */}
                <button
                  type="button"
                  onClick={() => onToggleFeatured(product.id, !product.featured)}
                  className={`p-2 rounded-lg border min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors ${
                    product.featured
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'border-[#D8C3A5] text-stone-400 hover:text-amber-500'
                  }`}
                  title="Metti in evidenza in home"
                >
                  <Star className="w-4 h-4" />
                </button>

                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={() => onToggleVisibility(product.id, !product.visible)}
                  className={`p-2 rounded-lg border min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors ${
                    product.visible
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-stone-100 border-stone-300 text-stone-400'
                  }`}
                  title={product.visible ? 'Visibile ai clienti' : 'Nascosto ai clienti'}
                >
                  {product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="p-2 bg-[#FAF7F2] hover:bg-[#EAE4D7] text-[#1B3B2B] rounded-lg border border-[#D8C3A5] min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Modifica"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setProductToDelete(product)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Elimina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Eliminare questo prodotto?"
        message={`Sei sicuro di voler eliminare definitivamente "${productToDelete?.name}" dal catalogo? Questa operazione non può essere annullata.`}
        confirmText="Elimina prodotto"
        isDestructive
        onConfirm={() => {
          if (productToDelete) {
            onDelete(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
