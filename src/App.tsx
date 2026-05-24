/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import WhyChooseUs from './components/WhyChooseUs';
import SectionCr from './components/SectionCr';
import Process from './components/Process';
import Faq from './components/Faq';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import LayananPage from './components/LayananPage';
import AboutPage from './components/AboutPage';
import GalleryPage from './components/GalleryPage';
import TestimonialPage from './components/TestimonialPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import OverviewPage from './components/dashboard/pages/OverviewPage';
import LogsPage from './components/dashboard/pages/LogsPage';
import AnalyticsPage from './components/dashboard/pages/AnalyticsPage';
import DiagnosisPage from './components/dashboard/pages/DiagnosisPage';
import InventoryPage from './components/dashboard/pages/InventoryPage';
import SettingsPage from './components/dashboard/pages/SettingsPage';
import ShortcutsPage from './components/dashboard/pages/ShortcutsPage';
import TelegramPage from './components/dashboard/pages/TelegramPage';
import NotFoundPage from './components/NotFoundPage';


function LandingPage({ onOpenLogin }: { onOpenLogin: () => void }) {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Header onOpenLogin={onOpenLogin} />
      <main>
        <Hero onOpenLogin={onOpenLogin} />
        <About />
        <Features />
        <WhyChooseUs />
        <SectionCr />
        <Process />
        <Faq />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show login modal on dashboard routes
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage onOpenLogin={() => navigate('/login')} />} />

        {/* Public Services Page */}
        <Route path="/layanan" element={<LayananPage />} />

        {/* Dedicated Standalone Pages */}
        <Route path="/tentang-kami" element={<AboutPage />} />
        <Route path="/galeri" element={<GalleryPage />} />
        <Route path="/testimoni" element={<TestimonialPage />} />

        {/* Dedicated Premium Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Area */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="diagnosis" element={<DiagnosisPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="shortcuts" element={<ShortcutsPage />} />
          <Route path="telegram" element={<TelegramPage />} />
        </Route>

        {/* Wildcard 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

