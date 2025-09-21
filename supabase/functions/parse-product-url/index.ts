import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParsedProduct {
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  images?: string[];
  category?: string;
  color?: string;
  material?: string;
  size?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Parsing product from URL:', url);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.status}`);
    }

    const html = await response.text();
    const domain = new URL(url).hostname.toLowerCase();

    // Parse product information based on common e-commerce patterns
    const product: ParsedProduct = {
      name: 'Fashion Item',
      description: 'Imported fashion item',
      category: 'Tops',
      images: ['/placeholder.svg']
    };

    // Extract title from meta tags or page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                      html.match(/<meta[^>]*name="title"[^>]*content="([^"]+)"/i);
    
    if (titleMatch) {
      product.name = titleMatch[1].trim().replace(/\s+/g, ' ');
    }

    // Extract description
    const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) ||
                      html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    
    if (descMatch) {
      product.description = descMatch[1].trim();
    }

    // Extract price using common patterns
    const pricePatterns = [
      /\$([0-9]+\.?[0-9]*)/g,
      /£([0-9]+\.?[0-9]*)/g,
      /€([0-9]+\.?[0-9]*)/g,
      /"price"\s*:\s*"?([0-9]+\.?[0-9]*)"?/gi,
      /data-price="([0-9]+\.?[0-9]*)"/gi
    ];

    for (const pattern of pricePatterns) {
      const priceMatch = html.match(pattern);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(/[^0-9.]/g, ''));
        if (price && price > 0 && price < 10000) {
          product.price = price;
          break;
        }
      }
    }

    // Extract brand information
    const brandPatterns = [
      /"brand"\s*:\s*"([^"]+)"/gi,
      /<meta[^>]*property="product:brand"[^>]*content="([^"]+)"/i,
      /data-brand="([^"]+)"/gi
    ];

    for (const pattern of brandPatterns) {
      const brandMatch = html.match(pattern);
      if (brandMatch) {
        product.brand = brandMatch[1];
        break;
      }
    }

    // Domain-specific parsing
    if (domain.includes('asos.com')) {
      product.brand = product.brand || 'ASOS';
      // ASOS specific selectors could be added here
    } else if (domain.includes('zara.com')) {
      product.brand = product.brand || 'Zara';
    } else if (domain.includes('hm.com') || domain.includes('h&m.com')) {
      product.brand = product.brand || 'H&M';
    } else if (domain.includes('nike.com')) {
      product.brand = product.brand || 'Nike';
      product.category = 'Activewear';
    } else if (domain.includes('adidas.com')) {
      product.brand = product.brand || 'Adidas';
      product.category = 'Activewear';
    }

    // Extract images
    const imagePatterns = [
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
      /"image"\s*:\s*"([^"]+)"/gi,
      /data-src="([^"]+\.(?:jpg|jpeg|png|webp))"/gi
    ];

    for (const pattern of imagePatterns) {
      const imageMatch = html.match(pattern);
      if (imageMatch) {
        let imageUrl = imageMatch[1];
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = new URL(url).origin + imageUrl;
        }
        product.images = [imageUrl];
        break;
      }
    }

    // Extract color information
    const colorMatch = html.match(/"color"\s*:\s*"([^"]+)"/gi) ||
                       html.match(/data-color="([^"]+)"/gi);
    
    if (colorMatch) {
      product.color = colorMatch[0].replace(/[^a-zA-Z\s]/g, '').trim();
    }

    // Clean up the product name
    if (product.name) {
      product.name = product.name
        .replace(/\s*\|\s*.*$/, '') // Remove everything after |
        .replace(/\s*-\s*.*$/, '')  // Remove everything after -
        .replace(/\s+/g, ' ')       // Normalize whitespace
        .trim();
    }

    console.log('Parsed product:', product);

    return new Response(
      JSON.stringify(product),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error parsing product URL:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse product information',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})