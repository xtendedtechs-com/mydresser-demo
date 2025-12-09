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
    const startTime = Date.now();
    const { userImage, clothingItems, instruction } = await req.json();

    if (!userImage || !clothingItems || clothingItems.length === 0) {
      throw new Error('Missing required parameters: userImage and clothingItems are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('Lovable AI API key not configured');
    }

    console.log('Processing VTO request with', clothingItems.length, 'items');

    // Build the clothing description for the prompt
    const clothingDescription = clothingItems.map((item: any, index: number) => {
      const parts = [`${index + 1}. ${item.name} (${item.category})`];
      if (item.color) parts.push(`- Color: ${item.color}`);
      if (item.brand) parts.push(`- Brand: ${item.brand}`);
      return parts.join(' ');
    }).join('\n');

    // Check if we have clothing images to include
    const clothingWithPhotos = clothingItems.filter((item: any) => item.photo && item.photo.startsWith('data:'));
    const hasClothingImages = clothingWithPhotos.length > 0;
    
    console.log(`Found ${clothingWithPhotos.length} clothing items with photos`);

    // Build the VTO prompt - different based on whether we have clothing images
    const vtoPrompt = instruction || (hasClothingImages 
      ? `You are a virtual try-on assistant. I'm providing images of specific clothing items that need to be applied to the person in the first image.

CLOTHING ITEMS TO APPLY:
${clothingDescription}

The clothing item images are provided after the person's photo. Apply EXACTLY these clothes to the person.

CRITICAL REQUIREMENTS:
- Keep the person's face, hair, skin tone, and body pose exactly the same
- Replace/add ONLY the clothing items shown in the reference images
- Match the exact colors, patterns, and style of the provided clothing images
- Make the clothing fit naturally on the body with proper proportions
- Maintain realistic lighting, shadows, and fabric textures matching the scene
- The result should look like a natural photograph
- Do NOT change the background or anything other than the clothing`
      : `You are a virtual try-on assistant. Edit this image of a person to show them wearing the following clothing items naturally and realistically:

${clothingDescription}

CRITICAL REQUIREMENTS:
- Keep the person's face, hair, skin tone, and body pose exactly the same
- Only change/add the clothing items listed above
- Make the clothing fit naturally on the body with proper proportions
- Maintain realistic lighting, shadows, and fabric textures
- The result should look like a natural photograph
- Do NOT change the background or anything other than the clothing`);

    console.log('Calling Lovable AI Gateway (Nano Banana) for VTO...');

    // Build content array with user image first, then clothing images
    const contentArray: any[] = [
      {
        type: "text",
        text: vtoPrompt
      },
      {
        type: "image_url",
        image_url: {
          url: userImage
        }
      }
    ];

    // Add clothing item images if available
    if (hasClothingImages) {
      for (const item of clothingWithPhotos) {
        contentArray.push({
          type: "text",
          text: `[${item.name} - ${item.category}]:`
        });
        contentArray.push({
          type: "image_url",
          image_url: {
            url: item.photo
          }
        });
      }
    }

    // Call Lovable AI Gateway with image editing capability
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: contentArray
          }
        ],
        modalities: ["image", "text"]
      })
    });

    console.log('Lovable AI response status:', response.status);

    // Handle rate limits and payment errors
    if (response.status === 429) {
      console.error('Rate limit exceeded');
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please wait a moment and try again.',
        code: 'RATE_LIMITED',
        imageUrl: null
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (response.status === 402) {
      console.error('Payment required - out of credits');
      return new Response(JSON.stringify({ 
        error: 'AI credits exhausted. Please add funds to your Lovable workspace.',
        code: 'PAYMENT_REQUIRED',
        imageUrl: null
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from Lovable AI');

    // Extract the generated image from the response
    const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!editedImageUrl) {
      console.error('No image in response:', JSON.stringify(data).slice(0, 500));
      throw new Error('No image generated by AI service');
    }

    console.log('VTO completed successfully');

    return new Response(JSON.stringify({
      success: true,
      imageUrl: editedImageUrl,
      editedImageUrl: editedImageUrl,
      processingTime: Date.now() - startTime,
      message: data.choices?.[0]?.message?.content || 'Virtual try-on completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-virtual-tryon function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
      imageUrl: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
