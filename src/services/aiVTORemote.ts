import { supabase } from '@/integrations/supabase/client';

export interface RemoteClothingItem {
  id: string;
  name: string;
  category: string;
  photo?: string;
  color?: string;
  brand?: string;
}

export interface RemoteVTORequest {
  userImage: string; // Prefer data URL
  clothingItems: RemoteClothingItem[];
  instruction?: string;
}

export interface RemoteVTOResponse {
  imageUrl: string;
  processingTime?: number;
}

async function ensureDataUrl(input: string): Promise<string> {
  // If it's already a data URL, return as-is
  if (input.startsWith('data:')) return input;
  // Skip if empty or invalid
  if (!input || input === 'undefined' || input === 'null') {
    return '';
  }

  // Try to load into an <img> and convert to data URL
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    // Set crossOrigin for http/https to avoid canvas taint if server allows it
    if (/^https?:\/\//i.test(input)) {
      img.crossOrigin = 'anonymous';
    }

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        cleanup();
        resolve(dataUrl);
      } catch (e) {
        cleanup();
        reject(e);
      }
    };

    img.onerror = () => {
      cleanup();
      // Return empty string instead of rejecting for clothing items
      resolve('');
    };

    img.src = input;
  });
}

export async function tryRemoteVTO(req: RemoteVTORequest): Promise<RemoteVTOResponse> {
  const start = performance.now();
  // Ensure user image is a data URL
  const safeUserImage = await ensureDataUrl(req.userImage);

  // Process clothing items - include photos as data URLs
  const clothingItemsWithPhotos = await Promise.all(
    req.clothingItems.map(async (item) => {
      const photoDataUrl = item.photo ? await ensureDataUrl(item.photo) : undefined;
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        photo: photoDataUrl || undefined,
        color: item.color,
        brand: item.brand
      };
    })
  );

  const body = {
    userImage: safeUserImage,
    clothingItems: clothingItemsWithPhotos,
    instruction: req.instruction ?? 'Dress the person in the provided clothing items realistically.'
  };

  const { data: funcData, error } = await supabase.functions.invoke('ai-virtual-tryon', {
    body
  });

  if (error) {
    throw new Error(`Remote VTO failed (${(error as any).message || 'invoke error'})`);
  }

  const data = funcData as any;
  const imageUrl: string | undefined = data?.editedImageUrl || data?.imageUrl;
  if (!imageUrl) throw new Error('Remote VTO: missing image URL in response');

  return {
    imageUrl,
    processingTime: Math.round(performance.now() - start)
  };
}
