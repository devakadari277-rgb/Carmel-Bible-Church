import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

// Component Guards
import { AuthGuard, AdminGuard } from './components/Guards';

// Global Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { EventsPage } from './pages/EventsPage';
import { PrayersPage } from './pages/PrayersPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { LiveStreamPage } from './pages/LiveStreamPage';
import { GalleryPage } from './pages/GalleryPage';
import { GivePage } from './pages/GivePage';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { MemberDashboard } from './pages/MemberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AccessDenied } from './pages/AccessDenied';

// Helper component to handle smooth scroll on hash transitions
const ScrollToHash: React.FC = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);

  return null;
};

// Helper component to wrap pages that require standard Navbar & Footer
const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="relative min-h-screen">
          {/* Global Fixed Background Image */}
          <div 
            className="fixed inset-0 w-full h-full z-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(5, 11, 26, 0.25) 0%, rgba(5, 11, 26, 0.55) 100%), url('/church_sanctuary_bg.png')`,
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Router>
              <ScrollToHash />
              <Routes>
                {/* Unified Login page & Error Page (no global header/footer) */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* Public Pages Layout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/prayers" element={<PrayersPage />} />
                  <Route path="/announcements" element={<AnnouncementsPage />} />
                  <Route path="/live-stream" element={<LiveStreamPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/give" element={<GivePage />} />

                  {/* Logged In Member Dashboard */}
                  <Route element={<AuthGuard />}>
                    <Route path="/dashboard" element={<MemberDashboard />} />
                  </Route>
                </Route>

                {/* Protected Admin Dashboard Layout (no public header/footer) */}
                <Route element={<AuthGuard />}>
                  <Route element={<AdminGuard />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  </Route>
                </Route>

                {/* Legacy Admin Redirect Guards */}
                <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
                <Route path="/admin/settings" element={<Navigate to="/admin-dashboard" replace />} />

                {/* Catch All Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </div>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
