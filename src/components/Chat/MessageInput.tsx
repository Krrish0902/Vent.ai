import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ChevronUp } from 'lucide-react';
import { Button } from '../UI/Button';
import type { ConversationMode } from '../../types/message';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
  currentMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
}

const modes: { id: ConversationMode; label: string; desc: string; emoji: string }[] = [
  {
    id: 'venting',
    label: 'Just Venting',
    desc: 'I\'ll just listen and validate',
    emoji: '🫂'
  },
  {
    id: 'perspective',
    label: 'Need Perspective',
    desc: 'I\'ll share gentle viewpoints',
    emoji: '💭'
  },
  {
    id: 'general',
    label: 'General Chat',
    desc: 'Mix of both styles',
    emoji: '💝'
  }
];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Share what's on your mind...",
  currentMode,
  onModeChange
}) => {
  const [message, setMessage] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeSelectorRef = useRef<HTMLDivElement>(null);

  // Close mode selector when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target as Node)) {
        setShowModeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage('');
    
    try {
      await onSendMessage(currentMessage);
    } catch (error) {
      setMessage(currentMessage); // Restore message on error
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const currentModeInfo = modes.find(m => m.id === currentMode) || modes[2]; // Default to general

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-4"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-3">
          {/* Mode Selector Button */}
          <div className="relative" ref={modeSelectorRef}>
            <button
              type="button"
              onClick={() => setShowModeSelector(!showModeSelector)}
              className={`
                p-3 rounded-xl border transition-colors h-[52px] w-[52px] mb-2
                ${showModeSelector 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500'
                }
              `}
              title={`Current mode: ${currentModeInfo.label}`}
            >
              <div className="relative">
                <span className="text-xl">{currentModeInfo.emoji}</span>
                <ChevronUp 
                  className={`
                    w-3 h-3 absolute -bottom-1 -right-1
                    transition-transform duration-200
                    ${showModeSelector ? 'rotate-180' : ''}
                  `}
                />
              </div>
            </button>

            {/* Mode Selector Popup */}
            <AnimatePresence>
              {showModeSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {modes.map((mode) => {
                    const isActive = currentMode === mode.id;
                    
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          onModeChange(mode.id);
                          setShowModeSelector(false);
                        }}
                        className={`
                          w-full px-4 py-3 flex items-center space-x-3 transition-colors
                          ${isActive 
                            ? 'bg-gradient-to-r from-teal-500/10 to-cyan-600/10 text-teal-600 dark:text-teal-400' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }
                        `}
                      >
                        <span className="text-xl">{mode.emoji}</span>
                        <div className="text-left">
                          <div className="font-medium text-sm">{mode.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{mode.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="
                w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700
                focus:ring-2 focus:ring-teal-500 focus:border-transparent
                resize-none overflow-hidden min-h-[52px] max-h-[120px]
                bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm
                placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100
                transition-all duration-200
              "
              disabled={isLoading}
              rows={1}
            />

            
            
            {/* Character count */}
            <div className="absolute bottom-2 right-12 text-xs text-gray-400 dark:text-gray-500">
              {message.length}/2000
            </div>
          </div>

          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-3 min-w-[52px] h-[52px] mb-2"
            size="md"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};