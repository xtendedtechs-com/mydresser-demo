/**
 * Photo Helpers - Utilities for handling different photo formats consistently
 */

import placeholderWardrobe from '@/assets/placeholder-wardrobe.jpg';
import placeholderTops from '@/assets/placeholder-tops.jpg';
import placeholderBottoms from '@/assets/placeholder-bottoms.jpg';
import { supabase } from '@/integrations/supabase/client';

export type PhotoData = string | string[] | { main?: string; urls?: string[] } | null | undefined;

/**
 * Gets a placeholder image based on category
 * @param category - Item category
 * @returns Path to placeholder image
 */
export const getCategoryPlaceholderImage = (category?: string): string => {
  const placeholders: Record<string, string> = {
    tops: placeholderTops,
    bottoms: placeholderBottoms,
    default: placeholderWardrobe
  };

  return placeholders[category?.toLowerCase() || 'default'] || placeholders.default;
};

/**
 * Extract a string URL from many possible shapes (object, nested, etc.)
 */
const extractUrl = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  // Common object shapes
  if (typeof val === 'object') {
    // Supabase upload results or stored shapes
    if (typeof val.publicUrl === 'string') return val.publicUrl;
    if (typeof val.url === 'string') return val.url;
    if (typeof val.src === 'string') return val.src;
    if (typeof val.path === 'string') return val.path; // may be a storage path
  }
  return null;
};

/**
 * Resolves any Supabase Storage path to a public URL
 * For private buckets, it will attempt to create a signed URL
 */
const resolvePublicUrl = async (input: string): Promise<string> => {
  if (!input) return '';
  const trimmed = input.trim();
  
  // Keep http(s), data URIs, and local paths as-is
  // FILTER OUT blob URLs - they're temporary and won't work
  if (trimmed.startsWith('http') || 
      trimmed.startsWith('data:image/') || 
      trimmed.startsWith('/src/') ||
      trimmed.startsWith('/assets/') ||
      trimmed.startsWith('/public/') ||
      trimmed === '/placeholder.svg' ||
      trimmed.includes('/placeholder')) {
    return trimmed;
  }
  
  // Return empty for blob URLs
  if (trimmed.startsWith('blob:')) {
    return '';
  }

  // Decode URI-encoded strings if present
  const decoded = (() => {
    try { return decodeURIComponent(trimmed); } catch { return trimmed; }
  })();

  // Parse storage path from URL
  const publicMatch = decoded.match(/^\/?storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (publicMatch) {
    const bucket = publicMatch[1];
    const path = publicMatch[2];
    
    // Try to create a signed URL for private buckets
    try {
      const { data: signedData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour expiry
      
      if (signedData?.signedUrl) {
        return signedData.signedUrl;
      }
    } catch (e) {
      console.warn('Could not create signed URL, falling back to public URL:', e);
    }
    
    // Fallback to public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl || decoded;
  }

  // storage://bucket/path scheme
  const protoMatch = decoded.match(/^storage:\/\/([^/]+)\/(.+)/);
  if (protoMatch) {
    const bucket = protoMatch[1];
    const path = protoMatch[2];
    
    // Try signed URL first
    try {
      const { data: signedData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600);
      
      if (signedData?.signedUrl) {
        return signedData.signedUrl;
      }
    } catch (e) {
      console.warn('Could not create signed URL:', e);
    }
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl || decoded;
  }

  // Try to detect known bucket prefix: `${bucket}/${path}`
  const knownBuckets = [
    'wardrobe-items',
    'wardrobe-photos',
    'wardrobe',
    'merchant-products',
    'outfits',
    'user-avatars',
    'market-items',
    'merchant-uploads',
    'profile-photos',
    'user-photos',
    'profile-avatars',
    'avatars',
    'products',
    'items',
    'vto-photos'
  ];

  const firstSlash = decoded.indexOf('/');
  if (firstSlash > 0) {
    const bucket = decoded.slice(0, firstSlash);
    const path = decoded.slice(firstSlash + 1);
    if (knownBuckets.includes(bucket) && path) {
      // Try signed URL first
      try {
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600);
        
        if (signedData?.signedUrl) {
          return signedData.signedUrl;
        }
      } catch (e) {
        console.warn('Could not create signed URL:', e);
      }
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl || decoded;
    }
  }

  // If it's just a path without bucket, try common buckets
  if (!decoded.startsWith('http') && !decoded.includes('://') && !decoded.startsWith('/')) {
    for (const bucket of ['wardrobe-items', 'wardrobe-photos', 'wardrobe', 'items', 'vto-photos']) {
      // Try signed URL first
      try {
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(decoded, 3600);
        
        if (signedData?.signedUrl) {
          return signedData.signedUrl;
        }
      } catch (e) {
        // Continue to next bucket
      }
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(decoded);
      if (data.publicUrl) return data.publicUrl;
    }
  }

  return decoded;
};

/**
 * Extracts a primary photo URL from various photo data formats
 * @param photos - Photo data in various formats
 * @param category - Item category for smart placeholder selection
 * @returns The primary photo URL or category-appropriate placeholder
 */
/**
 * Synchronous wrapper that returns placeholder immediately if async resolution needed
 * For async resolution, use getPrimaryPhotoUrlAsync
 */
export const getPrimaryPhotoUrl = (photos: PhotoData, category?: string): string => {
  if (!photos) return getCategoryPlaceholderImage(category);

  // Handle string URL - return as-is for now, caller can resolve async if needed
  if (typeof photos === 'string') {
    if (!photos || photos === '/placeholder.svg' || photos.includes('/placeholder')) {
      return getCategoryPlaceholderImage(category);
    }
    // For storage URLs, return as-is; caller will handle async resolution
    return photos;
  }

  // Handle array (strings or objects)
  if (Array.isArray(photos)) {
    for (const entry of photos) {
      const raw = extractUrl(entry) || (typeof entry === 'string' ? entry : null);
      if (raw && raw !== '/placeholder.svg' && !raw.includes('/placeholder')) {
        return raw;
      }
    }
    return getCategoryPlaceholderImage(category);
  }

  // Handle object with main/urls or arbitrary shapes
  if (typeof photos === 'object') {
    const p: any = photos;
    // Check "main" first (string or object)
    const mainUrl = extractUrl(p.main);
    if (mainUrl && mainUrl !== '/placeholder.svg' && !mainUrl.includes('/placeholder')) {
      return mainUrl;
    }

    // Check urls array (can be strings or objects)
    if (Array.isArray(p.urls) && p.urls.length > 0) {
      for (const u of p.urls) {
        const raw = extractUrl(u) || (typeof u === 'string' ? u : null);
        if (raw && raw !== '/placeholder.svg' && !raw.includes('/placeholder')) {
          return raw;
        }
      }
    }

    // Sometimes photos could be stored as { url: "..." }
    const direct = extractUrl(p);
    if (direct && direct !== '/placeholder.svg' && !direct.includes('/placeholder')) {
      return direct;
    }
  }

  return getCategoryPlaceholderImage(category);
};

/**
 * Async version that properly resolves storage URLs to signed URLs
 */
export const getPrimaryPhotoUrlAsync = async (photos: PhotoData, category?: string): Promise<string> => {
  if (!photos) return getCategoryPlaceholderImage(category);

  // Handle string URL
  if (typeof photos === 'string') {
    const normalized = await resolvePublicUrl(photos);
    if (!normalized || normalized === '/placeholder.svg' || normalized.includes('/placeholder')) {
      return getCategoryPlaceholderImage(category);
    }
    return normalized;
  }

  // Handle array (strings or objects)
  if (Array.isArray(photos)) {
    for (const entry of photos) {
      const raw = extractUrl(entry) || (typeof entry === 'string' ? entry : null);
      if (raw) {
        const normalized = await resolvePublicUrl(raw);
        if (normalized && normalized !== '/placeholder.svg' && !normalized.includes('/placeholder')) {
          return normalized;
        }
      }
    }
    return getCategoryPlaceholderImage(category);
  }

  // Handle object with main/urls or arbitrary shapes
  if (typeof photos === 'object') {
    const p: any = photos;
    const mainUrl = extractUrl(p.main);
    if (mainUrl) {
      const normalized = await resolvePublicUrl(mainUrl);
      if (normalized && normalized !== '/placeholder.svg' && !normalized.includes('/placeholder')) {
        return normalized;
      }
    }

    if (Array.isArray(p.urls) && p.urls.length > 0) {
      for (const u of p.urls) {
        const raw = extractUrl(u) || (typeof u === 'string' ? u : null);
        if (raw) {
          const normalized = await resolvePublicUrl(raw);
          if (normalized && normalized !== '/placeholder.svg' && !normalized.includes('/placeholder')) {
            return normalized;
          }
        }
      }
    }

    const direct = extractUrl(p);
    if (direct) {
      const normalized = await resolvePublicUrl(direct);
      if (normalized && normalized !== '/placeholder.svg' && !normalized.includes('/placeholder')) {
        return normalized;
      }
    }
  }

  return getCategoryPlaceholderImage(category);
};

/**
 * Extracts all photo URLs from various photo data formats
 * Filters out blob URLs as they're temporary
 * @param photos - Photo data in various formats
 * @returns Array of photo URLs
 */
/**
 * Synchronous version - returns raw URLs
 */
export const getAllPhotoUrls = (photos: PhotoData): string[] => {
  if (!photos) return [];

  // Handle string URL
  if (typeof photos === 'string') {
    return photos ? [photos] : [];
  }

  // Handle array (strings or objects)
  if (Array.isArray(photos)) {
    const urls: string[] = [];
    for (const entry of photos) {
      const raw = extractUrl(entry) || (typeof entry === 'string' ? entry : null);
      if (raw) urls.push(raw);
    }
    return Array.from(new Set(urls.filter(Boolean)));
  }

  // Handle object with urls and/or main property (allow nested shapes)
  if (typeof photos === 'object') {
    const p: any = photos;
    const urls: string[] = [];
    const main = extractUrl(p.main);
    if (main) urls.push(main);
    if (Array.isArray(p.urls)) {
      for (const u of p.urls) {
        const raw = extractUrl(u) || (typeof u === 'string' ? u : null);
        if (raw) urls.push(raw);
      }
    }
    const direct = extractUrl(p);
    if (direct) urls.push(direct);
    return Array.from(new Set(urls.filter(Boolean)));
  }

  return [];
};

/**
 * Async version that properly resolves all photo URLs
 */
export const getAllPhotoUrlsAsync = async (photos: PhotoData): Promise<string[]> => {
  if (!photos) return [];

  // Handle string URL
  if (typeof photos === 'string') {
    const normalized = await resolvePublicUrl(photos);
    return normalized ? [normalized] : [];
  }

  // Handle array (strings or objects)
  if (Array.isArray(photos)) {
    const urls: string[] = [];
    for (const entry of photos) {
      const raw = extractUrl(entry) || (typeof entry === 'string' ? entry : null);
      if (raw) {
        const resolved = await resolvePublicUrl(raw);
        urls.push(resolved);
      }
    }
    return Array.from(new Set(urls.filter(Boolean)));
  }

  // Handle object with urls and/or main property
  if (typeof photos === 'object') {
    const p: any = photos;
    const urls: string[] = [];
    const main = extractUrl(p.main);
    if (main) {
      const resolved = await resolvePublicUrl(main);
      urls.push(resolved);
    }
    if (Array.isArray(p.urls)) {
      for (const u of p.urls) {
        const raw = extractUrl(u) || (typeof u === 'string' ? u : null);
        if (raw) {
          const resolved = await resolvePublicUrl(raw);
          urls.push(resolved);
        }
      }
    }
    const direct = extractUrl(p);
    if (direct) {
      const resolved = await resolvePublicUrl(direct);
      urls.push(resolved);
    }
    return Array.from(new Set(urls.filter(Boolean)));
  }

  return [];
};

/**
 * Formats photo data for database storage
 * @param photos - Photo URLs to store
 * @returns Formatted photo data for database
 */
export const formatPhotosForStorage = (photos: string | string[]): any => {
  if (!photos) return null;
  
  if (typeof photos === 'string') {
    return { main: photos };
  }
  
  if (Array.isArray(photos)) {
    if (photos.length === 0) return null;
    if (photos.length === 1) return { main: photos[0] };
    return { main: photos[0], urls: photos };
  }
  
  return null;
};

/**
 * Validates if a URL is a valid image URL
 * @param url - URL to validate
 * @returns True if valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  if (imageExtensions.test(url)) return true;
  
  // Check for data URLs
  if (url.startsWith('data:image/')) return true;
  
  // Check for Supabase storage URLs
  if (url.includes('supabase') && url.includes('storage')) return true;
  
  // Check for local assets
  if (url.startsWith('/src/assets/')) return true;
  
  return false;
};

/**
 * Gets a placeholder emoji based on category
 * @param category - Item category
 * @returns Emoji for the category
 */
export const getCategoryPlaceholder = (category?: string): string => {
  const placeholders: Record<string, string> = {
    tops: '👕',
    bottoms: '👖',
    dresses: '👗',
    outerwear: '🧥',
    shoes: '👟',
    accessories: '👜',
    activewear: '🏃',
    formal: '👔',
    casual: '👕',
    default: '👔'
  };

  return placeholders[category?.toLowerCase() || 'default'] || placeholders.default;
};
