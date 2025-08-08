import { decryptData } from './encryption';
import { Message } from '../types/message';
import type { ConversationMode } from '../types/message';

export interface ChatCompletionResponse {
  content: string;
  tokens: number;
  cost: number;
  reaction?: string;
}

export interface ModelDetails {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: {
    id: string;
    object: string;
    created: number;
    allow_create_engine: boolean;
    allow_sampling: boolean;
    allow_logprobs: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    allow_fine_tuning: boolean;
    organization: string;
    group: string | null;
    is_blocking: boolean;
  }[];
}

export interface ValidatedModel {
  id: string;
  name: string;
  isWorking: boolean;
  error?: string;
  testDate: Date;
  responseTime?: number;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private aiName: string;

  constructor(apiKey: string, aiName: string = 'Krrish', isEncrypted: boolean = false) {
    try {
      // If the key is encrypted, decrypt it; otherwise use as is
      this.apiKey = isEncrypted ? decryptData(apiKey) : apiKey;
      
      // Basic validation
      if (!this.apiKey || typeof this.apiKey !== 'string' || !this.apiKey.startsWith('sk-')) {
        throw new Error('Invalid API key format. Key should start with "sk-"');
      }

      this.aiName = aiName;
    } catch (error: any) {
      console.error('OpenAI Service initialization error:', error);
      throw new Error(error.message || 'Invalid API key');
    }
  }

  private async makeApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`OpenAI API Error (${endpoint}):`, error);
      throw error;
    }
  }

  private getSystemPromptForMode(mode: ConversationMode = 'general'): string {
    const basePrompt = `You are ${this.aiName}, a trustworthy friend who's always there to listen — the supportive third wheel who genuinely cares and offers perspective without judgment.

CORE PERSONALITY:
• Warm, genuine friend who's great at listening
• Validate feelings first, advice second (and only when it feels right)
• Casual, conversational language — never clinical or formal
• Sometimes simply: "that really sucks" or "I totally get why you're upset"
• Knows when to just listen vs when to offer gentle perspective

CONVERSATION STYLE:
• Talk like a close friend, not a therapist
• Use phrases like: "Oh wow", "That's rough", "I hear you", "Been there"
• Share relatable thoughts: "Relationships are complicated" or "That would drive me crazy too"
• Know when to just validate without trying to fix anything
• Ask about feelings naturally: "How did that land with you?" "What's your gut saying?"

BOUNDARIES AS A FRIEND:
• If crisis concerns arise, say: "I'm worried about you — maybe talking to someone professional would help?"
• Do not diagnose or give medical/legal advice — you're a friend, not a doctor
• Sometimes the best response is just: "I'm here for you" or "That really sucks"
• Encourage professional help for serious or ongoing issues as a caring friend would`;

    const modeSpecificPrompts = {
      venting: `
CURRENT MODE: JUST VENTING
• Focus entirely on listening and validating feelings
• Do NOT offer advice or solutions unless explicitly asked
• Use more emotional validation phrases: "That's so hard", "I hear you", "You have every right to feel that way"
• React with supportive emojis more frequently (❤️, 🫂, 💔, 😔)
• If they seem to want advice, gently ask "Would you like my perspective on this, or do you just need to vent?"`,

      perspective: `
CURRENT MODE: NEED PERSPECTIVE
• Start with brief validation, then thoughtfully share your perspective
• Frame advice as gentle suggestions: "Have you considered...", "From what you're saying..."
• Use more analytical emojis when appropriate (🤔, 💭, 💡)
• Balance validation with constructive viewpoints
• Always check if your perspective resonates: "Does that make sense?"`,

      general: `
CURRENT MODE: GENERAL CHAT
• Balance between listening and offering perspective
• Read the situation to determine when to validate vs when to advise
• Use a mix of supportive and thoughtful reactions
• Be ready to switch between venting and perspective modes based on their needs`
    };

    return `${basePrompt}\n${modeSpecificPrompts[mode]}

EMOJI REACTIONS:
• For strong emotions: ❤️ (love/support), 🫂 (hugs), 💔 (heartbreak), 😔 (sadness)
• For achievements/progress: 🎉 (celebration), ⭐ (proud), 💪 (strength)
• For insights: 💡 (realization), 🤔 (thoughtful), 💭 (contemplation)
• For agreement: 👍 (approval), 💯 (totally agree), 🎯 (exactly right)

Remember: You're the friend who actually listens, validates feelings, and gives thoughtful perspective when asked — not the friend who immediately tries to solve everything or judges their choices.

RESPONSE FORMAT:
When appropriate, start your response with an emoji reaction enclosed in [REACT:emoji]. Example: [REACT:❤️] That sounds really tough...`;
  }

  async sendMessage(
    messages: Message[], 
    model: string,
    mode: ConversationMode = 'general'
  ): Promise<ChatCompletionResponse> {
    try {
      const conversationMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const data = await this.makeApiRequest<any>('/chat/completions', 'POST', {
        model,
        messages: [
          { role: 'system', content: this.getSystemPromptForMode(mode) },
          ...conversationMessages
        ],
        max_tokens: 1000,
        temperature: mode === 'perspective' ? 0.7 : 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const content = data.choices[0]?.message?.content || '';
      const tokens = data.usage?.total_tokens || 0;
      const cost = this.calculateCost(tokens, model);

      // Extract emoji reaction if present
      const reactionMatch = content.match(/^\[REACT:([^\]]+)\]/);
      const reaction = reactionMatch ? reactionMatch[1] : undefined;
      const cleanContent = reactionMatch ? content.replace(/^\[REACT:[^\]]+\]\s*/, '') : content;

      return { content: cleanContent, tokens, cost, reaction };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  private calculateCost(tokens: number, model: string): number {
    const pricing: Record<string, number> = {
      'gpt-4': 0.00003,
      'gpt-4-turbo': 0.00001,
      'gpt-3.5-turbo': 0.0000015
    };
    
    return (tokens * (pricing[model] || pricing['gpt-4']));
  }

  async testModel(modelId: string): Promise<ValidatedModel> {
    const startTime = Date.now();
    
    try {
      await this.makeApiRequest<any>('/chat/completions', 'POST', {
        model: modelId,
        messages: [
          { role: 'user', content: 'Test message - please respond with just "OK"' }
        ],
        max_tokens: 5,
        temperature: 0
      });

      return {
        id: modelId,
        name: modelId,
        isWorking: true,
        testDate: new Date(),
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        id: modelId,
        name: modelId,
        isWorking: false,
        error: error.message || 'Network error',
        testDate: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  async getValidatedModels(): Promise<ValidatedModel[]> {
    try {
      const models = await this.getModelDetails();
      const chatModels = models.slice(0, 10);
      
      console.log(`Testing ${chatModels.length} models...`);
      
      const validatedModels: ValidatedModel[] = [];
      
      for (let i = 0; i < chatModels.length; i++) {
        const model = chatModels[i];
        console.log(`Testing model ${i + 1}/${chatModels.length}: ${model.id}`);
        
        const validatedModel = await this.testModel(model.id);
        validatedModels.push(validatedModel);
        
        if (i < chatModels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return validatedModels.sort((a, b) => {
        if (a.isWorking && !b.isWorking) return -1;
        if (!a.isWorking && b.isWorking) return 1;
        if (a.isWorking && b.isWorking) {
          return (a.responseTime || 0) - (b.responseTime || 0);
        }
        return a.id.localeCompare(b.id);
      });
    } catch (error) {
      console.error('Failed to validate models:', error);
      return [];
    }
  }

  async getModelDetails(): Promise<ModelDetails[]> {
    try {
      const data = await this.makeApiRequest<{ data: ModelDetails[] }>('/models');
      const allModels = data.data || [];

      const excludedKeywords = [
        'embedding', 'embeddings', 'moderation', 'whisper', 'audio', 'tts', 'speech', 'clip'
      ];

      const isChatCapable = (id: string) => {
        const lower = id.toLowerCase();
        if (excludedKeywords.some(k => lower.includes(k))) return false;
        return lower.startsWith('gpt') || lower.startsWith('o');
      };

      const chatModels = allModels.filter(model => isChatCapable(model.id));

      return chatModels.sort((a, b) => {
        if (b.created !== a.created) {
          return b.created - a.created;
        }
        return a.id.localeCompare(b.id);
      });
    } catch (error) {
      console.error('Failed to retrieve model details:', error);
      return [];
    }
  }

  async listChatModels(): Promise<string[]> {
    try {
      const models = await this.getModelDetails();
      return models.map(m => m.id);
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.makeApiRequest<any>('/models');
      return true;
    } catch (error: any) {
      console.error('API key validation error:', error);
      return false;
    }
  }
}