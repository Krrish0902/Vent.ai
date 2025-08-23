import { decryptData } from './encryption';
import { Message } from '../types/message';
import type { ConversationMode } from '../types/message';

export interface ChatCompletionResponse {
  content: string;
  tokens: number;
  cost: number;
  reaction?: string;
}



export interface ValidatedModel {
  id: string;
  name: string;
  isWorking: boolean;
  error?: string;
  testDate: Date;
  responseTime?: number;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private aiName: string;
  private userName: string;

  constructor(apiKey: string, aiName: string = 'Krrish', userName: string = '', isEncrypted: boolean = false) {
    try {
      // If the key is encrypted, decrypt it; otherwise use as is
      this.apiKey = isEncrypted ? decryptData(apiKey) : apiKey;
      
      // Basic validation for Gemini API key format
      if (!this.apiKey || typeof this.apiKey !== 'string' || this.apiKey.length < 20) {
        throw new Error('Invalid API key format. Gemini API key should be a valid string.');
      }

      this.aiName = aiName;
      this.userName = userName;
    } catch (error: any) {
      console.error('Gemini Service initialization error:', error);
      throw new Error(error.message || 'Invalid API key');
    }
  }

  private async makeApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}?key=${this.apiKey}`;
      console.log(`🌐 Making ${method} request to: ${endpoint}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response received for ${endpoint}`);
      return data;
    } catch (error: any) {
      console.error(`Gemini API Error (${endpoint}):`, error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error(`Network error: Unable to connect to Gemini API. Please check your internet connection and API key.`);
      }
      throw error;
    }
  }

  private getSystemPromptForMode(mode: ConversationMode = 'general'): string {
    const userGreeting = this.userName ? `You're chatting with ${this.userName}.` : '';
    const basePrompt = `You are ${this.aiName}, a trustworthy friend who's always there to listen — the supportive third wheel who genuinely cares and offers perspective without judgment. ${userGreeting}

CORE PERSONALITY:
• Warm, genuine friend who's great at listening
• Validate feelings first, advice second (and only when it feels right)
• Casual, conversational language — never clinical or formal
• Sometimes simply: "that really sucks" or "I totally get why you're upset"
• Knows when to just listen vs when to offer gentle perspective
• ${this.userName ? `Use ${this.userName}'s name naturally in conversation when it feels right` : ''}

CONVERSATION STYLE:
• Talk like a close friend, not a therapist
• Use phrases like: "Oh wow", "That's rough", "I hear you", "Been there"
• Share relatable thoughts: "Relationships are complicated" or "That would drive me crazy too"
• Know when to just validate without trying to fix anything
• Ask about feelings naturally: "How did that land with you?" "What's your gut saying?"
• ${this.userName ? `Address ${this.userName} by name occasionally to make conversations feel more personal` : ''}

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
      // Check if this is a couple's room scenario (long prompt with specific couple instructions)
      const isCouplesRoom = messages.some(msg => 
        msg.content.includes('couple') || 
        msg.content.includes('both partners') || 
        msg.content.includes('CONVERSATION CONTEXT') ||
        msg.content.includes('RUNNING SUMMARY') ||
        msg.content.includes('trusted third wheel') ||
        msg.content.includes('group chat')
      );

      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Extract the actual model name (remove 'models/' prefix if present)
      const actualModelName = model.replace('models/', '');
      
      let requestBody: any;
      
      if (isCouplesRoom) {
        // For couple's room, use the message content directly without additional system prompt
        console.log('Detected couple\'s room scenario, using direct prompt');
        requestBody = {
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 9000,
            temperature: 0.7,
            topP: 0.9,
            topK: 40
          }
        };
      } else {
        // For regular one-on-one chat, use the standard system prompt
        requestBody = {
          contents: [
            { role: 'user', parts: [{ text: this.getSystemPromptForMode(mode) }] },
            ...geminiMessages
          ],
          generationConfig: {
            maxOutputTokens: 6000,
            temperature: mode === 'perspective' ? 0.7 : 0.8,
            topP: 0.9,
            topK: 40
          }
        };
      }
      
      const data = await this.makeApiRequest<any>('/models/' + actualModelName + ':generateContent', 'POST', requestBody);

      console.log('Raw Gemini API response:', JSON.stringify(data, null, 2));
      
      // Check if we have candidates
      if (!data.candidates || data.candidates.length === 0) {
        console.error('No candidates in Gemini response:', data);
        throw new Error('No response generated from Gemini API');
      }
      
      // Check if we have content
      if (!data.candidates[0]?.content?.parts || data.candidates[0].content.parts.length === 0) {
        console.error('No content parts in Gemini response:', data.candidates[0]);
        throw new Error('No content generated from Gemini API');
      }
      
      const content = data.candidates[0].content.parts[0].text || '';
      console.log('Extracted content from Gemini response:', content);
      console.log('Content length:', content.length);
      
      if (!content || content.trim() === '') {
        console.error('Empty content from Gemini API');
        throw new Error('Empty response from Gemini API');
      }
      
      const tokens = data.usageMetadata?.totalTokenCount || 0;
      const cost = this.calculateCost(tokens, model);

      // Extract emoji reaction if present
      const reactionMatch = content.match(/^\[REACT:([^\]]+)\]/);
      const reaction = reactionMatch ? reactionMatch[1] : undefined;
      const cleanContent = reactionMatch ? content.replace(/^\[REACT:[^\]]+\]\s*/, '') : content;

      console.log('Final clean content:', cleanContent);
      console.log('Final content length:', cleanContent.length);

      return { content: cleanContent, tokens, cost, reaction };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  private calculateCost(tokens: number, model: string): number {
    // Extract the actual model name (remove 'models/' prefix if present)
    const actualModelName = model.replace('models/', '');
    
    // Gemini pricing (as of 2024)
    const pricing: Record<string, number> = {
      'gemini-1.5-flash': 0.000075, // $0.075 per 1M input tokens
      'gemini-1.5-pro': 0.000375,   // $0.375 per 1M input tokens
      'gemini-2.0-flash': 0.000075, // $0.075 per 1M input tokens
      'gemini-2.0-pro': 0.000375,   // $0.375 per 1M input tokens
      'gemini-2.5-flash': 0.000075, // $0.075 per 1M input tokens
      'gemini-2.5-pro': 0.000375    // $0.375 per 1M input tokens
    };
    
    return (tokens / 1000000) * (pricing[actualModelName] || pricing['gemini-1.5-flash']);
  }

  async testModel(modelId: string): Promise<ValidatedModel> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${modelId}...`);
      
      // Extract the actual model name (remove 'models/' prefix)
      const actualModelName = modelId.replace('models/', '');
      
      // First check if the model exists and is accessible
      try {
        await this.makeApiRequest<any>(`/models/${actualModelName}`);
      } catch (error: any) {
        console.log(`⚠️ Model ${actualModelName} not accessible:`, error.message);
        return {
          id: modelId,
          name: modelId,
          isWorking: false,
          error: `Model not accessible: ${error.message}`,
          testDate: new Date(),
          responseTime: Date.now() - startTime
        };
      }
      
      const response = await this.makeApiRequest<any>('/models/' + actualModelName + ':generateContent', 'POST', {
        contents: [
          { role: 'user', parts: [{ text: 'Test message - please respond with just "OK"' }] }
        ],
        generationConfig: {
          maxOutputTokens: 5,
          temperature: 0
        }
      });

      const responseTime = Date.now() - startTime;
      console.log(`✅ ${modelId} test successful (${responseTime}ms)`);
      
      return {
        id: modelId,
        name: modelId,
        isWorking: true,
        testDate: new Date(),
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error.message || 'Unknown error';
      
      console.log(`❌ ${modelId} test failed (${responseTime}ms): ${errorMessage}`);
      
      return {
        id: modelId,
        name: modelId,
        isWorking: false,
        error: errorMessage,
        testDate: new Date(),
        responseTime
      };
    }
  }

  async getValidatedModels(): Promise<ValidatedModel[]> {
    try {
      // Only test the 4 specific models we support
      const supportedModels = [
        'models/gemini-2.5-pro',
        'models/gemini-2.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash'
      ];
      
      console.log(`Testing ${supportedModels.length} supported models...`);
      
      const validatedModels: ValidatedModel[] = [];
      
      for (let i = 0; i < supportedModels.length; i++) {
        const modelId = supportedModels[i];
        console.log(`Testing model ${i + 1}/${supportedModels.length}: ${modelId}`);
        
        try {
          const validatedModel = await this.testModel(modelId);
          validatedModels.push(validatedModel);
          
          if (validatedModel.isWorking) {
            console.log(`✅ ${modelId} is working!`);
          }
          
          // Short delay between tests to avoid rate limiting
          if (i < supportedModels.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.warn(`Failed to test ${modelId}:`, error);
          validatedModels.push({
            id: modelId,
            name: modelId,
            isWorking: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            testDate: new Date()
          });
        }
      }
      
      // Sort: working models first, then alphabetically
      return validatedModels.sort((a, b) => {
        if (a.isWorking && !b.isWorking) return -1;
        if (!a.isWorking && b.isWorking) return 1;
        return a.id.localeCompare(b.id);
      });
    } catch (error) {
      console.error('Failed to validate models:', error);
      return [];
    }
  }



  async listChatModels(): Promise<string[]> {
    try {
      // Return only the 4 supported models
      return [
        'models/gemini-2.5-pro',
        'models/gemini-2.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash'
      ];
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Test with a simple request to validate the API key
      await this.makeApiRequest<any>('/models/gemini-1.5-flash');
      return true;
    } catch (error: any) {
      console.error('API key validation error:', error);
      return false;
    }
  }
}
