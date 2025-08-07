import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThreadStore } from '../../stores/threadStore';
import { ThreadItem } from './ThreadItem';
import { Button } from '../UI/Button';
import { Plus, Search } from 'lucide-react';

export const ThreadList: React.FC = () => {
  const {
    threads,
    currentThreadId,
    searchQuery,
    isLoading,
    loadThreads,
    createThread,
    updateThread,
    deleteThread,
    setCurrentThread,
    setSearchQuery,
    getFilteredThreads
  } = useThreadStore();

  const filteredThreads = getFilteredThreads();

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const handleNewThread = async () => {
    try {
      const threadId = await createThread();
      setCurrentThread(threadId);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleThreadClick = (threadId: string) => {
    setCurrentThread(threadId);
  };

  const handlePin = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      updateThread(threadId, { isPinned: !thread.isPinned });
    }
  };

  const handleArchive = (threadId: string) => {
    updateThread(threadId, { isArchived: true });
  };

  const handleDelete = (threadId: string) => {
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      deleteThread(threadId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-r border-white/20 dark:border-gray-700/20">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
          <Button
            onClick={handleNewThread}
            size="sm"
            className="p-2 min-w-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600
              focus:ring-2 focus:ring-teal-500 focus:border-transparent
              bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
              text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
            "
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading conversations...</div>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === currentThreadId}
                onClick={() => handleThreadClick(thread.id)}
                onPin={() => handlePin(thread.id)}
                onArchive={() => handleArchive(thread.id)}
                onDelete={() => handleDelete(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};