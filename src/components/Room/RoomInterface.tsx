import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Wifi, WifiOff, CheckCircle, Bot, ArrowLeft, Power } from 'lucide-react';
import { Button } from '../UI/Button';
import { useSimpleRoomStore } from '../../stores/simpleRoomStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { RoomMessage } from '../../types/messages';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export const RoomInterface: React.FC = () => {
  const {
    roomId,
    connectionStatus,
    messages,
    isHost,
    hostName,
    guestName,
    hostReady,
    guestReady,
    aiInProgress,
    sendMessage,
    setReadyStatus,
    requestAIAdvice,
    leaveRoom
  } = useSimpleRoomStore();

  const { getActiveApiKey } = useSettingsStore();

  // Debug logging removed for cleaner UI

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      try {
        await sendMessage(messageInput.trim());
        setMessageInput('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRequestAIAdvice = async () => {
    const apiKeyConfig = getActiveApiKey();
    if (!apiKeyConfig) {
      alert('Please add your Gemini API key in settings to use AI advice.');
      return;
    }
    await requestAIAdvice(apiKeyConfig.key);
  };

  const handleEndSession = async () => {
    if (!isHost) {
      // Non-hosts should just leave
      leaveRoom();
      return;
    }
    const confirmed = window.confirm('End session for both partners and delete this room?');
    if (confirmed) {
      leaveRoom();
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';

      default:
        return 'text-red-500';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;

      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: Date | string | undefined) => {
    try {
      if (!timestamp) {
        return '--:--';
      }
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '--:--';
    }
  };

  const renderMessage = (message: RoomMessage) => {
    const isOwnMessage = (message.sender === 'host' && isHost) || (message.sender === 'guest' && !isHost);
    const displayName = message.sender === 'ai'
      ? 'AI'
      : message.sender === 'host'
        ? (hostName || 'Host')
        : (guestName || 'Guest');
    const displayInitial = displayName.charAt(0).toUpperCase();
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          <div className={`px-4 py-2 rounded-2xl ${
            message.type === 'ai' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
              : isOwnMessage
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-sm'
          }`}>
            {message.type === 'ai' && (
              <div className="flex items-center space-x-2 mb-1">
                <Bot className="w-3 h-3" />
                <span className="text-xs opacity-90">AI Advice</span>
              </div>
            )}
            {message.type === 'ai' ? (
              <div className="text-sm prose prose-sm prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-semibold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-2">{children}</h3>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-white/30 pl-3 italic">{children}</blockquote>,
                    code: ({ children }) => <code className="bg-white/20 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    pre: ({ children }) => <pre className="bg-white/20 p-2 rounded text-xs font-mono overflow-x-auto">{children}</pre>
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
        {message.type !== 'ai' && (
          <div className={`${isOwnMessage ? 'order-1 mr-3' : 'order-2 ml-3 mt-1'} flex-shrink-0`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              isOwnMessage
                ? 'bg-gradient-to-r from-green-400 to-yellow-500 text-white'
                : 'bg-gradient-to-r from-blue-400 to-green-600 text-white'
            }`}>
              {displayInitial}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  if (!roomId) {
    return null;
  }

  // Safety check for messages array
  if (!messages) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  // Additional safety check for roomId
  if (!roomId) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No room active. Please create or join a room.</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
        {/* Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={leaveRoom}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Couple's Room
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Room ID: {roomId}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {connectionStatus}
              </span>
            </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndSession}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="End session"
              >
                <Power className="w-4 h-4" />
              </Button>
          </div>
        </div>

        {/* Ready Status Banner */}
        {((isHost && hostReady) || (!isHost && guestReady) || (isHost && guestReady) || (!isHost && hostReady)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 mx-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  {(isHost && hostReady && guestReady) || (!isHost && guestReady && hostReady)
                    ? 
                    (isHost ? 'Both ready! Click "Get AI Advice" to continue.': 'Both ready!')
                    : (isHost && hostReady) || (!isHost && guestReady)
                      ? "You're ready. Waiting for partner..."
                      : "Partner is ready. Click 'Ready for AI' to confirm."
                  }
                </span>
              </div>
              
              {(isHost && hostReady && guestReady) ? (
                <Button
                  onClick={handleRequestAIAdvice}
                  disabled={aiInProgress}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {aiInProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      AI Thinking...
                    </>
                  ) : (
                    'Get AI Advice'
                  )}
                </Button>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        <AnimatePresence>
          {messages && messages.length > 0 ? (
            messages.map(renderMessage)
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
        <div className="space-y-3">
          {/* Ready Status Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ready for AI advice?
              </span>
              <Button
                variant={(isHost ? hostReady : guestReady) ? "primary" : "ghost"}
                size="sm"
                onClick={() => setReadyStatus(!(isHost ? hostReady : guestReady))}
                disabled={aiInProgress}
                className={(isHost ? hostReady : guestReady) ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {(isHost ? hostReady : guestReady) ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Ready
                  </>
                ) : (
                  'Ready'
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isHost ? (guestReady ? (
                <span className="text-green-600 dark:text-green-400">Partner Ready</span>
              ) : (
                <span className="text-gray-400">Partner Not Ready</span>
              )) : (hostReady ? (
                <span className="text-green-600 dark:text-green-400">Partner Ready</span>
              ) : (
                <span className="text-gray-400">Partner Not Ready</span>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none overflow-hidden min-h-[52px] max-h-[120px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 transition-all duration-200"
                disabled={aiInProgress}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || aiInProgress}
              className="p-3 min-w-[52px] h-[52px] mb-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50"
              size="md"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

             {/* Room Status Modal */}
     </div>
   );
   } catch (error) {
     console.error('Error rendering RoomInterface:', error);
     return (
       <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 items-center justify-center">
         <div className="text-center text-red-500">
           <p>Something went wrong. Please refresh the page.</p>
           <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
         </div>
       </div>
     );
   }
 };
