export interface FabricTexture {
  type: 'cotton' | 'denim' | 'silk' | 'leather' | 'wool' | 'synthetic';
  roughness: number;
  glossiness: number;
}

export class FabricTextureEngine {
  private textureCache = new Map<string, ImageData>();

  applyFabricTexture(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fabricType: FabricTexture['type']
  ): void {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    
    const texture = this.getTextureProperties(fabricType);
    
    // Apply texture pattern
    for (let i = 0; i < data.length; i += 4) {
      const pixelX = (i / 4) % width;
      const pixelY = Math.floor((i / 4) / width);
      
      // Add subtle noise for fabric texture
      const noise = this.generateNoise(pixelX, pixelY, texture.roughness);
      data[i] += noise;     // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
      
      // Apply glossiness
      if (texture.glossiness > 0) {
        const gloss = this.calculateGloss(pixelX, pixelY, texture.glossiness);
        data[i] = Math.min(255, data[i] + gloss);
        data[i + 1] = Math.min(255, data[i + 1] + gloss);
        data[i + 2] = Math.min(255, data[i + 2] + gloss);
      }
    }
    
    ctx.putImageData(imageData, x, y);
  }

  private getTextureProperties(fabricType: FabricTexture['type']): FabricTexture {
    const textures: Record<FabricTexture['type'], FabricTexture> = {
      cotton: { type: 'cotton', roughness: 0.3, glossiness: 0.1 },
      denim: { type: 'denim', roughness: 0.5, glossiness: 0.05 },
      silk: { type: 'silk', roughness: 0.1, glossiness: 0.7 },
      leather: { type: 'leather', roughness: 0.2, glossiness: 0.6 },
      wool: { type: 'wool', roughness: 0.6, glossiness: 0.0 },
      synthetic: { type: 'synthetic', roughness: 0.15, glossiness: 0.4 }
    };
    
    return textures[fabricType];
  }

  private generateNoise(x: number, y: number, intensity: number): number {
    // Simple perlin-like noise
    const noise = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * intensity * 5;
    return noise;
  }

  private calculateGloss(x: number, y: number, intensity: number): number {
    // Simulate light reflection
    const distance = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
    const gloss = Math.max(0, (100 - distance) / 100) * intensity * 20;
    return gloss;
  }

  detectFabricType(category: string): FabricTexture['type'] {
    const categoryMap: Record<string, FabricTexture['type']> = {
      'tops': 'cotton',
      'bottoms': 'denim',
      'dresses': 'silk',
      'outerwear': 'leather',
      'shoes': 'leather',
      'accessories': 'synthetic'
    };
    
    return categoryMap[category.toLowerCase()] || 'cotton';
  }
}

export const fabricTexture = new FabricTextureEngine();
