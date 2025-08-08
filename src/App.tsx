import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { SettingsModal } from './components/Settings/SettingsModal';
import { useSettingsStore } from './stores/settingsStore';
import { Heart } from 'lucide-react';

function App() {
  const { loadSettings, settings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply theme to document
  useEffect(() => {
    if (settings?.preferences.theme) {
      const theme = settings.preferences.theme;
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings?.preferences.theme]);

  // Show loading state while settings are loading
  if (settings === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="text-gray-600 dark:text-gray-300">Loading Vent.ai...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <MainLayout />
      <SettingsModal />
    </BrowserRouter>
  );
}

export default App;