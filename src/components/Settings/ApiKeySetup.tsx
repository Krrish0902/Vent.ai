import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, Trash2, Plus } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../UI/Button';
import { OpenAIService } from '../../services/openai';
import { encryptData } from '../../services/encryption';

export const ApiKeySetup: React.FC = () => {
  const { settings, addApiKey, deleteApiKey, updateApiKey } = useSettingsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState({ provider: 'openai' as const, name: '', key: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.key) return;

    setIsValidating(true);
    try {
      // Validate the API key
      const service = new OpenAIService(encryptData(newKey.key));
      const isValid = await service.validateApiKey();
      
      if (!isValid) {
        alert('Invalid API key. Please check your key and try again.');
        return;
      }

      await addApiKey(newKey.provider, newKey.name, newKey.key);
      setNewKey({ provider: 'openai', name: '', key: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error validating API key:', error);
      alert('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleSetActive = (keyId: string) => {
    if (!settings) return;
    
    // Deactivate all keys
    settings.apiKeys.forEach(key => {
      updateApiKey(key.id, { isActive: key.id === keyId });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">API Keys</h3>
        <p className="text-sm text-gray-600">
          Add your OpenAI API key to enable conversations with Krrish. Your keys are encrypted and stored locally.
        </p>
      </div>

      {/* Existing Keys */}
      {settings?.apiKeys.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h4>
          <p className="text-gray-600 mb-4">Add your OpenAI API key to start chatting with Krrish</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {settings?.apiKeys.map(apiKey => (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${apiKey.isActive 
                  ? 'border-teal-200 bg-teal-50' 
                  : 'border-gray-200 bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                    {apiKey.isActive && (
                      <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-2 space-x-2">
                    <code className="text-sm bg-white px-2 py-1 rounded border font-mono">
                      {showKeys[apiKey.id] 
                        ? apiKey.key.substring(0, 20) + '...'
                        : '••••••••••••••••••••'
                      }
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {showKeys[apiKey.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Provider: {apiKey.provider.toUpperCase()} • 
                    Added {apiKey.createdAt.toLocaleDateString()}
                    {apiKey.usage.totalTokens > 0 && (
                      <> • Used {apiKey.usage.totalTokens.toLocaleString()} tokens</>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!apiKey.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetActive(apiKey.id)}
                    >
                      Set Active
                    </Button>
                  )}
                  
                  <button
                    onClick={() => {
                      if (confirm('Delete this API key?')) {
                        deleteApiKey(apiKey.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          <Button
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="w-full border-2 border-dashed border-gray-300 hover:border-teal-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another API Key
          </Button>
        </div>
      )}

      {/* Add New Key Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          <h4 className="font-medium text-gray-900 mb-3">Add New API Key</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <select
                value={newKey.provider}
                onChange={(e) => setNewKey(prev => ({ 
                  ...prev, 
                  provider: e.target.value as 'openai' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My OpenAI Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={newKey.key}
                onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewKey({ provider: 'openai', name: '', key: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddKey}
              disabled={!newKey.name || !newKey.key}
              isLoading={isValidating}
            >
              Add Key
            </Button>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to get your OpenAI API key:</h4>
        <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
          <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
          <li>Sign in to your OpenAI account</li>
          <li>Click "Create new secret key"</li>
          <li>Copy the key and paste it above</li>
        </ol>
        <p className="text-xs text-blue-700 mt-2">
          Your API key is encrypted and stored only on your device. Krrish never sees or stores your key.
        </p>
      </div>
    </div>
  );
};