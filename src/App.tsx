import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { I18nProvider } from "@/i18n";
import { Layout } from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import HomePage from "@/pages/HomePage";
import MarketPage from "@/pages/MarketPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";

function AppRoutes() {
  const { settings, updateSettings } = useApp();

  return (
    <I18nProvider
      language={settings.language}
      onLanguageChange={(lang) => updateSettings({ language: lang })}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/market/:symbol" element={<MarketPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
