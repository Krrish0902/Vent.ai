import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Users, Lock } from 'lucide-react';
import { ConversationStarter } from '../../types/thread';
import { useSettingsStore } from '../../stores/settingsStore';

interface ConversationStartersProps {
  onSelectStarter: (prompt: string) => void;
}

const starters: ConversationStarter[] = [
  {
    id: '1',
    title: 'Just Venting',
    description: 'I need to get something off my chest',
    category: 'general',
    prompt: 'I need to vent about something...'
  },
  {
    id: '2',
    title: 'Relationship Drama',
    description: "This situation is driving me crazy",
    category: 'conflict',
    prompt: 'My relationship is driving me crazy'
  },
  {
    id: '3',
    title: 'Reality Check',
    description: "Am I overreacting or is this fair?",
    category: 'communication',
    prompt: "I don't know if I'm overreacting, but..."
  },
  {
    id: '4',
    title: 'Need Perspective',
    description: 'Looking for a gentle outside viewpoint',
    category: 'general',
    prompt: 'Can I get your take on this situation?'
  },
  {
    id: '5',
    title: 'Reality Check 2',
    description: 'Honest thoughts, kindly delivered',
    category: 'general',
    prompt: 'I need a reality check about something'
  },
  {
    id: '6',
    title: 'Frustration',
    description: 'Someone is being really frustrating',
    category: 'conflict',
    prompt: 'This person is being so frustrating...'
  }
];

const categoryIcons = {
  communication: MessageCircle,
  trust: Lock,
  intimacy: Heart,
  conflict: Users,
  general: Heart
};

export const ConversationStarters: React.FC<ConversationStartersProps> = ({ onSelectStarter }) => {
  const { settings } = useSettingsStore();
  const aiName = settings?.preferences.aiName || 'Krrish';
  const userName = settings?.preferences.userName || '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-4"
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {userName ? `Hi ${userName}, I'm ${aiName}` : `Hi, I'm ${aiName}`}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-300 text-lg"
        >
          {userName 
            ? `Your friendly third wheel — I'm here to listen, validate, and share gentle perspective when you want it.`
            : `Your friendly third wheel — I listen first, validate always, and share gentle perspective when you want it.`
          }
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          What would you like to talk about?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {starters.map((starter, index) => {
            const Icon = categoryIcons[starter.category];
            
            return (
              <motion.div
                key={starter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectStarter(starter.prompt)}
                className="
                  p-6 rounded-2xl cursor-pointer transition-all duration-200
                  bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                  border border-white/20 dark:border-gray-700/20
                  hover:shadow-lg hover:shadow-teal-500/10
                  hover:border-teal-300 dark:hover:border-teal-600
                "
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {starter.title}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {starter.description}
                </p>
                
                <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  Start conversation →
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
