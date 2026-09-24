import React, { useState } from 'react';
import { LayoutGrid, Utensils } from 'lucide-react';
import { Product, Category, BusinessSettings } from '../types';
import { ASSET_IMAGES } from '../services/imageMap';
import { CategoryFilter } from '../components/CategoryFilter';
import { CategoryShowcaseModule } from '../components/CategoryShowcaseModule';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
  onOpenProductModal: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  recentAddedId: string | null;
  searchQuery?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  settings,
  onNavigate,
  onOpenProductModal,
  onQuickAdd,
  recentAddedId,
  searchQuery = '',
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Filter products by search if query is active
  const filteredProducts = products.filter((p) => {
    if (!p.visible) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchIngr = p.ingredients?.toLowerCase().includes(q);
      return matchName || matchDesc || matchIngr;
    }
    if (selectedCategoryId !== 'all') {
      return p.category_id === selectedCategoryId;
    }
    return true;
  });

  // Group products for the 5 showcase categories
  const saltimboccaCategory = categories.find((c) => c.slug === 'saltimbocca') || {
    id: 'cat_saltimbocca',
    name: 'Saltimbocca',
    slug: 'saltimbocca',
    display_order: 1,
    visible: true,
  };

  const bunCategory = categories.find((c) => c.slug === 'bun') || {
    id: 'cat_bun',
    name: 'Bun',
    slug: 'bun',
    display_order: 2,
    visible: true,
  };

  const rutielloCategory = categories.find((c) => c.slug === 'rutiello-2-0' || c.slug === 'rutiello') || {
    id: 'cat_rutiello',
    name: 'Rutiello 2.0',
    slug: 'rutiello-2-0',
    display_order: 3,
    visible: true,
  };

  const padellinoCategory = categories.find((c) => c.slug === 'padellino') || {
    id: 'cat_padellino',
    name: 'Padellino',
    slug: 'padellino',
    display_order: 4,
    visible: true,
  };

  const friggitoriaCategory = categories.find((c) => c.slug === 'friggitoria') || {
    id: 'cat_friggitoria',
    name: 'Friggitoria',
    slug: 'friggitoria',
    display_order: 5,
    visible: true,
  };

  const saltimboccaProducts = products.filter((p) => p.category_id === saltimboccaCategory.id && p.visible);
  const bunProducts = products.filter((p) => p.category_id === bunCategory.id && p.visible);
  const rutielloProducts = products.filter((p) => p.category_id === rutielloCategory.id && p.visible);
  const padellinoProducts = products.filter((p) => p.category_id === padellinoCategory.id && p.visible);
  const friggitoriaProducts = products.filter((p) => p.category_id === friggitoriaCategory.id && p.visible);
  const heroImage = settings.hero_image_url || ASSET_IMAGES.hero;
  const heroTitle = settings.hero_title || 'La Vetrina';
  const heroDescription =
    settings.hero_description ||
    'I nostri lievitati, la tradizione e il gusto di sempre, ogni giorno per te.';

  return (
    <div className="bg-[#ECE6DB] min-h-screen text-[#1C211E] pb-16 selection:bg-[#16251A] selection:text-white">
      {/* 1. HERO SECTION (EXACT MATCH TO UPLOADED IMAGE) */}
      <section className="relative w-full overflow-hidden bg-[#D8D0C3] border-b border-[#CFC5B6]">
        {/* Background Interior Photography of 'Mpastamm */}
        <div className="mpastamm-hero relative flex items-center">
          {/* Panoramic Venue Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt={settings.hero_image_alt || 'Mpastamm Rosticceria Interno e Vetrina'}
              className="w-full h-full object-cover object-[center_18%] brightness-[0.98] contrast-[1.02]"
            />
            {/* Subtle soft gradient overlay to ensure text contrast while retaining full venue look */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F2ECE1]/98 via-[#F2ECE1]/83 from-0% via-[35%] to-transparent lg:w-[62%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 max-w-[1320px] mx-auto w-full px-5 sm:px-10 lg:px-8 py-8 sm:py-10 lg:py-4 flex items-center justify-between">
            {/* Left Typography Block */}
            <div className="max-w-lg space-y-2 sm:space-y-3">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.05rem] font-bold tracking-[-0.045em] text-[#16251A] leading-[0.98]">
                {heroTitle}
              </h1>

              <p className="text-base sm:text-lg lg:text-[1.05rem] text-[#2C2720] font-normal leading-snug max-w-[520px]">
                {heroDescription}
              </p>

              {/* Warm Golden/Caramel Brush Underline Accent matching screenshot */}
              <div className="pt-0.5">
                <svg
                  className="w-28 sm:w-36 h-3 text-[#B88746]"
                  viewBox="0 0 140 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 7C28 2.5 75 2 137 7"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORIES FILTER BAR (FLOATING OVER THE VETRINA SHOWCASE) */}
      <section className="sticky top-16 z-20 bg-[#ECE6DB]/96 backdrop-blur-md py-2.5 sm:py-3 border-b border-[#D8CFBF] shadow-[0_2px_8px_rgba(77,62,42,0.05)]">
        <div className="w-full px-4 sm:px-8">
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(catId) => setSelectedCategoryId(catId)}
          />
        </div>
      </section>

      {/* 3. SHOWCASE CONTENT: THE VETRINA MODULES (EXACT SCREENSHOT LAYOUT) */}
      <main className="w-full px-4 sm:px-8 pt-3 sm:pt-4">
        {/* If search query is active or a single category is selected (not "all") */}
        {searchQuery.trim() || selectedCategoryId !== 'all' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D5CABB] pb-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#16251A]">
                {searchQuery.trim()
                  ? `Risultati per "${searchQuery}" (${filteredProducts.length})`
                  : categories.find((c) => c.id === selectedCategoryId)?.name || 'Vetrina'}
              </h2>

              <button
                onClick={() => setSelectedCategoryId('all')}
                className="text-xs font-bold text-[#16251A] hover:underline"
              >
                Mostra tutte le categorie
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#FAF7F2] rounded-3xl border border-[#D5CABB]">
                <p className="text-[#5B5044] text-sm">
                  Nessun prodotto trovato. Prova con un altro termine o seleziona un'altra categoria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
        ) : (
          /* DEFAULT: FIVE UNIFORM CATEGORY BOARDS */
          <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-6">
              {/* 1. SALTIMBOCCA */}
              <div className="flex min-w-0 flex-col lg:col-span-2">
              <CategoryShowcaseModule
                category={saltimboccaCategory}
                title={saltimboccaCategory.name}
                subtitle={saltimboccaCategory.description || "L'arte del gusto in un morso."}
                heroImage={saltimboccaCategory.image_url || ASSET_IMAGES.saltimbocca}
                icon={
                  <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3V8Zm0 8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-2H3v2Zm0-4h18" />
                  </svg>
                }
                products={saltimboccaProducts}
                onOpenProductModal={onOpenProductModal}
                onQuickAdd={onQuickAdd}
                onExploreCategory={() => setSelectedCategoryId(saltimboccaCategory.id)}
              />
              </div>

              {/* 2. BUN */}
              <div className="flex min-w-0 flex-col lg:col-span-2">
              <CategoryShowcaseModule
                category={bunCategory}
                title={bunCategory.name}
                subtitle={bunCategory.description || 'Soffice, fragrante, ineguagliabile.'}
                heroImage={bunCategory.image_url || ASSET_IMAGES.bun}
                icon={
                  <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 11a8 8 0 0 1 16 0H4Zm0 4h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm0-1h16" />
                  </svg>
                }
                products={bunProducts}
                onOpenProductModal={onOpenProductModal}
                onQuickAdd={onQuickAdd}
                onExploreCategory={() => setSelectedCategoryId(bunCategory.id)}
              />
              </div>

              {/* 3. RUTIELLO 2.0 */}
              <div className="flex min-w-0 flex-col lg:col-span-2">
              <CategoryShowcaseModule
                category={rutielloCategory}
                title={rutielloCategory.name}
                subtitle={rutielloCategory.description || 'La tradizione si rinnova.'}
                heroImage={rutielloCategory.image_url || ASSET_IMAGES.rutiello}
                icon={
                  <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                }
                products={rutielloProducts}
                onOpenProductModal={onOpenProductModal}
                onQuickAdd={onQuickAdd}
                onExploreCategory={() => setSelectedCategoryId(rutielloCategory.id)}
              />
              </div>

              {/* 4. PADELLINO: same board width as the first row, centered */}
              <div className="flex min-w-0 flex-col lg:col-span-2 lg:col-start-2">
                <CategoryShowcaseModule
                  category={padellinoCategory}
                  title={padellinoCategory.name}
                  subtitle={padellinoCategory.description || 'Tutta la bontà della rosticceria.'}
                  heroImage={padellinoCategory.image_url || ASSET_IMAGES.padellino}
                  icon={
                    <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <ellipse cx="12" cy="13" rx="8" ry="5" />
                      <path strokeLinecap="round" d="M4 13V8a2 2 0 0 1 2-2h2" />
                    </svg>
                  }
                  products={padellinoProducts}
                  onOpenProductModal={onOpenProductModal}
                  onQuickAdd={onQuickAdd}
                  onExploreCategory={() => setSelectedCategoryId(padellinoCategory.id)}
                />
              </div>

              {/* 5. FRIGGITORIA: same board width as the first row, centered */}
              <div className="flex min-w-0 flex-col lg:col-span-2 lg:col-start-4">
                <CategoryShowcaseModule
                  category={friggitoriaCategory}
                  title={friggitoriaCategory.name}
                  subtitle={friggitoriaCategory.description || 'Croccante fuori, irresistibile dentro.'}
                  heroImage={friggitoriaCategory.image_url || ASSET_IMAGES.friggitoria}
                  icon={
                    <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V5m4 5V3m4 7V4m4 6V5M4 10h16l-2 10H6L4 10Z" />
                    </svg>
                  }
                  products={friggitoriaProducts}
                  onOpenProductModal={onOpenProductModal}
                  onQuickAdd={onQuickAdd}
                  onExploreCategory={() => setSelectedCategoryId(friggitoriaCategory.id)}
                />
              </div>
          </div>
        )}
      </main>
    </div>
  );
};
