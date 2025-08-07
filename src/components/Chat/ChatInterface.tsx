import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            Select a conversation or start a new one to begin chatting with {aiName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 min-h-screen">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <ConversationStarters onSelectStarter={handleSendMessage} />
        ) : (
          <div className="max-w-4xl mx-auto">
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

      {/* Message Input */}
      <div className="px-4 max-w-4xl mx-auto w-full">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};