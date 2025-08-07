import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart } from 'lucide-react';
import { useMessageStore } from '../../stores/messageStore';
import { useThreadStore } from '../../stores/threadStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useChat } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ConversationStarters } from './ConversationStarters';

export const ChatInterface: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentThreadId } = useThreadStore();
  const { getThreadMessages, typingStatus, loadMessages } = useMessageStore();
  const { settings } = useSettingsStore();
  const { sendMessage, isLoading } = useChat();

  const messages = currentThreadId ? getThreadMessages(currentThreadId) : [];
  const aiName = settings?.preferences.aiName || 'Riley';

  useEffect(() => {
    if (currentThreadId) {
      loadMessages(currentThreadId);
    }
  }, [currentThreadId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStatus.isTyping]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  if (!currentThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center mt-52 from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mb-4">
            <MessageCircleHeart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Start a conversation with {aiName}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Choose a topic below or type your message. {aiName} is here to help with thoughtful, empathetic guidance.
          </p>
          <div className="max-w-xl mx-auto text-sm text-gray-500 dark:text-gray-400">
            Tip: Press Enter to send, Shift + Enter for a new line
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="min-h-full flex items-center justify-center">
            <ConversationStarters onSelectStarter={handleSendMessage} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto pb-4">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showTimestamp = !prevMessage || 
                (message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 5 * 60 * 1000;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showTimestamp={showTimestamp}
                />
              );
            })}

            {typingStatus.isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <TypingIndicator />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
        <div className="max-w-4xl mx-auto">
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};