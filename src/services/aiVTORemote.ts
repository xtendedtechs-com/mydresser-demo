export interface RemoteClothingItem {
  id: string;
  name: string;
  category: string;
  photo?: string;
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
      reject(new Error(`Failed to normalize image to data URL: ${input}`));
    };

    img.src = input;
  });
}

export async function tryRemoteVTO(req: RemoteVTORequest): Promise<RemoteVTOResponse> {
  const start = performance.now();
  // Ensure user image is a data URL; AI function handles this best
  const safeUserImage = await ensureDataUrl(req.userImage);

  const body = {
    userImage: safeUserImage,
    clothingItems: req.clothingItems.map(({ id, name, category }) => ({ id, name, category })),
    instruction: req.instruction ?? 'Apply the listed garments realistically with correct scale and alignment.'
  };

  const endpoint = '/functions/v1/ai-virtual-tryon';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Remote VTO failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const imageUrl: string | undefined = data?.editedImageUrl || data?.imageUrl;
  if (!imageUrl) throw new Error('Remote VTO: missing image URL in response');

  return {
    imageUrl,
    processingTime: Math.round(performance.now() - start)
  };
}
