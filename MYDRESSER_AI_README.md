# MyDresser AI Intelligence Layer

## Overview

The MyDresser AI Intelligence Layer is a sophisticated AI orchestration system that provides fashion-specific intelligence on top of external AI services. It combines the strengths of multiple AI models with deep fashion domain expertise to deliver superior results for wardrobe management, style analysis, and outfit recommendations.

## Architecture

### Core Components

1. **AIOrchestrator** (`src/services/myDresserAI/AIOrchestrator.ts`)
   - Central intelligence hub
   - Smart model routing
   - Context enhancement
   - Fashion domain knowledge injection

2. **Edge Function** (`supabase/functions/mydresser-ai/index.ts`)
   - Secure API key management
   - Multi-provider support (Anthropic, OpenAI, Lovable)
   - Request routing and error handling

### Supported AI Models

| Model | Provider | Use Case | Strengths |
|-------|----------|----------|-----------|
| `claude-sonnet-4-5` | Anthropic | Style Analysis, Trend Forecasting | Superior reasoning, nuanced understanding |
| `claude-opus-4-1` | Anthropic | Complex Fashion Analysis | Highest intelligence, detailed insights |
| `gpt-5` | OpenAI | Outfit Generation | Excellent multimodal, visual understanding |
| `gpt-5-mini` | OpenAI | Quick Recommendations | Fast, efficient, cost-effective |
| `google/gemini-2.5-flash` | Lovable | Chat, Quick Tasks | Very fast, pre-configured |
| `google/gemini-2.5-pro` | Lovable | Complex Multimodal | Strong at image + text |

## Request Types

### 1. Outfit Generation
Uses **GPT-5** for its excellent multimodal understanding.

```typescript
const response = await myDresserAI.process({
  type: 'outfit_generation',
  prompt: 'Create a business casual outfit for a 20°C spring day',
  context: {
    wardrobeItems: userWardrobe,
    weather: { temperature: 20, condition: 'partly cloudy' },
    userPreferences: { style: ['minimalist', 'classic'] }
  }
});
```

**Scoring Criteria:**
- Color compatibility (0-30 points)
- Style cohesion (0-25 points)
- Occasion fit (0-20 points)
- Weather appropriateness (0-15 points)
- Novelty/freshness (0-10 points)

### 2. Style Analysis
Uses **Claude Sonnet 4.5** for superior reasoning and psychological insights.

```typescript
const response = await myDresserAI.process({
  type: 'style_analysis',
  prompt: 'Analyze my wardrobe and identify my style personality',
  context: {
    wardrobeItems: userWardrobe,
    styleProfile: userStyleProfile
  }
});
```

**Analysis Framework:**
- Style Personality Identification
- Color Psychology Analysis
- Brand Philosophy Decoding
- Wardrobe Gap Detection
- Sustainability Profile Assessment
- Cost-Per-Wear Optimization

### 3. Chat Consultation
Uses **Gemini 2.5 Flash** for fast, friendly responses.

```typescript
const response = await myDresserAI.process({
  type: 'chat',
  prompt: 'What should I wear to a summer wedding?',
  context: {
    wardrobeItems: userWardrobe,
    userPreferences: preferences
  }
});
```

**Communication Style:**
- Warm and approachable
- Specific and actionable
- References actual wardrobe items
- Suggests practical next steps

### 4. Recommendations
Uses **Gemini 2.5 Flash** for efficient item suggestions.

```typescript
const response = await myDresserAI.process({
  type: 'recommendation',
  prompt: 'Suggest items to complete my wardrobe',
  context: {
    wardrobeItems: userWardrobe,
    styleProfile: userStyleProfile
  }
});
```

**Recommendation Logic:**
- Collaborative Filtering
- Content-Based Matching
- Contextual Awareness
- Budget-Conscious
- Diversity Balance

### 5. Trend Analysis
Uses **Claude Sonnet 4.5** for deep pattern recognition.

```typescript
const response = await myDresserAI.process({
  type: 'trend_analysis',
  prompt: 'What are the emerging fashion trends for fall?',
  context: {
    styleProfile: userStyleProfile
  }
});
```

**Analysis Approach:**
- Pattern identification in user behavior
- Runway and street style cross-reference
- Cultural and social movement consideration
- Sustainability assessment
- Seasonal forecasting
- Micro-trend vs. lasting shift differentiation

## Fashion Domain Knowledge

The AI Orchestrator injects fashion-specific knowledge into every request:

### Color Theory
- Complementary schemes
- Analogous palettes
- Triadic combinations
- Seasonal color analysis

### Silhouette Balance
- Proportion guidelines
- Body type considerations
- Fit and fabric interaction

### Style Archetypes
- Classic
- Bohemian
- Edgy
- Minimalist
- Romantic
- Streetwear
- Preppy

### Context Awareness
- Weather adaptation
- Occasion appropriateness
- Season-specific layering
- Cultural considerations

## Setup Requirements

### Required Secrets

Add these secrets in Supabase Edge Functions settings:

1. **ANTHROPIC_API_KEY** (Required for Claude models)
   - Get key from: https://console.anthropic.com/
   - Used for: Style analysis, trend forecasting

2. **OPENAI_API_KEY** (Required for GPT models)
   - Get key from: https://platform.openai.com/api-keys
   - Used for: Outfit generation, complex reasoning

3. **LOVABLE_API_KEY** (Auto-configured)
   - Pre-configured by Lovable
   - Used for: Chat, quick tasks

## Usage Examples

### Basic Usage

```typescript
import { myDresserAI } from '@/services/myDresserAI/AIOrchestrator';

// Automatic model selection
const result = await myDresserAI.process({
  type: 'outfit_generation',
  prompt: 'Create a casual weekend outfit',
  context: {
    wardrobeItems: items,
    weather: weather
  }
});

console.log(result.data);
console.log(`Used ${result.metadata.model} (${result.metadata.processingTime}ms)`);
```

### Manual Model Selection

```typescript
// Force specific model
const result = await myDresserAI.process({
  type: 'style_analysis',
  prompt: 'Deep analysis of my fashion psychology',
  model: 'claude-opus-4-1',  // Use most powerful model
  provider: 'anthropic',
  context: { wardrobeItems: items }
});
```

## Performance Considerations

### Model Selection Strategy

The orchestrator automatically selects models based on:

1. **Task Complexity**
   - Simple tasks → Fast models (Gemini Flash)
   - Complex reasoning → Claude Sonnet 4.5
   - Visual understanding → GPT-5

2. **Cost Optimization**
   - Frequent operations use efficient models
   - High-value tasks use premium models

3. **Latency Requirements**
   - Real-time chat → Gemini Flash (fastest)
   - Background analysis → Claude (quality over speed)

### Response Times

| Model | Avg Response | Use When |
|-------|--------------|----------|
| Gemini 2.5 Flash | 1-2s | User is waiting |
| GPT-5 Mini | 2-4s | Good balance needed |
| Claude Sonnet 4.5 | 3-6s | Quality is priority |
| GPT-5 | 4-7s | Multimodal required |
| Claude Opus 4.1 | 5-10s | Maximum intelligence |

## Error Handling

The orchestrator provides comprehensive error handling:

```typescript
const result = await myDresserAI.process(request);

if (!result.success) {
  console.error('AI Error:', result.error);
  console.log('Metadata:', result.metadata);
  
  // Handle specific errors
  if (result.error.includes('Rate limit')) {
    // Show rate limit message
  } else if (result.error.includes('credits')) {
    // Prompt for credit top-up
  }
}
```

## Future Enhancements

### Planned Features
- [ ] Multi-model ensemble (combine multiple models for consensus)
- [ ] Fine-tuned MyDresser models (custom training on fashion data)
- [ ] Streaming responses for chat
- [ ] Caching for common queries
- [ ] A/B testing for model performance
- [ ] User feedback loop for continuous improvement

### Advanced Capabilities
- [ ] Image generation for outfit visualization
- [ ] Voice-based style consultation
- [ ] Augmented reality try-on integration
- [ ] Personalized style evolution tracking
- [ ] Collaborative outfit planning

## Contributing

When extending the AI layer:

1. Add new request types to `AIRequest` interface
2. Create domain knowledge in `getFashionDomainKnowledge()`
3. Define model selection logic in `selectOptimalModel()`
4. Update edge function routing in `routeRequest()`
5. Document in this README

## Support

For issues or questions:
- Check edge function logs: Supabase Dashboard → Functions → mydresser-ai → Logs
- Review error messages in browser console
- Verify API keys are configured correctly
- Test with simpler models first (Gemini Flash) before complex ones

---

**Built with ❤️ for the MyDresser Fashion Operating System**
