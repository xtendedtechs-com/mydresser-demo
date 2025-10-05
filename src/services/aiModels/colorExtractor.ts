export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
  percentage: number;
}

export class ColorExtractor {
  async extractColors(imageUrl: string, maxColors: number = 5): Promise<ExtractedColor[]> {
    const img = await this.loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    
    // Resize for faster processing
    const maxSize = 200;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const colors = this.analyzeColors(imageData.data, maxColors);
    return colors;
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private analyzeColors(data: Uint8ClampedArray, maxColors: number): ExtractedColor[] {
    const colorMap = new Map<string, number>();
    const totalPixels = data.length / 4;
    
    // Sample every nth pixel for performance
    const sampleRate = 4;
    
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Quantize colors to reduce noise (group similar colors)
      const quantized = this.quantizeColor(r, g, b, 32);
      const key = `${quantized.r},${quantized.g},${quantized.b}`;
      
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
    
    // Sort by frequency
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxColors);
    
    // Convert to color objects
    return sortedColors.map(([rgb, count]) => {
      const [r, g, b] = rgb.split(',').map(Number);
      return {
        hex: this.rgbToHex(r, g, b),
        rgb: { r, g, b },
        name: this.getColorName(r, g, b),
        percentage: Math.round((count / (totalPixels / sampleRate)) * 100)
      };
    });
  }

  private quantizeColor(r: number, g: number, b: number, step: number) {
    return {
      r: Math.round(r / step) * step,
      g: Math.round(g / step) * step,
      b: Math.round(b / step) * step
    };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  private getColorName(r: number, g: number, b: number): string {
    // Simple color name mapping
    const hsl = this.rgbToHsl(r, g, b);
    
    if (hsl.l < 20) return 'Black';
    if (hsl.l > 80) return 'White';
    if (hsl.s < 15) return 'Gray';
    
    const hue = hsl.h;
    if (hue < 15 || hue >= 345) return 'Red';
    if (hue < 45) return 'Orange';
    if (hue < 75) return 'Yellow';
    if (hue < 165) return 'Green';
    if (hue < 195) return 'Cyan';
    if (hue < 255) return 'Blue';
    if (hue < 285) return 'Purple';
    if (hue < 315) return 'Magenta';
    return 'Pink';
  }

  private rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
}

export const colorExtractor = new ColorExtractor();
