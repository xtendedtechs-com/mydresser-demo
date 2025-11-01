/**
 * MyDresser AI Intelligence Layer
 * Custom AI orchestration system that sits on top of external AI services
 * Provides fashion-specific intelligence with context-aware responses
 */

import { supabase } from "@/integrations/supabase/client";

export type AIProvider = 'anthropic' | 'openai' | 'lovable';
export type AIModel = 
  | 'claude-sonnet-4-5' 
  | 'claude-opus-4-1' 
  | 'gpt-5' 
  | 'gpt-5-mini'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-pro';

export interface AIRequest {
  type: 'outfit_generation' | 'style_analysis' | 'chat' | 'recommendation' | 'trend_analysis';
  prompt: string;
  context?: {
    wardrobeItems?: any[];
    userPreferences?: any;
    weather?: any;
    styleProfile?: any;
  };
  model?: AIModel;
  provider?: AIProvider;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    model: string;
    provider: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

/**
 * MyDresser AI Orchestrator
 * Intelligent routing, context enhancement, and multi-model support
 */
export class MyDresserAIOrchestrator {
  private static instance: MyDresserAIOrchestrator;

  private constructor() {}

  static getInstance(): MyDresserAIOrchestrator {
    if (!this.instance) {
      this.instance = new MyDresserAIOrchestrator();
    }
    return this.instance;
  }

  /**
   * Main entry point for all AI requests
   * Routes to appropriate model based on task complexity and type
   */
  async process(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Select optimal model if not specified
      const { model, provider } = this.selectOptimalModel(request);
      
      // Enhance prompt with fashion domain knowledge
      const enhancedPrompt = this.enhancePrompt(request);
      
      // Add MyDresser-specific context
      const contextualPrompt = this.addContext(enhancedPrompt, request.context);
      
      // Route to appropriate AI service
      const response = await this.routeRequest({
        ...request,
        prompt: contextualPrompt,
        model,
        provider
      });
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: response,
        metadata: {
          model,
          provider,
          processingTime
        }
      };
    } catch (error: any) {
      console.error('MyDresser AI error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          model: request.model || 'unknown',
          provider: request.provider || 'unknown',
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Select optimal AI model based on task type and complexity
   */
  private selectOptimalModel(request: AIRequest): { model: AIModel; provider: AIProvider } {
    // High complexity tasks use Claude Sonnet 4.5 (superior reasoning)
    if (request.type === 'style_analysis' || request.type === 'trend_analysis') {
      return { model: 'claude-sonnet-4-5', provider: 'anthropic' };
    }
    
    // Outfit generation uses GPT-5 (excellent multimodal understanding)
    if (request.type === 'outfit_generation') {
      return { model: 'gpt-5', provider: 'openai' };
    }
    
    // Chat and recommendations use fast, efficient models
    if (request.type === 'chat' || request.type === 'recommendation') {
      return { model: 'google/gemini-2.5-flash', provider: 'lovable' };
    }
    
    // Default to Lovable AI (pre-configured, fast)
    return { model: 'google/gemini-2.5-flash', provider: 'lovable' };
  }

  /**
   * Enhance prompt with fashion domain expertise
   */
  private enhancePrompt(request: AIRequest): string {
    const domainKnowledge = this.getFashionDomainKnowledge(request.type);
    
    return `${domainKnowledge}\n\n${request.prompt}`;
  }

  /**
   * Fashion domain knowledge base
   */
  private getFashionDomainKnowledge(type: AIRequest['type']): string {
    const knowledgeBase = {
      outfit_generation: `You are MyDresser's AI fashion expert specializing in outfit coordination.
        
Key Principles:
- Color Harmony: Use complementary, analogous, or triadic color schemes
- Silhouette Balance: Mix fitted and loose pieces for proportion
- Occasion Appropriateness: Match formality to context
- Weather Adaptation: Layer appropriately for temperature and conditions
- Personal Style: Honor user's established aesthetic preferences
- Trend Awareness: Blend current trends with timeless pieces

Scoring Criteria:
- Color compatibility (0-30 points)
- Style cohesion (0-25 points)
- Occasion fit (0-20 points)
- Weather appropriateness (0-15 points)
- Novelty/freshness (0-10 points)`,

      style_analysis: `You are MyDresser's wardrobe analyst with deep fashion psychology expertise.

Analysis Framework:
- Style Personality: Identify dominant style archetypes (classic, bohemian, edgy, minimalist, romantic, etc.)
- Color Psychology: Analyze emotional resonance of color choices
- Brand Philosophy: Decode user values through brand preferences
- Wardrobe Gaps: Identify missing versatile pieces
- Sustainability Profile: Assess quality, longevity, and ethical considerations
- Cost-Per-Wear: Calculate value optimization opportunities

Provide actionable insights with specific recommendations.`,

      chat: `You are MyDresser's AI Style Consultant - friendly, knowledgeable, and personalized.

Communication Style:
- Warm and approachable, like a trusted friend
- Specific and actionable advice
- References user's actual wardrobe when relevant
- Suggests practical next steps
- Asks clarifying questions when needed

Always contextualize advice with user's existing pieces and preferences.`,

      recommendation: `You are MyDresser's smart recommendation engine.

Recommendation Logic:
- Collaborative Filtering: Suggest based on similar users
- Content-Based: Match item attributes to preferences
- Contextual: Consider season, weather, upcoming events
- Budget-Aware: Respect user's price comfort zone
- Diversity: Balance familiarity with discovery

Prioritize items that fill wardrobe gaps or complete existing outfits.`,

      trend_analysis: `You are MyDresser's fashion trend forecaster.

Analysis Approach:
- Identify emerging patterns in user behavior
- Cross-reference with runway and street style trends
- Consider cultural and social movements
- Assess sustainability and longevity
- Predict seasonal color palettes and silhouettes
- Differentiate micro-trends from lasting shifts

Provide data-driven insights with confidence levels.`
    };

    return knowledgeBase[type] || '';
  }

  /**
   * Add MyDresser-specific context to prompts
   */
  private addContext(prompt: string, context?: AIRequest['context']): string {
    if (!context) return prompt;

    let contextStr = '\n\n--- USER CONTEXT ---\n';

    if (context.wardrobeItems && context.wardrobeItems.length > 0) {
      contextStr += `\nWardrobe (${context.wardrobeItems.length} items):\n`;
      context.wardrobeItems.slice(0, 20).forEach((item: any) => {
        contextStr += `- ${item.category}: ${item.name} (${item.color || 'no color'}, ${item.brand || 'no brand'})\n`;
      });
    }

    if (context.weather) {
      contextStr += `\nWeather: ${context.weather.temperature}°C, ${context.weather.condition}\n`;
    }

    if (context.userPreferences) {
      contextStr += `\nPreferences: ${JSON.stringify(context.userPreferences, null, 2)}\n`;
    }

    if (context.styleProfile) {
      contextStr += `\nStyle Profile: ${JSON.stringify(context.styleProfile, null, 2)}\n`;
    }

    return prompt + contextStr;
  }

  /**
   * Route request to appropriate AI service
   */
  private async routeRequest(request: AIRequest & { model: AIModel; provider: AIProvider }): Promise<any> {
    const { provider, model, prompt, type } = request;

    // All providers route through edge functions for security
    const functionName = this.getEdgeFunctionName(provider, type);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        model,
        prompt,
        type,
        context: request.context
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get edge function name for provider and type
   */
  private getEdgeFunctionName(provider: AIProvider, type: AIRequest['type']): string {
    // For now, all routes through mydresser-ai
    return 'mydresser-ai';
  }
}

// Export singleton instance
export const myDresserAI = MyDresserAIOrchestrator.getInstance();
