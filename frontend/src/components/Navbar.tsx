import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Bell, Search, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  title = 'Platform Dashboard',
  subtitle = 'Soil Intelligence & Crop Fertility Decision System',
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend health status badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 md:flex">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>ML Engine Ready</span>
        </div>

        {/* Notification bell */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate('/analyze')}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-900/10 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Soil Analysis</span>
          <span className="sm:hidden">Analyze</span>
        </button>
      </div>
    </header>
  );
};

