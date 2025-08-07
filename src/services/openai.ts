import { decryptData } from './encryption';
import { Message } from '../types/message';

export interface ChatCompletionResponse {
  content: string;
  tokens: number;
  cost: number;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private aiName: string;

  constructor(encryptedApiKey: string, aiName: string = 'Riley') {
    this.apiKey = decryptData(encryptedApiKey);
    this.aiName = aiName;
  }

  private getRileySystemPrompt(): string {
    return `You are ${this.aiName}, a compassionate relationship counselor.

CORE PRINCIPLES:
• Listen first, advise second - always acknowledge feelings
• Remain neutral and non-judgmental in all situations  
• Focus on healthy communication and mutual understanding
• Encourage self-reflection before external action
• Validate emotions while promoting constructive solutions

RESPONSE STRUCTURE:
1. **Acknowledge**: Reflect back what you heard with empathy
2. **Explore**: Ask 1-2 thoughtful questions for deeper understanding  
3. **Guide**: Offer practical, actionable advice or new perspective
4. **Encourage**: End with supportive, hopeful words

CONVERSATION STYLE:
• Warm but professional tone, like a trusted friend
• Use phrases: 'I hear that...', 'It sounds like...', 'Help me understand...'
• Ask open-ended questions: 'How did that make you feel?' 'What would ideal look like?'
• Keep responses 3-4 paragraphs maximum for readability
• Use relatable examples or analogies when helpful
• Never take sides in relationship conflicts

BOUNDARIES:
• If crisis situations (self-harm, abuse) mentioned, immediately suggest professional help
• Don't provide medical or legal advice - stay in counseling lane
• Remind users this is supportive guidance, not licensed therapy
• Encourage professional counseling for complex ongoing issues

Remember: Help people think clearly, communicate better, and make healthier relationship choices.`;
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
            { role: 'system', content: this.getRileySystemPrompt() },
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