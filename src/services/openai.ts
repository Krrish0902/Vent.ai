import { decryptData } from './encryption';
import { Message } from '../types/message';

export interface ChatCompletionResponse {
  content: string;
  tokens: number;
  cost: number;
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

  constructor(encryptedApiKey: string, aiName: string = 'Krrish') {
    this.apiKey = decryptData(encryptedApiKey);
    this.aiName = aiName;
  }

  private getKrrishSystemPrompt(): string {
    return `You are ${this.aiName}, a trustworthy friend who's always there to listen — the supportive third wheel who genuinely cares and offers perspective without judgment.

CORE PERSONALITY:
• Warm, genuine friend who's great at listening
• Validate feelings first, advice second (and only when it feels right)
• Casual, conversational language — never clinical or formal
• Sometimes simply: "that really sucks" or "I totally get why you're upset"
• Knows when to just listen vs when to offer gentle perspective

RESPONSE APPROACH:
1. Listen & Validate: e.g., "Ugh, that sounds so frustrating" or "I can totally see why you'd feel that way"
2. Ask Caring Questions: e.g., "How are you holding up?" "What's been the hardest part?"
3. Gentle Perspective (only when invited or timing feels right): e.g., "Have you thought about..." or "From an outside perspective..."
4. Supportive Check-ins: e.g., "How are you feeling about all this?" "What do you need right now?"

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
• Encourage professional help for serious or ongoing issues as a caring friend would

Remember: You're the friend who actually listens, validates feelings, and gives thoughtful perspective when asked — not the friend who immediately tries to solve everything or judges their choices.`;
  }

  async sendMessage(
    messages: Message[], 
    model: string = 'gpt-4'
  ): Promise<ChatCompletionResponse> {
    try {
      const conversationMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: this.getKrrishSystemPrompt() },
            ...conversationMessages
          ],
          max_tokens: 1000,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokens = data.usage?.total_tokens || 0;
      const cost = this.calculateCost(tokens, model);

      return { content, tokens, cost };
    } catch (error) {
      console.error('OpenAI API Error:', error);
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

  /**
   * Tests if a specific model works with the current API key
   */
  async testModel(modelId: string): Promise<ValidatedModel> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'user', content: 'Test message - please respond with just "OK"' }
          ],
          max_tokens: 5,
          temperature: 0
        })
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        return {
          id: modelId,
          name: modelId,
          isWorking: !!content,
          testDate: new Date(),
          responseTime
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          id: modelId,
          name: modelId,
          isWorking: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          testDate: new Date(),
          responseTime
        };
      }
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

  /**
   * Retrieves and validates all available chat models
   */
  async getValidatedModels(): Promise<ValidatedModel[]> {
    try {
      // Get basic model list first
      const models = await this.getModelDetails();
      const chatModels = models.slice(0, 10); // Limit to first 10 to avoid too many API calls
      
      console.log(`Testing ${chatModels.length} models...`);
      
      // Test each model in parallel (but with some delay to avoid rate limits)
      const validatedModels: ValidatedModel[] = [];
      
      for (let i = 0; i < chatModels.length; i++) {
        const model = chatModels[i];
        console.log(`Testing model ${i + 1}/${chatModels.length}: ${model.id}`);
        
        const validatedModel = await this.testModel(model.id);
        validatedModels.push(validatedModel);
        
        // Add small delay between requests to avoid rate limiting
        if (i < chatModels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Sort by working status first, then by response time
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

  /**
   * Retrieves detailed information about models available to your API key
   * including permissions and capabilities
   */
  async getModelDetails(): Promise<ModelDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const allModels: ModelDetails[] = data.data || [];

      // Filter to include only chat-capable models
      const excludedKeywords = [
        'embedding', 'embeddings', 'moderation', 'whisper', 'audio', 'tts', 'speech', 'clip'
      ];

      const isChatCapable = (id: string) => {
        const lower = id.toLowerCase();
        if (excludedKeywords.some(k => lower.includes(k))) return false;
        return lower.startsWith('gpt') || lower.startsWith('o');
      };

      const chatModels = allModels.filter(model => isChatCapable(model.id));

      // Sort by creation date (newest first) and then by ID
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

  /**
   * Lists available chat-capable models for the current API key.
   * Filters out embedding, audio, tts/whisper, and moderation models.
   */
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
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}