import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Precision Soil Dashboard',
    subtitle: 'Real-time overview of soil health KPIs, fertility classes, and nutrient distributions',
  },
  '/analyze': {
    title: 'Soil Nutrient Analysis & Prediction',
    subtitle: 'Input 12 elemental soil readings to execute live Random Forest ML fertility inference',
  },
  '/analytics': {
    title: 'Elemental Nutrient Analytics',
    subtitle: 'Multivariate radar profiles, agronomic benchmark comparisons, and deficiency ratios',
  },
  '/crops': {
    title: 'Crop Suitability Recommendations',
    subtitle: 'Agronomic rule-based matching engine pairing soil pH, EC, and NPK with suitable crops',
  },
  '/improvement': {
    title: 'Soil Remediation & Health Guide',
    subtitle: 'Targeted conventional and organic interventions for detected nutrient and pH limitations',
  },
  '/history': {
    title: 'Historical Soil Health Records',
    subtitle: 'Audit trail of all processed field analyses, side-by-side comparison, and batch CSV imports',
  },
  '/model-insights': {
    title: 'Machine Learning Model Transparency',
    subtitle: 'Rigorous empirical evaluation metrics, confusion matrix, and multi-model performance benchmarks',
  },
};

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentInfo = pageTitles[location.pathname] || {
    title: 'SoilSense AI Platform',
    subtitle: 'Smart Soil Intelligence & Fertility Prediction System',
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-72">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

