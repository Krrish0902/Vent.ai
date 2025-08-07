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
    title: 'Communication Issues',
    description: 'We struggle to understand each other',
    category: 'communication',
    prompt: "My partner and I have been having trouble communicating lately. We seem to misunderstand each other frequently and our conversations often turn into arguments. I want to improve how we talk to each other."
  },
  {
    id: '2',
    title: 'Trust and Honesty',
    description: 'Building trust in our relationship',
    category: 'trust',
    prompt: "I'm dealing with trust issues in my relationship. Something happened that shook my confidence, and I'm not sure how to rebuild that foundation of trust with my partner."
  },
  {
    id: '3',
    title: 'Intimacy Concerns',
    description: 'Reconnecting emotionally and physically',
    category: 'intimacy',
    prompt: "My partner and I have been growing apart lately. We don't feel as close as we used to, both emotionally and physically. I want to work on rebuilding our intimacy."
  },
  {
    id: '4',
    title: 'Conflict Resolution',
    description: 'Learning to fight fair and resolve disagreements',
    category: 'conflict',
    prompt: "We love each other, but we fight a lot about small things. Our arguments seem to escalate quickly and we both say things we regret. How can we handle conflicts better?"
  },
  {
    id: '5',
    title: 'General Relationship',
    description: 'Overall relationship health and happiness',
    category: 'general',
    prompt: "I want to talk about my relationship in general. Things aren't terrible, but I feel like we could be happier and more connected. I'm looking for guidance on how to strengthen our bond."
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
  const aiName = settings?.preferences.aiName || 'Riley';

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
          Hi, I'm {aiName}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-300 text-lg"
        >
          Your compassionate relationship counselor. I'm here to help you navigate relationship challenges with empathy and understanding.
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