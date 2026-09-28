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

  // Every visible category becomes a uniform showcase card. This keeps newly
  // created cards from the admin area visible on the public vetrina.
  const showcaseCategories = categories
    .filter((category) => category.visible)
    .sort((a, b) => a.display_order - b.display_order);

  const getCategoryProducts = (categoryId: string) =>
    products.filter((product) => product.category_id === categoryId && product.visible);

  const getCategoryImage = (category: Category) => {
    if (category.image_url) return category.image_url;
    if (category.slug === 'saltimbocca') return ASSET_IMAGES.saltimbocca;
    if (category.slug === 'bun') return ASSET_IMAGES.bun;
    if (category.slug === 'rutiello-2-0' || category.slug === 'rutiello') return ASSET_IMAGES.rutiello;
    if (category.slug === 'padellino') return ASSET_IMAGES.padellino;
    if (category.slug === 'friggitoria') return ASSET_IMAGES.friggitoria;
    return ASSET_IMAGES.hero;
  };

  const getCategoryIcon = (category: Category) => {
    if (category.slug === 'bun') {
      return (
        <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 11a8 8 0 0 1 16 0H4Zm0 4h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm0-1h16" />
        </svg>
      );
    }
    if (category.slug === 'friggitoria') {
      return (
        <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V5m4 5V3m4 7V4m4 6V5M4 10h16l-2 10H6L4 10Z" />
        </svg>
      );
    }
    if (category.slug === 'padellino') {
      return (
        <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <ellipse cx="12" cy="13" rx="8" ry="5" />
          <path strokeLinecap="round" d="M4 13V8a2 2 0 0 1 2-2h2" />
        </svg>
      );
    }
    if (category.slug === 'rutiello-2-0' || category.slug === 'rutiello') {
      return (
        <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 stroke-[1.75]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3V8Zm0 8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-2H3v2Zm0-4h18" />
      </svg>
    );
  };
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
          <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-6">
            {showcaseCategories.map((category, index) => {
              const isFiveCardLayout = showcaseCategories.length === 5;
              const placementClass = isFiveCardLayout && index === 3
                ? 'lg:col-start-2'
                : isFiveCardLayout && index === 4
                  ? 'lg:col-start-4'
                  : '';

              return (
                <div key={category.id} className={`flex min-w-0 flex-col lg:col-span-2 ${placementClass}`}>
                  <CategoryShowcaseModule
                    category={category}
                    title={category.name}
                    subtitle={category.description || 'Scopri le nostre specialità.'}
                    heroImage={getCategoryImage(category)}
                    icon={getCategoryIcon(category)}
                    products={getCategoryProducts(category.id)}
                    onOpenProductModal={onOpenProductModal}
                    onQuickAdd={onQuickAdd}
                    onExploreCategory={() => setSelectedCategoryId(category.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
