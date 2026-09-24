import React, { useState, useMemo } from 'react';
import { Search, X, AlertTriangle, Sparkles, Filter, Store } from 'lucide-react';
import { Product, Category, BusinessSettings } from '../types';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';

interface VetrinaPageProps {
  products: Product[];
  categories: Category[];
  settings: BusinessSettings;
  onOpenProductModal: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  recentAddedId: string | null;
}

export const VetrinaPage: React.FC<VetrinaPageProps> = ({
  products,
  categories,
  settings,
  onOpenProductModal,
  onQuickAdd,
  recentAddedId,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Counts per category (only visible products)
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products
      .filter((p) => p.visible)
      .forEach((p) => {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });
    return counts;
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.visible) // Ignore hidden products for public showcase
      .filter((p) => {
        if (selectedCategoryId === 'all') return true;
        return p.category_id === selectedCategoryId;
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const inName = p.name.toLowerCase().includes(q);
        const inDesc = (p.description || '').toLowerCase().includes(q);
        const inIngr = (p.ingredients || '').toLowerCase().includes(q);
        return inName || inDesc || inIngr;
      })
      .sort((a, b) => a.display_order - b.display_order);
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8DFD1] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#556B2F] uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>Banco Rosticceria & Forno Live</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1C211E]">
            La nostra Vetrina
          </h1>
          <p className="text-xs sm:text-sm text-[#55645A] mt-1">
            Visualizza la disponibilità aggiornata in tempo reale e componi la tua ordinazione.
          </p>
        </div>

        {/* Global Orders Closed Banner */}
        {!settings.orders_enabled && (
          <div className="bg-amber-100/80 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{settings.orders_disabled_message}</span>
          </div>
        )}
      </div>

      {/* SEARCH AND CATEGORY FILTER TOOLBAR */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-xs">
        {/* Search input (Section 24: checks name, description, ingredients) */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8A7E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per nome o ingrediente (es. arancino, hamburger, mortadella, crudo)..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] rounded-xl border border-[#E8DFD1] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] focus:border-transparent text-[#1C211E] placeholder:text-[#8C9A8E]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
              aria-label="Cancella ricerca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Chips */}
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          productCounts={productCounts}
        />
      </div>

      {/* Active Search/Filter Indicator */}
      {(searchQuery || selectedCategoryId !== 'all') && (
        <div className="flex items-center justify-between text-xs text-[#55645A] px-1">
          <span>
            Risultati trovati:{' '}
            <strong className="text-[#1B3B2B] font-mono">{filteredProducts.length}</strong>
            {searchQuery && (
              <span>
                {' '}
                per "<strong>{searchQuery}</strong>"
              </span>
            )}
          </span>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId('all');
            }}
            className="text-[#1B3B2B] font-semibold hover:underline"
          >
            Reimposta filtri
          </button>
        </div>
      )}

      {/* PRODUCTS SHOWCASE GRID */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E8DFD1] space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-[#7A8A7E] mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#1C211E]">
            Nessun prodotto trovato
          </h3>
          <p className="text-xs sm:text-sm text-[#55645A] max-w-sm mx-auto">
            Nessun prodotto corrisponde ai criteri di ricerca. Prova a cercare un altro ingrediente o seleziona un'altra categoria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId('all');
            }}
            className="px-4 py-2 bg-[#1B3B2B] text-white text-xs font-semibold rounded-xl"
          >
            Mostra tutti i prodotti
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductModal}
              onQuickAdd={onQuickAdd}
              isAddedRecently={recentAddedId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
