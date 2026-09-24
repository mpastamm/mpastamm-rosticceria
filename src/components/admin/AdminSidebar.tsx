import React from 'react';
import {
  LayoutDashboard,
  Zap,
  ShoppingBag,
  UtensilsCrossed,
  FolderTree,
  Clock,
  Settings,
  LogOut,
  ExternalLink,
  Store,
} from 'lucide-react';

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  pendingOrdersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  pendingOrdersCount = 0,
}) => {
  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Vetrina Rapida', path: '/admin/vetrina', icon: Zap, badge: 'Flash' },
    {
      label: 'Ordini Ricevuti',
      path: '/admin/ordini',
      icon: ShoppingBag,
      count: pendingOrdersCount,
    },
    { label: 'Gestione Prodotti', path: '/admin/prodotti', icon: UtensilsCrossed },
    { label: 'Categorie', path: '/admin/categorie', icon: FolderTree },
    { label: 'Orari & Ritiro', path: '/admin/orari', icon: Clock },
    { label: 'Impostazioni Locale', path: '/admin/impostazioni', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#182E22] text-[#E8DFD1] min-h-screen border-r border-[#244534] p-5 shrink-0">
      {/* Brand Header */}
      <div className="pb-6 mb-6 border-b border-[#244534]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2D533E] flex items-center justify-center text-white font-bold font-display text-xl shadow-xs">
            'M
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[#FAF7F2] leading-tight">
              'Mpastamm
            </h1>
            <p className="text-[11px] uppercase tracking-wider text-[#9CAF88] font-semibold">
              Pannello Gestione
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#28553E] text-white shadow-xs font-semibold'
                  : 'text-[#C2B7A3] hover:bg-[#203D2E] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#8A9A86]'}`} />
                <span>{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold font-mono bg-red-600 text-white rounded-full">
                  {item.count}
                </span>
              )}

              {item.badge && !item.count && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-[#244534] space-y-2">
        <button
          onClick={() => onNavigate('/')}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-[#C2B7A3] hover:text-white rounded-lg hover:bg-[#203D2E] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Apri Vetrina Pubblica</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-300 hover:text-red-100 rounded-lg hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnetti</span>
        </button>
      </div>
    </aside>
  );
};
