import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SoilAnalysisPage } from './pages/SoilAnalysisPage';
import { NutrientAnalyticsPage } from './pages/NutrientAnalyticsPage';
import { CropRecommendationsPage } from './pages/CropRecommendationsPage';
import { SoilImprovementPage } from './pages/SoilImprovementPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Platform Application Dashboard Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<SoilAnalysisPage />} />
          <Route path="/analytics" element={<NutrientAnalyticsPage />} />
          <Route path="/crops" element={<CropRecommendationsPage />} />
          <Route path="/improvement" element={<SoilImprovementPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/model-insights" element={<ModelInsightsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

