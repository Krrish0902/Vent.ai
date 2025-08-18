import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Heart, Menu, PanelLeftClose, PanelLeft, DoorOpen , Users, Bug } from 'lucide-react';
import { Button } from '../UI/Button';
import { useThreadStore } from '../../stores/threadStore';
import { useSimpleRoomStore } from '../../stores/simpleRoomStore';
import { RoomCreationModal } from '../Room/RoomCreationModal';
import { RoomJoinModal } from '../Room/RoomJoinModal';


interface HeaderProps {
  onSettingsClick: () => void;
  onMenuClick: () => void;
  onSidebarToggle?: () => void;
  showMenuButton?: boolean;
  sidebarCollapsed?: boolean;
  hasApiKeys?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSettingsClick, 
  onMenuClick, 
  onSidebarToggle,
  showMenuButton = false,
  sidebarCollapsed = false,
  hasApiKeys = false
}) => {
  const { setCurrentThread } = useThreadStore();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const { roomId } = useSimpleRoomStore();

  const handleLogoClick = () => {
    setCurrentThread(null);
  };

  return (
    <>
      <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20 px-4 py-3 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          {showMenuButton && !roomId && hasApiKeys && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          {/* Desktop sidebar toggle */}
          {onSidebarToggle && !roomId && hasApiKeys && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="hidden md:flex p-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </Button>
          )}
          
          <div 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vent.ai</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Your Friendly AI Third Wheel</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Room Creation Button */}
          {!roomId && hasApiKeys && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateRoom(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
              title="Create Couple's Room"
            >
              <DoorOpen className="w-5 h-5" />
            </Button>
          )}

          {/* Room Join Button */}
          {!roomId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJoinRoom(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              title="Join Couple's Room"
            >
              <Users className="w-5 h-5" />
            </Button>
          )}


          {/* Settings Button */}
          {hasApiKeys && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="p-2"
          >
            <Settings className="w-5 h-5" />
          </Button>
          )}
        </div>
      </div>
    </motion.header>

      {/* Room Modals */}
      <RoomCreationModal 
        isOpen={showCreateRoom} 
        onClose={() => setShowCreateRoom(false)} 
      />
      <RoomJoinModal 
        isOpen={showJoinRoom} 
        onClose={() => setShowJoinRoom(false)} 
      />
      
      {/* Debug Panel */}
    </>
  );
};