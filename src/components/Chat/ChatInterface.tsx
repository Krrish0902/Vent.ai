import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart, Settings } from 'lucide-react';
import { useMessageStore } from '../../stores/messageStore';
import { useThreadStore } from '../../stores/threadStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useChat } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ConversationStarters } from './ConversationStarters';
import type { ConversationMode } from '../../types/message';

export const ChatInterface: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentThreadId } = useThreadStore();
  const { getThreadMessages, typingStatus, loadMessages } = useMessageStore();
  const { settings, openSettings } = useSettingsStore();
  const { sendMessage, isLoading } = useChat();
  const [currentMode, setCurrentMode] = useState<ConversationMode>(
    settings?.preferences.defaultConversationMode || 'general'
  );

  const messages = currentThreadId ? getThreadMessages(currentThreadId) : [];
  const aiName = settings?.preferences.aiName || 'Krrish';
  const userName = settings?.preferences.userName || '';
  const activeApiKey = useSettingsStore(state => state.getActiveApiKey());
  const aiModel = settings?.preferences?.aiModel || "";
  
  useEffect(() => {
    if (currentThreadId) {
      loadMessages(currentThreadId);
    }
  }, [currentThreadId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStatus.isTyping]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, currentMode);
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
            {userName ? `Hey ${userName}! Ready to chat with ${aiName}?` : `Start a conversation with ${aiName}`}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {userName 
              ? `${aiName} is here to listen, support, and chat with you about anything on your mind. Whether you need to vent, get a reality check, or just process your feelings - ${aiName} is here with zero judgment and endless patience.`
              : `Your pocket-sized best friend for all things relationships. Whether you need to vent, get a reality check, or just process your feelings - ${aiName} is here with zero judgment and endless patience.`
            }
          </p>
          
          {/* User Name Suggestion Card */}
          {(!userName || !aiModel) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 p-6 bg-gradient-to-br from-indigo-50 via-green-50 to-yellow-50 dark:from-indigo-900/20 dark:via-green-900/20 dark:to-yellow-900/20 rounded-2xl border border-teal-200/50 dark:border-teal-700/50 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded- flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                    Make it personal
                  </h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Complete your profile to have a personalized experience with {aiName}
                  </p>
                </div>
              </div>
              <button
                onClick={openSettings}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-50 dark:focus:ring-offset-gray-900"
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                  Settings
              </button>
            </motion.div>
          )}
        </motion.div> 
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Model Warning */}
      {(!aiModel || !activeApiKey) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700"
        >
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  {!activeApiKey 
                    ? "No API key set. Please add your OpenAI API key in settings to start chatting."
                    : "No AI model selected. Please set up your preferred model in settings to start chatting."
                  }
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={openSettings}
                  className="inline-flex items-center px-3 py-1.5 border border-yellow-400 dark:border-yellow-600 rounded-md text-yellow-700 dark:text-yellow-200 text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-1.5" />
                  Open Settings
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
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
            currentMode={currentMode}
            onModeChange={setCurrentMode}
            placeholder={
              currentMode === 'venting' 
                ? "I'm here to listen..." 
                : currentMode === 'perspective'
                ? "What's on your mind? I'll share my thoughts..."
                : "What would you like to talk about?"
            }
          />
        </div>
      </div>
    </div>
  );
};