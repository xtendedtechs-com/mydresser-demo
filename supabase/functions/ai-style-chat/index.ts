import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { message, session_id, conversationHistory } = await req.json()

    console.log('Processing chat message:', message)
    
    // Handle conversation history as array (for context-aware responses)
    const history = Array.isArray(conversationHistory) ? conversationHistory : []
    const recentMessages = history.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join('\n')

    const { data: rateCheck, error: rateError } = await supabase
      .rpc('check_ai_rate_limit', {
        p_user_id: user.id,
        p_service_type: 'chat'
      })

    if (rateError) {
      console.error('Rate limit check error:', rateError)
      throw rateError
    }

    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          reset_at: rateCheck.reset_at
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { data: styleProfile } = await supabase
      .from('user_style_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: wardrobeItems } = await supabase
      .from('wardrobe_items')
      .select('category, color, brand, style')
      .eq('user_id', user.id)
      .limit(20)

    const context = {
      style_profile: styleProfile || {},
      wardrobe_summary: wardrobeItems || [],
      user_preferences: styleProfile?.style_preferences || {}
    }

    let response = ''
    
    // Enhanced context with conversation history
    const contextPrompt = recentMessages ? `Recent conversation:\n${recentMessages}\n\n` : ''

    if (message.toLowerCase().includes('outfit')) {
      response = `Based on your wardrobe, I'd suggest combining your ${wardrobeItems?.[0]?.color || 'favorite'} ${wardrobeItems?.[0]?.category || 'top'} with complementary pieces. Would you like specific recommendations for today's weather?`
    } else if (message.toLowerCase().includes('color')) {
      const colors = styleProfile?.color_palette?.primary || ['blue', 'black', 'white']
      response = `Your style profile shows you gravitate towards ${colors.join(', ')}. These colors work well together! Have you considered adding ${colors[0] === 'blue' ? 'coral' : 'teal'} as an accent color?`
    } else if (message.toLowerCase().includes('trend')) {
      response = `Current trends include oversized silhouettes and earth tones. Based on your ${styleProfile?.sustainability_preference || 'medium'} sustainability preference, I can recommend brands that align with these trends sustainably.`
    } else if (message.toLowerCase().includes('wardrobe') || message.toLowerCase().includes('analyze')) {
      const itemCount = wardrobeItems?.length || 0
      response = `I see you have ${itemCount} items in your wardrobe. Your collection shows a ${styleProfile?.style_personality?.[0] || 'versatile'} style. Would you like me to identify gaps or suggest new combinations?`
    } else {
      response = `I'm here to help with your style! I can suggest outfits, analyze your wardrobe, recommend colors, or discuss fashion trends. What interests you most right now?`
    }

    await supabase.rpc('track_ai_usage', {
      p_user_id: user.id,
      p_service_type: 'chat',
      p_tokens_used: 150,
      p_cost_credits: 0.001
    })

    if (message.toLowerCase().includes('suggest') || message.toLowerCase().includes('recommend')) {
      await supabase
        .from('ai_style_recommendations')
        .insert({
          user_id: user.id,
          recommendation_type: 'style',
          recommendation_data: { message, response },
          reasoning: 'AI chat suggestion based on user query',
          confidence_score: 0.75,
          context
        })
    }

    console.log('Chat response generated successfully')

    return new Response(
      JSON.stringify({ 
        response,
        usage: {
          tokens: 150,
          cost: 0.001
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in ai-style-chat:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
