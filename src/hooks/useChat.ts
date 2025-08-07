import { useState } from 'react';
import { useMessageStore } from '../stores/messageStore';
import { useThreadStore } from '../stores/threadStore';
import { useSettingsStore } from '../stores/settingsStore';
import { OpenAIService } from '../services/openai';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, updateMessageStatus, setTyping, getThreadMessages } = useMessageStore();
  const { currentThreadId, updateThread } = useThreadStore();
  const { getActiveApiKey, settings } = useSettingsStore();

  const sendMessage = async (content: string) => {
    if (!currentThreadId || !content.trim()) return;

    const activeApiKey = getActiveApiKey();
    if (!activeApiKey) {
      throw new Error('No API key configured');
    }

    setIsLoading(true);
    
    try {
      // Add user message
      const userMessageId = await addMessage({
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
      const aiName = settings?.preferences.aiName || 'Riley';
      const openaiService = new OpenAIService(activeApiKey.key, aiName);
      const response = await openaiService.sendMessage(messages);

      // Add AI's response
      await addMessage({
        threadId: currentThreadId,
        content: response.content,
        sender: 'riley',
        status: 'delivered',
        tokens: response.tokens
      });

      // Update thread metadata
      await updateThread(currentThreadId, {
        messageCount: messages.length + 2,
        totalTokens: (messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0)) + response.tokens,
        lastMessagePreview: response.content.substring(0, 100)
      });

    } catch (error) {
      console.error('Error sending message:', error);
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