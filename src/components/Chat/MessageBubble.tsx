import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Message } from '../../types/message';
import { format } from 'date-fns';
import { useSettingsStore } from '../../stores/settingsStore';

interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showTimestamp = false
}) => {
  const [copied, setCopied] = useState(false);
  const { settings } = useSettingsStore();
  const isUser = message.sender === 'user';
  const aiName = settings?.preferences.aiName || 'Riley';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            group relative px-4 py-3 rounded-2xl shadow-sm
            backdrop-blur-sm border border-white/20 dark:border-gray-700/20
            ${isUser 
              ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white ml-auto' 
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200'
            }
          `}
        >
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, index) => (
              <p key={index} className={`${index === 0 ? 'mt-0' : ''} ${isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                {line}
              </p>
            ))}
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`
              absolute top-2 right-2 opacity-0 group-hover:opacity-100
              transition-opacity duration-200 p-1 rounded-md
              ${isUser ? 'hover:bg-white/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            `}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {format(message.timestamp, 'MMM d, h:mm a')}
          </div>
        )}

        {/* Status indicator for user messages */}
        {isUser && message.status && (
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 text-right`}>
            {message.status === 'sending' && 'Sending...'}
            {message.status === 'sent' && 'Sent'}
            {message.status === 'failed' && 'Failed to send'}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className={`${isUser ? 'order-1 mr-3' : 'order-2 ml-3'} flex-shrink-0`}>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          ${isUser 
            ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white' 
            : 'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
          }
        `}>
          {isUser ? 'Y' : aiName.charAt(0).toUpperCase()}
        </div>
      </div>
    </motion.div>
  );
};