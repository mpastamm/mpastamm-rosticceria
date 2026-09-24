import React, { useState } from 'react';
import {
  LayoutDashboard,
  Zap,
  ShoppingBag,
  UtensilsCrossed,
  MoreHorizontal,
  FolderTree,
  Clock,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface AdminMobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  pendingOrdersCount?: number;
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  pendingOrdersCount = 0,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const mainTabs = [
    { label: 'Dash', path: '/admin', icon: LayoutDashboard },
    { label: 'Vetrina', path: '/admin/vetrina', icon: Zap },
    { label: 'Ordini', path: '/admin/ordini', icon: ShoppingBag, count: pendingOrdersCount },
    { label: 'Prodotti', path: '/admin/prodotti', icon: UtensilsCrossed },
  ];

  const handleNavigate = (path: string) => {
    setMoreMenuOpen(false);
    onNavigate(path);
  };

  return (
    <>
      {/* "Altro" Drawer Sheet */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="fixed inset-0" onClick={() => setMoreMenuOpen(false)} />
          <div className="relative z-50 bg-[#182E22] text-[#FAF7F2] rounded-t-3xl p-5 space-y-3 shadow-2xl border-t border-[#244534]">
            <div className="w-12 h-1 bg-[#2E553E] rounded-full mx-auto mb-2" />
            <h4 className="text-xs uppercase tracking-wider text-[#9CAF88] font-bold px-2">
              Gestione Avanzata
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavigate('/admin/categorie')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#203D2E] text-sm text-left font-medium"
              >
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>Categorie</span>
              </button>

              <button
                onClick={() => handleNavigate('/admin/orari')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#203D2E] text-sm text-left font-medium"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Orari & Slot</span>
              </button>

              <button
                onClick={() => handleNavigate('/admin/impostazioni')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#203D2E] text-sm text-left font-medium"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Impostazioni</span>
              </button>

              <button
                onClick={() => handleNavigate('/')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#203D2E] text-sm text-left font-medium"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Vetrina Sito</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#244534]">
              <button
                onClick={() => {
                  setMoreMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-3 px-4 rounded-xl bg-red-900/40 text-red-300 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnetti</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Fixed Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#182E22] text-[#E8DFD1] border-t border-[#244534] pb-safe shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path;

            return (
              <button
                key={tab.path}
                onClick={() => handleNavigate(tab.path)}
                className={`flex flex-col items-center justify-center relative min-h-[44px] transition-colors ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-[#A8B8A6] hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
              </button>
            );
          })}

          {/* More menu trigger */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              moreMenuOpen ? 'text-emerald-400 font-bold' : 'text-[#A8B8A6] hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Altro</span>
          </button>
        </div>
      </div>
    </>
  );
};
