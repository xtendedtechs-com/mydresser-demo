export interface ColorAdjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
}

export class ColorMatchingEngine {
  analyzeImageLighting(imageElement: HTMLImageElement): ColorAdjustment {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return { brightness: 1, contrast: 1, saturation: 1, hue: 0 };
    
    canvas.width = Math.min(imageElement.width, 200);
    canvas.height = Math.min(imageElement.height, 200);
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let totalBrightness = 0;
    let totalSaturation = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      totalSaturation += saturation;
      
      pixelCount++;
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    const avgSaturation = totalSaturation / pixelCount;
    
    return {
      brightness: avgBrightness / 128,
      contrast: 1 + (avgBrightness > 128 ? 0.1 : -0.1),
      saturation: avgSaturation * 1.5,
      hue: 0
    };
  }

  applyColorAdjustment(
    ctx: CanvasRenderingContext2D,
    adjustment: ColorAdjustment
  ): void {
    const brightness = Math.max(0.5, Math.min(1.5, adjustment.brightness));
    const contrast = Math.max(0.8, Math.min(1.2, adjustment.contrast));
    const saturation = Math.max(0.8, Math.min(1.2, adjustment.saturation));
    
    ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
  }

  blendWithLighting(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    lightingFactor: number
  ): void {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * lightingFactor);
      data[i + 1] = Math.min(255, data[i + 1] * lightingFactor);
      data[i + 2] = Math.min(255, data[i + 2] * lightingFactor);
    }
    
    ctx.putImageData(imageData, x, y);
  }
}

export const colorMatching = new ColorMatchingEngine();
