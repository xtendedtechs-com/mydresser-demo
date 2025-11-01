import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model, prompt, type, context } = await req.json();
    
    console.log('MyDresser AI request:', { model, type });

    // Determine which API to use based on model
    if (model.startsWith('claude')) {
      return await handleAnthropicRequest(model, prompt, type, context);
    } else if (model.startsWith('gpt')) {
      return await handleOpenAIRequest(model, prompt, type, context);
    } else if (model.startsWith('google')) {
      return await handleLovableRequest(model, prompt, type, context);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error: any) {
    console.error('MyDresser AI error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleAnthropicRequest(model: string, prompt: string, type: string, context: any) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY secret.');
  }

  console.log('Calling Anthropic API with model:', model);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Try to parse as JSON for structured responses
  try {
    const parsed = JSON.parse(content);
    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: true, data: { response: content } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleOpenAIRequest(model: string, prompt: string, type: string, context: any) {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY secret.');
  }

  console.log('Calling OpenAI API with model:', model);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 4096
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Try to parse as JSON for structured responses
  try {
    const parsed = JSON.parse(content);
    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: true, data: { response: content } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleLovableRequest(model: string, prompt: string, type: string, context: any) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('Lovable API key not configured');
  }

  console.log('Calling Lovable AI with model:', model);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (response.status === 429) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (response.status === 402) {
    return new Response(
      JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
      { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!response.ok) {
    const error = await response.text();
    console.error('Lovable AI error:', error);
    throw new Error(`Lovable AI error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Try to parse as JSON for structured responses
  try {
    const parsed = JSON.parse(content);
    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: true, data: { response: content } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
