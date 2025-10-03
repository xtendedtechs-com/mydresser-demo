/**
 * Photo Helpers - Utilities for handling different photo formats consistently
 */

import placeholderWardrobe from '@/assets/placeholder-wardrobe.jpg';
import placeholderTops from '@/assets/placeholder-tops.jpg';
import placeholderBottoms from '@/assets/placeholder-bottoms.jpg';

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
 * Extracts a primary photo URL from various photo data formats
 * @param photos - Photo data in various formats
 * @param category - Item category for smart placeholder selection
 * @returns The primary photo URL or category-appropriate placeholder
 */
export const getPrimaryPhotoUrl = (photos: PhotoData, category?: string): string => {
  if (!photos) return getCategoryPlaceholderImage(category);

  // Handle string URL
  if (typeof photos === 'string') {
    return photos || getCategoryPlaceholderImage(category);
  }

  // Handle array of URLs
  if (Array.isArray(photos)) {
    return photos.length > 0 ? photos[0] : getCategoryPlaceholderImage(category);
  }

  // Handle object with main property
  if (typeof photos === 'object') {
    if ('main' in photos && photos.main) {
      return photos.main;
    }
    if ('urls' in photos && Array.isArray(photos.urls) && photos.urls.length > 0) {
      return photos.urls[0];
    }
  }

  return getCategoryPlaceholderImage(category);
};

/**
 * Extracts all photo URLs from various photo data formats
 * @param photos - Photo data in various formats
 * @returns Array of photo URLs
 */
export const getAllPhotoUrls = (photos: PhotoData): string[] => {
  if (!photos) return [];

  // Handle string URL
  if (typeof photos === 'string') {
    return photos ? [photos] : [];
  }

  // Handle array of URLs
  if (Array.isArray(photos)) {
    return photos.filter(Boolean);
  }

  // Handle object with urls or main property
  if (typeof photos === 'object') {
    if ('urls' in photos && Array.isArray(photos.urls)) {
      return photos.urls.filter(Boolean);
    }
    if ('main' in photos && photos.main) {
      return [photos.main];
    }
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
