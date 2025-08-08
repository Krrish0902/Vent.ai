import { useState } from 'react';
import { useMessageStore } from '../stores/messageStore';
import { useThreadStore } from '../stores/threadStore';
import { useSettingsStore } from '../stores/settingsStore';
import { OpenAIService } from '../services/openai';
import type { ConversationMode } from '../types/message';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, setTyping, getThreadMessages } = useMessageStore();
  const { currentThreadId, updateThread } = useThreadStore();
  const { getActiveApiKey, settings } = useSettingsStore();

  const sendMessage = async (content: string, mode: ConversationMode = 'general') => {
    if (!currentThreadId || !content.trim()) return;

    const activeApiKey = getActiveApiKey();
    if (!activeApiKey) {
      throw new Error('No API key configured');
    }

    setIsLoading(true);
    
    try {
      // Add user message
      await addMessage({
        threadId: currentThreadId,
        content: content.trim(),
        sender: 'user',
        status: 'sent'
      });

      // Show typing indicator
      setTyping(true);

      // Get conversation history
      const messages = getThreadMessages(currentThreadId);
      
      // Create OpenAI service and send message
      const aiName = settings?.preferences.aiName || 'Krrish';
      const userName = settings?.preferences.userName || '';
      const openaiService = new OpenAIService(activeApiKey.key, aiName, userName, true); // Mark key as encrypted
      const aiModel = settings?.preferences.aiModel || '';
      const response = await openaiService.sendMessage(messages, aiModel, mode);

      // Add AI's response with emoji reaction if present
      await addMessage({
        threadId: currentThreadId,
        content: response.content,
        sender: 'Krrish',
        status: 'delivered',
        tokens: response.tokens,
        reaction: response.reaction
      });

      // Update thread metadata
      await updateThread(currentThreadId, {
        messageCount: messages.length + 2,
        totalTokens: (messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0)) + response.tokens,
        lastMessagePreview: response.content.substring(0, 100),
        mode
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};