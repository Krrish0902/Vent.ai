import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Users, Heart } from 'lucide-react';
import { Button } from '../UI/Button';
import { useSimpleRoomStore } from '../../stores/simpleRoomStore';

interface RoomCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoomCreationModal: React.FC<RoomCreationModalProps> = ({ isOpen, onClose }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { createRoom} = useSimpleRoomStore();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const newRoomId = await createRoom();
      setRoomId(newRoomId);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room ID:', error);
    }
  };

  const handleJoinRoom = () => {
    // Navigate to room or close modal
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Couple's Room
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {!roomId ? (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Create a private room to connect with your partner and get AI advice together.
                </p>
                
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center space-x-2 text-pink-700 dark:text-pink-300">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">P2P Connection</span>
                  </div>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                    Direct connection between you and your partner
                  </p>
                </div>

                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  {isCreating ? 'Creating...' : 'Create New Room'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Room Created Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Share this room ID with your partner to connect.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Room ID:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyRoomId}
                      className="p-1 h-auto"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border font-mono text-lg text-center text-gray-900 dark:text-white">
                    {roomId}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Next steps:</strong>
                  </p>
                  <ol className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1 list-decimal list-inside">
                    <li>Share the room ID with your partner</li>
                    <li>Your partner enters the room ID to join</li>
                    <li>Both confirm when ready for AI advice</li>
                  </ol>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Enter Room
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
