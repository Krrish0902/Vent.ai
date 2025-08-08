import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';

export const TypingIndicator: React.FC = () => {
  const { settings } = useSettingsStore();
  const aiName = settings?.preferences.aiName || 'Krrish';

  return (
    <div className="flex items-center space-x-2 p-4 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-sm max-w-xs backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
      <div className="flex items-center space-x-1">
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">{aiName} is typing</div>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-teal-500 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};