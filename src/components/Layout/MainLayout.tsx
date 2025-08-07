import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, ChevronLeft } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Header } from './Header';
import { ThreadList } from '../Sidebar/ThreadList';
import { ChatInterface } from '../Chat/ChatInterface';
import { SettingsModal } from '../Settings/SettingsModal';
import { ApiKeySetup } from '../Settings/ApiKeySetup';

export const MainLayout: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const hasApiKeys = (settings?.apiKeys?.length ?? 0) > 0;
  const needsSetup = !hasApiKeys;

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
        <motion.div
          initial={false}
          animate={{
            width: sidebarCollapsed ? 60 : 320,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="hidden md:block relative flex-shrink-0 border-r border-white/20 dark:border-gray-700/20"
        >
          <ThreadList isCollapsed={sidebarCollapsed} />

          {/* Sidebar edge toggle handle (desktop only) */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex items-center justify-center absolute top-1/2 -right-3 -translate-y-1/2 w-7 h-12 rounded-md shadow-md bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/40 hover:bg-white dark:hover:bg-gray-800 transition-colors z-20"
          >
            {sidebarCollapsed ? (
              <Menu className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </motion.div>

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
                <ThreadList onClose={() => setShowSidebar(false)} />
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