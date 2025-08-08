import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Eye, Heart } from 'lucide-react';

type ConversationMode = 'venting' | 'perspective' | 'general';

interface ConversationModeSelectorProps {
  currentMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  className?: string;
}

export const ConversationModeSelector: React.FC<ConversationModeSelectorProps> = ({
  currentMode,
  onModeChange,
  className = ''
}) => {
  const modes: { id: ConversationMode; label: string; icon: typeof MessageCircle; description: string }[] = [
    {
      id: 'venting',
      label: 'Just Venting',
      icon: MessageCircle,
      description: 'I\'ll just listen and validate'
    },
    {
      id: 'perspective',
      label: 'Need Perspective',
      icon: Eye,
      description: 'I\'ll share gentle viewpoints'
    },
    {
      id: 'general',
      label: 'General Chat',
      icon: Heart,
      description: 'Balanced listening & advice'
    }
  ];

  return (
    <div className={`flex space-x-2 ${className}`}>
      {modes.map(mode => {
        const isActive = currentMode === mode.id;
        
        return (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex-1 p-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg' 
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/80'
              }
              border border-white/20 dark:border-gray-700/20
              backdrop-blur-sm
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <mode.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
              <div className="text-sm font-medium">{mode.label}</div>
              <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                {mode.description}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
