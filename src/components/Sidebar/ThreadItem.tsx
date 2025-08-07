import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Pin, Archive, Trash2 } from 'lucide-react';
import { Thread } from '../../types/thread';
import { format, isToday, isYesterday } from 'date-fns';

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const ThreadItem: React.FC<ThreadItemProps> = ({
  thread,
  isActive,
  onClick,
  onPin,
  onArchive,
  onDelete
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative group p-3 rounded-xl cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg' 
          : 'hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Thread Title */}
          <div className="flex items-center space-x-2">
            {thread.isPinned && (
              <Pin className={`w-3 h-3 ${isActive ? 'text-white' : 'text-teal-500'}`} />
            )}
            <h3 className={`
              font-medium text-sm truncate
              ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'}
            `}>
              {thread.title}
            </h3>
          </div>

          {/* Last Message Preview */}
          {thread.lastMessagePreview && (
            <p className={`
              text-xs mt-1 line-clamp-2 leading-relaxed
              ${isActive ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}
            `}>
              {thread.lastMessagePreview}
            </p>
          )}

          {/* Metadata */}
          <div className={`
            flex items-center justify-between mt-2 text-xs
            ${isActive ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}
          `}>
            <span>{formatDate(thread.updatedAt)}</span>
            <div className="flex items-center space-x-2">
              <span>{thread.messageCount} messages</span>
              {thread.totalTokens > 0 && (
                <span>{Math.round(thread.totalTokens / 1000)}k tokens</span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`
            opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity
            ${isActive ? 'hover:bg-white/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
          `}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Pin className="w-4 h-4 mr-2" />
                {thread.isPinned ? 'Unpin' : 'Pin'}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};