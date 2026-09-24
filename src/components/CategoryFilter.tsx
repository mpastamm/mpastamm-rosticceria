import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  productCounts?: Record<string, number>;
}

/* Custom Line-Art Icons matching the exact screenshot */
const GridAllIcon = () => (
  <svg
    className="w-[18px] h-[18px] shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
);

const SaltimboccaIcon = () => (
  <svg
    className="w-5 h-5 shrink-0"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Top bread angled perspective */}
    <path d="M5 14L16 8L27 12L16 18L5 14Z" />
    {/* Diagonal cuts / seeds on top crust */}
    <path d="M12 12.5L14 13.5" strokeWidth="1.5" />
    <path d="M17 11.5L19 12.5" strokeWidth="1.5" />
    {/* Middle filling line opening */}
    <path d="M5 15.5L16 19.5L27 13.5" />
    {/* Bottom crust layer */}
    <path d="M5 17L5 19.5L16 23.5L27 17.5L27 15" />
  </svg>
);

const BunIcon = () => (
  <svg
    className="w-5 h-5 shrink-0"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Rounded dome top bun */}
    <path d="M6 14C6 9.5 10.5 7 16 7C21.5 7 26 9.5 26 14C26 15.2 25.2 15.5 24 15.5H8C6.8 15.5 6 15.2 6 14Z" />
    {/* Sesame seeds */}
    <circle cx="12" cy="10.5" r="0.6" fill="currentColor" />
    <circle cx="16" cy="9.5" r="0.6" fill="currentColor" />
    <circle cx="20.5" cy="11" r="0.6" fill="currentColor" />
    {/* Middle layers / wavy lettuce & melted cheese */}
    <path d="M5.5 18C7.5 16.5 9.5 18.2 11.5 17C13.5 16 15.5 18 17.5 17C19.5 16 21.5 18 23.5 17C25 16.2 26 17.2 26.5 18" />
    {/* Burger patty */}
    <rect x="6.5" y="19.5" width="19" height="2" rx="1" fill="currentColor" stroke="none" />
    {/* Bottom bun */}
    <path d="M7 23.5H25C25 26 21 27 16 27C11 27 7 26 7 23.5Z" />
  </svg>
);

const RutielloIcon = () => (
  <svg
    className="w-5 h-5 shrink-0"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Outer circle swirl */}
    <circle cx="16" cy="16" r="10" />
    {/* Inner hole */}
    <circle cx="16" cy="16" r="4.5" />
    {/* Swirl crease fold */}
    <path d="M19 12.5C17.5 14 16 14.8 16 16" />
    {/* Seed grains on crust */}
    <circle cx="10.5" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="13" cy="9.5" r="0.6" fill="currentColor" />
    <circle cx="20.5" cy="10.5" r="0.6" fill="currentColor" />
    <circle cx="22.5" cy="16" r="0.6" fill="currentColor" />
    <circle cx="19" cy="21.5" r="0.6" fill="currentColor" />
    <circle cx="12.5" cy="22" r="0.6" fill="currentColor" />
  </svg>
);

const PadellinoIcon = () => (
  <svg
    className="w-5 h-5 shrink-0"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Pan rim oval */}
    <ellipse cx="13" cy="18" rx="8" ry="2.6" />
    {/* Pan round depth */}
    <path d="M5 18C5 22.5 8.5 24 13 24C17.5 24 21 22.5 21 18" />
    {/* Stick handle on right */}
    <path d="M20.5 17.5L27 14" strokeWidth="2.2" strokeLinecap="round" />
    {/* Steam / sizzle lines above pan */}
    <path d="M9 13.5L8 11.5" />
    <path d="M13 12V9.5" />
    <path d="M17 13.5L18 11.5" />
  </svg>
);

const FriggitoriaIcon = () => (
  <svg
    className="w-5 h-5 shrink-0"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Container carton / cuoppo */}
    <path d="M8 15L10 26.5H22L24 15" />
    <path d="M7.5 15C10 16 22 16 24.5 15" />
    {/* French fries / crocchè sticks protruding from the container */}
    <path d="M11 15V8.5C11 7.8 11.6 7.2 12.3 7.2H12.7C13.4 7.2 14 7.8 14 8.5V15" />
    <path d="M14.5 15V6.5C14.5 5.8 15.1 5.2 15.8 5.2H16.2C16.9 5.2 17.5 5.8 17.5 6.5V15" />
    <path d="M18 15V9.5C18 8.8 18.6 8.2 19.3 8.2H19.7C20.4 8.2 21 8.8 21 9.5V15" />
    <path d="M8.5 15V11C8.5 10.5 9 10 9.5 10C10 10 10.5 10.5 10.5 11V15" />
    <path d="M21.5 15V11.5C21.5 11 22 10.5 22.5 10.5C23 10.5 23.5 11 23.5 11.5V15" />
  </svg>
);

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'saltimbocca':
      return <SaltimboccaIcon />;
    case 'bun':
      return <BunIcon />;
    case 'rutiello-2-0':
    case 'rutiello':
      return <RutielloIcon />;
    case 'padellino':
      return <PadellinoIcon />;
    case 'friggitoria':
      return <FriggitoriaIcon />;
    default:
      return <GridAllIcon />;
  }
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const visibleCategories = categories
    .filter((c) => c.visible)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="w-full flex items-center justify-start lg:justify-center overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
      <div className="flex items-center gap-3 sm:gap-3.5 shrink-0">
        {/* 1. "Tutte le categorie" Pill Button (Active Forest Green in Screenshot) */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`h-11 sm:h-12 px-5 sm:px-6 rounded-full text-sm sm:text-[15px] font-serif transition-all duration-200 flex items-center gap-2.5 shadow-sm whitespace-nowrap cursor-pointer select-none active:scale-98 ${
            selectedCategoryId === 'all'
              ? 'bg-[#2A3F28] text-[#F9F7F2] border border-[#223521] shadow-[0_2px_8px_rgba(35,56,33,0.22)] font-medium'
              : 'bg-[#F7F3EB] text-[#221E1A] hover:bg-[#EFE8DC] border border-[#CEBFAB] font-normal'
          }`}
        >
          <GridAllIcon />
          <span className="tracking-tight">Tutte le categorie</span>
        </button>

        {/* 2. Category Pill Buttons (Ivory with warm sand border matching screenshot) */}
        {visibleCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`h-11 sm:h-12 px-5 sm:px-6 rounded-full text-sm sm:text-[15px] font-serif transition-all duration-200 flex items-center gap-2.5 shadow-sm whitespace-nowrap cursor-pointer select-none active:scale-98 ${
                isSelected
                  ? 'bg-[#2A3F28] text-[#F9F7F2] border border-[#223521] shadow-[0_2px_8px_rgba(35,56,33,0.22)] font-medium'
                  : 'bg-[#F7F3EB] text-[#221E1A] hover:bg-[#EFE8DC] border border-[#CEBFAB] font-normal'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span className="tracking-tight">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
