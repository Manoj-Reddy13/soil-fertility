import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Sparkles,
  PieChart,
  Sprout,
  ShieldCheck,
  History,
  BrainCircuit,
  Home,
  ChevronRight,
  Leaf
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/analyze', label: 'Soil Analysis & Prediction', icon: FlaskConical },
  { path: '/analytics', label: 'Nutrient Analytics', icon: PieChart },
  { path: '/crops', label: 'Crop Recommendations', icon: Sprout },
  { path: '/improvement', label: 'Soil Improvement', icon: ShieldCheck },
  { path: '/history', label: 'Historical Reports', icon: History },
  { path: '/model-insights', label: 'Model Insights', icon: BrainCircuit },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-[#082f1b] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center gap-3 border-b border-emerald-900/50 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-950/40">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
              <span className="text-xl">SoilSense</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                AI
              </span>
            </div>
            <p className="text-xs text-emerald-300/60">Precision Soil Intelligence</p>
          </div>
        </div>

        {/* Quick Nav Home */}
        <div className="px-4 pt-5 pb-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-900/60 text-emerald-200'
                  : 'text-emerald-300/70 hover:bg-emerald-900/30 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Home className="h-4 w-4" />
              <span>Marketing Landing Page</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </NavLink>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-emerald-400/50 uppercase">
            Platform Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/30'
                      : 'text-emerald-100/75 hover:bg-emerald-900/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4.5 w-4.5 transition-transform duration-150 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-emerald-300/70'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Model Status Card */}
        <div className="p-4">
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-300/80">Active Model</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Online
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-white">Random Forest (300 trees)</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-300/70">
              <span>Test Accuracy</span>
              <span className="font-semibold text-emerald-300">97.29%</span>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-emerald-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700/80 font-semibold text-white text-xs border border-emerald-500/30">
              AG
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">Agricultural Lead</p>
              <p className="truncate text-[10px] text-emerald-300/60">agronomist@soilsense.ai</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

