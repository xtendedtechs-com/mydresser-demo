/**
 * Blob Helpers - Utilities for handling blob URLs and conversions
 */

/**
 * Convert a blob URL to a base64 data URL
 */
export const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert any URL (including blob URLs) to a data URL
 * If it's already a data URL or http URL, returns as-is
 */
export const convertToDataUrl = async (url: string): Promise<string> => {
  // Already a data URL
  if (url.startsWith('data:')) {
    return url;
  }
  
  // HTTP URLs stay as-is (will be handled by CORS)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Convert blob URLs to data URLs
  if (url.startsWith('blob:')) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await blobToDataUrl(blob);
    } catch (error) {
      console.warn('Failed to convert blob URL:', error);
      return url; // Return original if conversion fails
    }
  }
  
  // Local URLs (relative paths) stay as-is
  return url;
};

/**
 * Fetch a URL and convert to base64 data URL
 * Useful for converting remote images to data URLs for canvas operations
 */
export const fetchAsDataUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch (error) {
    console.error('Failed to fetch and convert URL:', error);
    throw error;
  }
};
