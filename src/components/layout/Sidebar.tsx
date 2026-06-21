import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, FolderTree, History, Users, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'articles', label: 'Catálogo de Artículos', icon: Package },
    { id: 'categories', label: 'Gestión de Categorías', icon: FolderTree },
    { id: 'audit', label: 'Historial de Auditoría', icon: History },
    ...(isAdmin ? [{ id: 'users', label: 'Administrar Usuarios (10)', icon: Users }] : []),
    { id: 'security', label: 'Seguridad & StaticCrypt', icon: ShieldAlert }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-neutral-200 text-neutral-700 flex flex-col justify-between shrink-0 shadow-sm">
      <div className="p-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-3">
          Navegación
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                    : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500 space-y-2">
        <div className="flex items-center justify-between">
          <span>Plan Base:</span>
          <span className="font-semibold text-primary-600">Spark (Gratis)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Lecturas / día:</span>
          <span className="font-semibold text-emerald-600">&lt; 50k max</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Protección HTML:</span>
          <span className="font-semibold text-primary-600">StaticCrypt</span>
        </div>
      </div>
    </aside>
  );
};