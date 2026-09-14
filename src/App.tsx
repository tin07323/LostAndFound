import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { FoundItemDetailPage } from './pages/FoundItemDetailPage';
import { LostReportsPage } from './pages/LostReportsPage';
import { LostReportDetailPage } from './pages/LostReportDetailPage';
import { CreateFoundItemPage } from './pages/CreateFoundItemPage';
import { CreateLostReportPage } from './pages/CreateLostReportPage';
import { MyClaimsPage } from './pages/MyClaimsPage';
import { MyItemsPage } from './pages/MyItemsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/found-items" element={<FoundItemsPage />} />
              <Route path="/found-items/:id" element={<FoundItemDetailPage />} />
              <Route path="/lost-reports" element={<LostReportsPage />} />
              <Route path="/lost-reports/:id" element={<LostReportDetailPage />} />
              <Route path="/create-found" element={<CreateFoundItemPage />} />
              <Route path="/create-lost" element={<CreateLostReportPage />} />
              <Route path="/claims" element={<MyClaimsPage />} />
              <Route path="/my-items" element={<MyItemsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
