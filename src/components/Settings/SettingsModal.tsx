import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Download, Palette, Shield, CheckCircle, XCircle, Clock, RefreshCw, Play } from 'lucide-react';
import { ValidatedModel } from '../../services/openai';
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
  const { settings, updatePreferences, getActiveApiKey, loadSettings } = useSettingsStore();

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);
  
  const [validatedModels, setValidatedModels] = useState<ValidatedModel[] | null>(null);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isTestingModels, setIsTestingModels] = useState(false);

  const loadValidatedModels = async () => {
    const active = getActiveApiKey();
    if (!active || active.provider !== 'openai') return;
    
    setIsTestingModels(true);
    setModelsError(null);
    try {
      const { OpenAIService } = await import('../../services/openai');
      const service = new OpenAIService(active.key, settings?.preferences.aiName || 'Krrish');
      const models = await service.getValidatedModels();
      setValidatedModels(models);
      setModelsError(models.length === 0 ? 'No working models found for this key.' : null);
    } catch (err: any) {
      console.error('Failed to validate models', err);
      setModelsError('Failed to test models: ' + err.message);
      setValidatedModels([]);
    } finally {
      setIsTestingModels(false);
    }
  };

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
        if (!settings) {
          return (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preferences</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customize your Vent.ai experience.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Name
                </label>
                <input
                  type="text"
                  value={settings?.preferences.aiName || 'Krrish'}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Model
                  </label>
                  <div className="flex space-x-2">
                    {!validatedModels && getActiveApiKey()?.provider === 'openai' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={loadValidatedModels}
                        disabled={isTestingModels}
                        className="text-xs"
                      >
                        <Play className={`w-3 h-3 mr-1 ${isTestingModels ? 'animate-spin' : ''}`} />
                        Test Models
                      </Button>
                    )}
                    {validatedModels && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadValidatedModels}
                        disabled={isTestingModels}
                        className="text-xs"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isTestingModels ? 'animate-spin' : ''}`} />
                        Retest
                      </Button>
                    )}
                  </div>
                </div>
                
                {!getActiveApiKey() || getActiveApiKey()?.provider !== 'openai' ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Add an OpenAI API key to test models.
                  </div>
                ) : validatedModels === null ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Model Testing Available</p>
                      <p>Click "Test Models" to verify which models work with your API key and see their performance.</p>
                    </div>
                  </div>
                ) : isTestingModels ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-spin" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Testing models... This may take a moment.
                      </span>
                    </div>
                  </div>
                ) : validatedModels.length === 0 ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {modelsError || 'No working models found.'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={settings?.preferences.aiModel || validatedModels.find(m => m.isWorking)?.id || 'gpt-4'}
                      onChange={(e) => updatePreferences({ aiModel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {validatedModels.filter(m => m.isWorking).map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.id} {model.responseTime ? `(${model.responseTime}ms)` : ''}
                        </option>
                      ))}
                    </select>
                    
                    {/* Model Status List */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm max-h-48 overflow-y-auto">
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Model Test Results:</div>
                      <div className="space-y-2">
                        {validatedModels.map((model) => (
                          <div key={model.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              {model.isWorking ? (
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                              <span className={`text-xs ${model.isWorking ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                {model.id}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {model.isWorking 
                                ? `${model.responseTime}ms`
                                : model.error?.substring(0, 30) + (model.error && model.error.length > 30 ? '...' : '')
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Selected Model Details */}
                    {settings?.preferences.aiModel && validatedModels.find(m => m.id === settings.preferences.aiModel) && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 text-sm">
                        {(() => {
                          const selectedModel = validatedModels.find(m => m.id === settings.preferences.aiModel);
                          if (!selectedModel) return null;
                          
                          return (
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-green-700 dark:text-green-300 font-medium">
                                  {selectedModel.id} - Working ✓
                                </div>
                                <div className="text-green-600 dark:text-green-400 text-xs mt-1">
                                  Response time: {selectedModel.responseTime}ms
                                </div>
                                <div className="text-green-600 dark:text-green-400 text-xs">
                                  Last tested: {selectedModel.testDate.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
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
                    Display when {settings?.preferences.aiName || 'Krrish'} is typing a response
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
                  <li>• No data sent to Vent.ai servers</li>
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
              <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                <div className="flex min-w-max">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium whitespace-nowrap
                          transition-colors border-b-2 min-w-fit
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