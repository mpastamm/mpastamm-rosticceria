import React, { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { BusinessSettings } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  settings: BusinessSettings;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  currentPath,
  onNavigate,
  settings,
  onSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const navLinks = [
    { label: 'La Vetrina', path: '/' },
    { label: 'Chi Siamo', path: '/chi-siamo' },
    { label: 'I Nostri Prodotti', path: '/vetrina' },
    { label: 'Catering', path: '/catering' },
    { label: 'Contatti', path: '/dove-siamo' },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
    if (currentPath !== '/vetrina' && currentPath !== '/') {
      onNavigate('/vetrina');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1D2B17] text-[#FAF7F2] border-b border-[#34452A] shadow-[0_3px_16px_rgba(22,37,26,0.14)]">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo matching screenshot */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('/')}
            className="flex flex-col items-start text-left focus:outline-none group"
            aria-label="Mpastamm Rosticceria"
          >
            <span className="font-script text-3xl sm:text-[2.15rem] text-[#FAF7F2] leading-none tracking-wide group-hover:text-[#D4C3A3] transition-colors">
              Mpastamm
            </span>
            <span className="text-[8.5px] tracking-[0.28em] text-[#C2B79E] uppercase font-bold pl-0.5 mt-0.5">
              ROSTICCERIA
            </span>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#D8D2C5]">
          {navLinks.map((link) => {
            const isActive =
              (link.path === '/' && (currentPath === '/' || currentPath === '/vetrina')) ||
              currentPath === link.path;

            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
              className={`transition-all py-1 relative text-[13px] tracking-wide ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#C5BFB2] hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#E8DFD1] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Search bar, User profile/Admin, Cart */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Bar matching screenshot */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative"
          >
            <Search className="w-4 h-4 text-[#8DA392] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Cerca un prodotto..."
            className="w-52 lg:w-[17rem] pl-9 pr-3.5 py-2 text-xs text-[#FAF7F2] placeholder-[#AAB5A0] bg-[#273B21]/80 hover:bg-[#2C4326] focus:bg-[#2C4326] border border-[#506046] rounded-full focus:outline-none focus:ring-1 focus:ring-[#B4C0A4] transition-all"
            />
          </form>

          {/* User / Admin Login Icon */}
          <button
            onClick={() => handleNav('/admin')}
            className="p-2 text-[#D8D2C5] hover:text-white hover:bg-[#223929] rounded-full transition-colors"
            title="Area Riservata / Amministrazione"
            aria-label="Area Riservata"
          >
            <User className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Cart Icon with Counter Badge */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-[#D8D2C5] hover:text-white hover:bg-[#223929] rounded-full transition-colors flex items-center justify-center"
            title="Carrello"
            aria-label={`Carrello (${cartCount} articoli)`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E5D8B8] text-[#16251A] text-[10.5px] font-bold flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          </button>

          {/* Mobile Hamburger Menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#D8D2C5] hover:text-white rounded-lg focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#182B1E] border-t border-[#243B2A] px-4 py-4 space-y-3 animate-fadeIn">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#8DA392] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Cerca un prodotto..."
              className="w-full pl-9 pr-3.5 py-2 text-xs text-[#FAF7F2] placeholder-[#8DA392] bg-[#223929] border border-[#2F4D37] rounded-full focus:outline-none"
            />
          </form>

          {/* Nav Links */}
          <div className="flex flex-col divide-y divide-[#233B29] pt-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className="py-2.5 text-left text-sm font-medium text-[#E5DFD4] hover:text-white flex items-center justify-between"
              >
                <span>{link.label}</span>
              </button>
            ))}

            <button
              onClick={() => handleNav('/admin')}
              className="py-2.5 text-left text-sm font-medium text-[#E5D8B8] flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Area Amministrazione</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
