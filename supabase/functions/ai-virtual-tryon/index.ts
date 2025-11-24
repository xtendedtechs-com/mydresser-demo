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

    // Google Cloud API credentials
    const PROJECT_ID = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID');
    const API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    
    if (!PROJECT_ID || !API_KEY) {
      console.error('No Google Cloud credentials configured');
      throw new Error('Google Cloud credentials not configured. Please add GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_API_KEY secrets.');
    }

    // Validate and process user image
    const processImage = async (src: string): Promise<string> => {
      if (typeof src !== 'string' || !src) {
        throw new Error('Invalid user image: must be a non-empty string');
      }
      
      // If already a data URL, validate format and size
      if (src.startsWith('data:')) {
        const match = src.match(/^data:image\/(jpeg|jpg|png|webp);base64,/);
        if (!match) {
          throw new Error('Unsupported image format. Please use JPEG, PNG, or WebP.');
        }
        
        // Check data URL size (max ~4MB)
        const base64Data = src.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 4) {
          throw new Error(`Image too large (${sizeInMB.toFixed(1)}MB). Please use an image under 4MB.`);
        }
        
        console.log(`Image size: ${sizeInMB.toFixed(2)}MB`);
        return base64Data; // Return just the base64 data without the data URL prefix
      }
      
      // For HTTP(S) URLs, fetch and convert
      try {
        console.log('Fetching image from URL:', src.substring(0, 100));
        const res = await fetch(src);
        if (!res.ok) {
          throw new Error(`Image fetch failed with status ${res.status}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
        }
        
        const arrayBuffer = await res.arrayBuffer();
        const sizeInMB = arrayBuffer.byteLength / (1024 * 1024);
        
        if (sizeInMB > 4) {
          throw new Error(`Image too large (${sizeInMB.toFixed(1)}MB). Please use an image under 4MB.`);
        }
        
        console.log(`Fetched image: ${sizeInMB.toFixed(2)}MB, type: ${contentType}`);
        
        // Convert to base64
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      } catch (e) {
        console.error('Image processing failed:', e);
        throw new Error(`Failed to process image: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    };

    const processedImageBase64 = await processImage(userImage);

    console.log('Processing virtual try-on request with', clothingItems.length, 'items...');

    // Build detailed outfit description
    const outfitDescription = clothingItems.map((item: any) => {
      const parts = [item.category, item.name];
      if (item.color) parts.push(`in ${item.color}`);
      if (item.brand) parts.push(`by ${item.brand}`);
      return parts.join(' ');
    }).join(', ');

    console.log('Outfit description:', outfitDescription);

    // Construct detailed VTO prompt for Vertex AI Imagen
    const vtoPrompt = instruction || 
      `Create a photorealistic virtual try-on image by editing the person in the provided reference image to be wearing these exact clothing items: ${outfitDescription}. 
      
CRITICAL REQUIREMENTS:
- Preserve the person's face, facial features, hair, skin tone, body pose, and background exactly as shown in the reference image
- Only modify the clothing to match the specified items
- Ensure realistic lighting, shadows, fabric textures, proper fit, and natural proportions
- Match the perspective and style of the original photo
- Do not alter anything except the clothing`;

    console.log('Calling Google Vertex AI Imagen for virtual try-on...');

    // Vertex AI Imagen API endpoint
    const location = 'us-central1';
    const model = 'imagegeneration@006';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${location}/publishers/google/models/${model}:predict`;

    // Call Vertex AI Imagen API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: vtoPrompt,
            image: {
              bytesBase64Encoded: processedImageBase64
            }
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          compressionQuality: 90,
          mode: "edit-image"
        }
      })
    });

    console.log('Vertex AI response status:', response.status);

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 403) {
      return new Response(
        JSON.stringify({ error: "API key invalid or insufficient permissions. Please check your Google Cloud credentials." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI error:', response.status, errorText);
      throw new Error(`Vertex AI returned error ${response.status}. Please check your credentials and try again.`);
    }

    const data = await response.json();
    console.log('Vertex AI response structure:', JSON.stringify(data, null, 2).slice(0, 500));

    // Extract the generated image from Vertex AI response
    let editedImage = null;
    
    if (data.predictions?.[0]?.bytesBase64Encoded) {
      editedImage = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
    }

    if (!editedImage) {
      console.error('No image in Vertex AI response. Full response:', JSON.stringify(data, null, 2));
      throw new Error('Vertex AI did not generate an image. Please try again.');
    }

    console.log('Virtual try-on completed successfully with Vertex AI Imagen');

    return new Response(
      JSON.stringify({ 
        imageUrl: editedImage,
        processingTime: Date.now() - startTime,
        sizeRecommendations: { top: 'M', bottom: 'M', confidence: 0.7 },
        bodyShape: 'rectangle'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Virtual try-on error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        imageUrl: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
