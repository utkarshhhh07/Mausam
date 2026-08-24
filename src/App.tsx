import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { AppLayout } from "@/layouts/AppLayout";
import { OnboardingLayout } from "@/layouts/OnboardingLayout";
import { SplashPage } from "@/pages/SplashPage";
import { WelcomePage } from "@/pages/WelcomePage";
import { LocationSelectPage } from "@/pages/LocationSelectPage";
import { PersonaSelectPage } from "@/pages/PersonaSelectPage";
import { PreferencesPage } from "@/pages/PreferencesPage";
import { HealthPreferencesPage } from "@/pages/HealthPreferencesPage";
import { HomePage } from "@/pages/HomePage";
import { ForecastPage } from "@/pages/ForecastPage";
import { AlertsPage } from "@/pages/AlertsPage";
import { SavedPage } from "@/pages/SavedPage";
import { MyDayPage } from "@/pages/MyDayPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { useEffect, useState } from "react";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SplashGate() {
  const { onboarded } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashPage />;

  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/onboarding" element={<OnboardingLayout />}>
        <Route path="location" element={<LocationSelectPage />} />
        <Route path="persona" element={<PersonaSelectPage />} />
        <Route path="health" element={<HealthPreferencesPage />} />
        <Route path="preferences" element={<PreferencesPage />} />
      </Route>
      <Route
        path="/*"
        element={
          onboarded ? (
            <AppLayout />
          ) : (
            <Navigate to="/welcome" replace />
          )
        }
      >
        <Route index element={<HomePage />} />
        <Route path="forecast" element={<ForecastPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="myday" element={<MyDayPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <SplashGate />
      </HashRouter>
    </AppProvider>
  );
}
