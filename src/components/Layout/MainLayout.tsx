import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Header } from './Header';
import { ThreadList } from '../Sidebar/ThreadList';
import { ChatInterface } from '../Chat/ChatInterface';
import { SettingsModal } from '../Settings/SettingsModal';
import { ApiKeySetup } from '../Settings/ApiKeySetup';

export const MainLayout: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const hasApiKeys = settings?.apiKeys?.length > 0;
  const needsSetup = !hasApiKeys;
  const aiName = settings?.preferences.aiName || 'Riley';

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to LoveLogic</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Your compassionate AI relationship counselor. Let's get you set up.
            </p>
          </div>

          <ApiKeySetup />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex flex-col overflow-hidden">
      <Header
        onSettingsClick={() => setShowSettings(true)}
        onMenuClick={() => setShowSidebar(true)}
        showMenuButton={true}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 flex-shrink-0">
          <ThreadList />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setShowSidebar(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-80 z-50 md:hidden"
              >
                <ThreadList />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};