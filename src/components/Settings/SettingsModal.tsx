import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Download, Palette, Shield } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { ApiKeySetup } from './ApiKeySetup';
import { Button } from '../UI/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'api-keys' | 'data' | 'preferences' | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api-keys');
  const { settings, updatePreferences, getActiveApiKey } = useSettingsStore();
  const [modelOptions, setModelOptions] = useState<string[] | null>(null);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Load models for the active OpenAI key
  useEffect(() => {
    const active = getActiveApiKey();
    if (!active || active.provider !== 'openai') {
      setModelOptions(null);
      return;
    }
    (async () => {
      try {
        const { OpenAIService } = await import('../../services/openai');
        const service = new OpenAIService(active.key, settings?.preferences.aiName || 'Riley');
        const models = await service.listChatModels();
        setModelOptions(models);
        setModelsError(models.length === 0 ? 'No models available for this key.' : null);
      } catch (err: any) {
        console.error('Failed to load models', err);
        setModelsError('Failed to load models');
        setModelOptions([]);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const tabs = [
    { id: 'api-keys' as const, label: 'API Keys', icon: Key },
    { id: 'data' as const, label: 'Data', icon: Download },
    { id: 'preferences' as const, label: 'Preferences', icon: Palette },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'api-keys':
        return <ApiKeySetup />;
        
      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Export, import, or clear your conversation data.
              </p>
            </div>

            <div className="space-y-4">
              <Button variant="secondary" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export All Conversations
              </Button>
              
              <Button variant="secondary" className="w-full justify-start">
                Import Conversations
              </Button>
              
              <Button variant="danger" className="w-full justify-start">
                Clear All Data
              </Button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                All your data is stored locally on your device. No conversations are sent to external servers except for AI responses.
              </p>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preferences</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customize your LoveLogic experience.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Name
                </label>
                <input
                  type="text"
                  value={settings?.preferences.aiName}
                  onChange={(e) => updatePreferences({ aiName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter AI name"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose a name for your AI counselor
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={settings?.preferences.theme || 'system'}
                  onChange={(e) => updatePreferences({ 
                    theme: e.target.value as 'light' | 'dark' | 'system' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                {modelOptions === null ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Add an OpenAI API key to load models.</div>
                ) : modelOptions.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{modelsError || 'No models found.'}</div>
                ) : (
                  <select
                    value={settings?.preferences.aiModel || modelOptions[0]}
                    onChange={(e) => updatePreferences({ aiModel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {modelOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-save drafts
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically save message drafts as you type
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.preferences.autoSave || false}
                  onChange={(e) => updatePreferences({ autoSave: e.target.checked })}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show typing indicators
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display when {settings?.preferences.aiName || 'Riley'} is typing a response
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.preferences.showTypingIndicators || false}
                  onChange={(e) => updatePreferences({ showTypingIndicators: e.target.checked })}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privacy & Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Control how your data is handled and stored.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">🔒 Complete Privacy</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• All data stored locally on your device</li>
                  <li>• API keys encrypted with AES-256</li>
                  <li>• No data sent to LoveLogic servers</li>
                  <li>• No user tracking or analytics</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="3650"
                  value={settings?.privacy.dataRetentionDays || 365}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Conversations older than this will be automatically deleted
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-delete old conversations
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically delete conversations after retention period
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.privacy.autoDeleteEnabled || false}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 overflow-hidden"
          >
            <div className="h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium
                        transition-colors border-b-2
                        ${activeTab === tab.id
                          ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {renderTabContent()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};