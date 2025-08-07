import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../UI/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Share what's on your mind..."
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-4"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-3">
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
            className="p-3 min-w-[52px] h-[52px]"
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
