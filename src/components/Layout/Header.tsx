import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Heart, Menu } from 'lucide-react';
import { Button } from '../UI/Button';
import { useSettingsStore } from '../../stores/settingsStore';

interface HeaderProps {
  onSettingsClick: () => void;
  onMenuClick: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSettingsClick, 
  onMenuClick, 
  showMenuButton = false 
}) => {
  const { settings } = useSettingsStore();
  const aiName = settings?.preferences.aiName || 'Riley';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20 px-4 py-3 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">LoveLogic</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Your Relationship Counselor</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="p-2"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </motion.header>
  );
};