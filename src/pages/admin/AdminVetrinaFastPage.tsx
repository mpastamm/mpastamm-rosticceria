import React, { useState } from 'react';
import { Search, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product, Category, AvailabilityStatus } from '../../types';
import { ProductAdminCard } from '../../components/admin/ProductAdminCard';

interface AdminVetrinaFastPageProps {
  products: Product[];
  categories: Category[];
  onUpdateProductStatus: (productId: string, status: AvailabilityStatus) => void;
  onEditProduct: (product: Product) => void;
}

export const AdminVetrinaFastPage: React.FC<AdminVetrinaFastPageProps> = ({
  products,
  categories,
  onUpdateProductStatus,
  onEditProduct,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<{ name: string; status: AvailabilityStatus } | null>(null);

  const getCategoryName = (catId: string) => {
    return categories.find((c) => c.id === catId)?.name || '';
  };

  const handleStatusChange = (product: Product, status: AvailabilityStatus) => {
    onUpdateProductStatus(product.id, status);
    setLastUpdated({ name: product.name, status });
    setTimeout(() => {
      setLastUpdated(null);
    }, 2500);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCatId !== 'all' && p.category_id !== selectedCatId) return false;
    if (!query.trim()) return true;
    return p.name.toLowerCase().includes(query.toLowerCase().trim());
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>Controllo Rapido Disponibilità Banco</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E] mt-0.5">
            Vetrina Rapida da Banco
          </h2>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Tocca i pulsanti colorati per cambiare all'istante lo stato visualizzato dai clienti sul sito.
          </p>
        </div>

        {/* Live Feedback Toast Notification */}
        {lastUpdated && (
          <div className="bg-[#182E22] text-[#FAF7F2] px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fadeIn border border-[#2D533E]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>{lastUpdated.name}</strong> impostato su{' '}
              <strong className="uppercase">{lastUpdated.status.replace('_', ' ')}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtra per nome prodotto..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] rounded-xl border border-[#E8DFD1] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
          />
        </div>

        {/* Category chip selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap min-h-[36px] transition-colors ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap min-h-[36px] transition-colors ${
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

      {/* Products Admin Cards Grid (Section 16: large fast-touch buttons) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => (
          <ProductAdminCard
            key={prod.id}
            product={prod}
            categoryName={getCategoryName(prod.category_id)}
            onStatusChange={(status) => handleStatusChange(prod, status)}
            onEdit={() => onEditProduct(prod)}
          />
        ))}
      </div>
    </div>
  );
};
