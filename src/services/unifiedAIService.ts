/**
 * Unified AI Service - Central hub for all AI/ML operations
 * Consolidates AI functionality and provides consistent interface
 */

import { supabase } from '@/integrations/supabase/client';
import { myDresserAI } from './myDresserAI';
import { WardrobeItem } from '@/hooks/useWardrobe';

export interface AIRequest {
  type: 'outfit' | 'style' | 'trend' | 'chat' | 'analysis' | 'recommendation';
  data: any;
  context?: any;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  confidence?: number;
  reasoning?: string[];
}

class UnifiedAIService {
  private static instance: UnifiedAIService;
  private requestQueue: AIRequest[] = [];
  private processing = false;

  private constructor() {}

  static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService();
    }
    return UnifiedAIService.instance;
  }

  /**
   * Main entry point for all AI requests
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      switch (request.type) {
        case 'outfit':
          return await this.handleOutfitRequest(request);
        case 'style':
          return await this.handleStyleRequest(request);
        case 'trend':
          return await this.handleTrendRequest(request);
        case 'chat':
          return await this.handleChatRequest(request);
        case 'analysis':
          return await this.handleAnalysisRequest(request);
        case 'recommendation':
          return await this.handleRecommendationRequest(request);
        default:
          return {
            success: false,
            error: 'Unknown request type'
          };
      }
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle outfit generation requests
   */
  private async handleOutfitRequest(request: AIRequest): Promise<AIResponse> {
    const { wardrobeItems, occasion, weather, preferences } = request.data;

    try {
      // Use local AI first for quick response
      const styleProfile = await myDresserAI.generatePersonalStyleProfile(
        wardrobeItems,
        preferences
      );

      const recommendations = await myDresserAI.generateSmartRecommendations(
        wardrobeItems,
        styleProfile,
        { occasion, weather, ...request.context }
      );

      const outfitRecs = recommendations.filter(r => r.type === 'outfit');

      if (outfitRecs.length > 0) {
        return {
          success: true,
          data: {
            outfit: outfitRecs[0],
            alternatives: outfitRecs.slice(1, 3),
            styleProfile
          },
          confidence: outfitRecs[0].confidence,
          reasoning: outfitRecs[0].reasoning
        };
      }

      // Fallback to cloud AI if local fails
      return await this.callCloudAI('ai-outfit-suggestions', request.data);
    } catch (error) {
      console.error('Outfit generation error:', error);
      return {
        success: false,
        error: 'Failed to generate outfit'
      };
    }
  }

  /**
   * Handle style analysis requests
   */
  private async handleStyleRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const { wardrobeItems, preferences } = request.data;
      const styleProfile = await myDresserAI.generatePersonalStyleProfile(
        wardrobeItems,
        preferences
      );

      return {
        success: true,
        data: styleProfile,
        confidence: 0.85
      };
    } catch (error) {
      return {
        success: false,
        error: 'Style analysis failed'
      };
    }
  }

  /**
   * Handle trend analysis requests
   */
  private async handleTrendRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await this.callCloudAI('ai-trend-analysis', request.data);
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Trend analysis failed'
      };
    }
  }

  /**
   * Handle chat requests with streaming support
   */
  private async handleChatRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const { message, history, wardrobeContext } = request.data;
      
      // Build context from wardrobe if available
      const contextPrompt = wardrobeContext
        ? `User's wardrobe: ${wardrobeContext.length} items including ${wardrobeContext.slice(0, 5).map((i: any) => i.name).join(', ')}`
        : '';

      return await this.callCloudAI('ai-style-chat', {
        messages: [...(history || []), { role: 'user', content: message }],
        context: contextPrompt
      });
    } catch (error) {
      return {
        success: false,
        error: 'Chat request failed'
      };
    }
  }

  /**
   * Handle wardrobe analysis requests
   */
  private async handleAnalysisRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await this.callCloudAI('ai-wardrobe-insights', request.data);
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Analysis failed'
      };
    }
  }

  /**
   * Handle recommendation requests
   */
  private async handleRecommendationRequest(
    request: AIRequest
  ): Promise<AIResponse> {
    try {
      const { wardrobeItems, styleProfile, context } = request.data;

      const recommendations = await myDresserAI.generateSmartRecommendations(
        wardrobeItems,
        styleProfile,
        context
      );

      return {
        success: true,
        data: recommendations,
        confidence: 0.8
      };
    } catch (error) {
      return {
        success: false,
        error: 'Recommendation generation failed'
      };
    }
  }

  /**
   * Call cloud AI edge functions
   */
  private async callCloudAI(
    functionName: string,
    data: any
  ): Promise<AIResponse> {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        functionName,
        {
          body: data
        }
      );

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('429')) {
          return {
            success: false,
            error: 'Rate limit exceeded. Please try again in a moment.'
          };
        }
        if (error.message?.includes('402')) {
          return {
            success: false,
            error: 'AI credits depleted. Please add credits to continue.'
          };
        }
        throw error;
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Cloud AI error:', error);
      return {
        success: false,
        error: 'Cloud AI request failed'
      };
    }
  }

  /**
   * Stream chat responses (for real-time chat)
   */
  async streamChat(
    message: string,
    onChunk: (text: string) => void,
    context?: any
  ): Promise<void> {
    const CHAT_URL = `https://bdfyrtobxkwxobjspxjo.supabase.co/functions/v1/ai-style-consultant`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZnlydG9ieGt3eG9ianNweGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjU3NzEsImV4cCI6MjA3MzM0MTc3MX0.Ck8RUCFUdezGr46gj_4caj-kBegzp_O7nzqR0AelCmc`
        },
        body: JSON.stringify({
          message,
          context
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {
            console.warn('Failed to parse chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple requests efficiently
   */
  async batchProcess(requests: AIRequest[]): Promise<AIResponse[]> {
    const results = await Promise.allSettled(
      requests.map(req => this.processRequest(req))
    );

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        success: false,
        error: result.reason?.message || 'Request failed'
      };
    });
  }

  /**
   * Get AI service health and status
   */
  async getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, boolean>;
  }> {
    const services = {
      localAI: true, // Always available
      cloudAI: false,
      ml: false
    };

    try {
      // Quick health check for cloud AI
      const { error } = await supabase.functions.invoke('ai-style-chat', {
        body: { action: 'health_check' }
      });
      services.cloudAI = !error;
    } catch {
      services.cloudAI = false;
    }

    const healthyServices = Object.values(services).filter(Boolean).length;
    const status =
      healthyServices === 3
        ? 'healthy'
        : healthyServices > 0
        ? 'degraded'
        : 'down';

    return { status, services };
  }
}

export const unifiedAI = UnifiedAIService.getInstance();
export default unifiedAI;
