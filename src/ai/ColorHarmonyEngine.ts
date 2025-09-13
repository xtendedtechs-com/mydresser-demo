import { WardrobeItem } from '@/hooks/useWardrobe';
import { ColorAnalysis, ColorPaletteAnalysis, DetailedScore } from './types';

export class ColorHarmonyEngine {
  private colorMappings: Map<string, HSLColor> = new Map();
  private colorSeasons: Map<string, string[]> = new Map();
  private complementaryPairs: [string, string][] = [];

  constructor() {
    this.initializeColorSystem();
  }

  private initializeColorSystem(): void {
    // Initialize comprehensive color mappings
    this.setupColorMappings();
    this.setupColorSeasons();
    this.setupComplementaryPairs();
  }

  private setupColorMappings(): void {
    const colorMap = {
      // Reds
      'red': { h: 0, s: 100, l: 50 },
      'burgundy': { h: 345, s: 83, l: 27 },
      'crimson': { h: 348, s: 83, l: 47 },
      'maroon': { h: 0, s: 100, l: 25 },
      'wine': { h: 337, s: 84, l: 22 },
      
      // Blues
      'blue': { h: 240, s: 100, l: 50 },
      'navy': { h: 240, s: 100, l: 25 },
      'royal blue': { h: 225, s: 73, l: 57 },
      'sky blue': { h: 197, s: 71, l: 73 },
      'teal': { h: 180, s: 100, l: 25 },
      'turquoise': { h: 174, s: 72, l: 56 },
      
      // Greens
      'green': { h: 120, s: 100, l: 25 },
      'forest green': { h: 120, s: 61, l: 34 },
      'olive': { h: 60, s: 100, l: 25 },
      'sage': { h: 87, s: 25, l: 65 },
      'mint': { h: 150, s: 60, l: 80 },
      
      // Yellows
      'yellow': { h: 60, s: 100, l: 50 },
      'gold': { h: 51, s: 100, l: 50 },
      'mustard': { h: 48, s: 100, l: 37 },
      'cream': { h: 60, s: 100, l: 94 },
      
      // Purples
      'purple': { h: 300, s: 100, l: 25 },
      'violet': { h: 270, s: 100, l: 50 },
      'lavender': { h: 240, s: 67, l: 94 },
      'plum': { h: 300, s: 47, l: 25 },
      
      // Oranges
      'orange': { h: 30, s: 100, l: 50 },
      'coral': { h: 16, s: 100, l: 66 },
      'peach': { h: 28, s: 100, l: 86 },
      'rust': { h: 19, s: 100, l: 29 },
      
      // Pinks
      'pink': { h: 330, s: 100, l: 88 },
      'rose': { h: 330, s: 100, l: 70 },
      'blush': { h: 350, s: 100, l: 88 },
      'fuchsia': { h: 300, s: 100, l: 50 },
      
      // Neutrals
      'white': { h: 0, s: 0, l: 100 },
      'black': { h: 0, s: 0, l: 0 },
      'gray': { h: 0, s: 0, l: 50 },
      'grey': { h: 0, s: 0, l: 50 },
      'beige': { h: 60, s: 56, l: 91 },
      'tan': { h: 34, s: 44, l: 69 },
      'brown': { h: 30, s: 67, l: 25 },
      'taupe': { h: 25, s: 25, l: 47 },
      'ivory': { h: 60, s: 100, l: 97 },
      'off-white': { h: 60, s: 100, l: 94 }
    };

    Object.entries(colorMap).forEach(([name, hsl]) => {
      this.colorMappings.set(name.toLowerCase(), hsl);
    });
  }

  private setupColorSeasons(): void {
    this.colorSeasons.set('spring', [
      'coral', 'peach', 'yellow', 'mint', 'turquoise', 'sky blue', 
      'lavender', 'pink', 'cream', 'ivory', 'gold'
    ]);
    
    this.colorSeasons.set('summer', [
      'rose', 'blush', 'lavender', 'sky blue', 'sage', 'gray', 
      'navy', 'white', 'silver', 'plum'
    ]);
    
    this.colorSeasons.set('autumn', [
      'rust', 'burgundy', 'gold', 'mustard', 'olive', 'brown', 
      'tan', 'forest green', 'orange', 'maroon'
    ]);
    
    this.colorSeasons.set('winter', [
      'black', 'white', 'navy', 'royal blue', 'crimson', 'purple', 
      'fuchsia', 'emerald', 'silver', 'gray'
    ]);
  }

  private setupComplementaryPairs(): void {
    this.complementaryPairs = [
      ['red', 'green'],
      ['blue', 'orange'],
      ['yellow', 'purple'],
      ['navy', 'gold'],
      ['pink', 'sage'],
      ['coral', 'teal'],
      ['burgundy', 'forest green'],
      ['cream', 'brown']
    ];
  }

  public analyzeOutfitColors(items: WardrobeItem[]): ColorAnalysis {
    const colors = this.extractColors(items);
    const palette = this.analyzePalette(colors);
    
    return {
      harmony: this.calculateHarmonyScore(colors, palette),
      seasonAlignment: this.calculateSeasonAlignment(colors),
      personalAlignment: this.calculatePersonalAlignment(colors),
      palette
    };
  }

  private extractColors(items: WardrobeItem[]): string[] {
    return items
      .map(item => item.color?.toLowerCase().trim())
      .filter(color => color && color !== 'unknown')
      .map(color => this.normalizeColor(color!));
  }

  private normalizeColor(color: string): string {
    // Handle multi-word colors and variations
    const normalizations: Record<string, string> = {
      'light blue': 'sky blue',
      'dark blue': 'navy',
      'light green': 'mint',
      'dark green': 'forest green',
      'light gray': 'gray',
      'dark gray': 'gray',
      'light grey': 'gray',
      'dark grey': 'gray'
    };

    return normalizations[color] || color;
  }

  private analyzePalette(colors: string[]): ColorPaletteAnalysis {
    const hslColors = colors
      .map(color => this.colorMappings.get(color))
      .filter(Boolean) as HSLColor[];

    if (hslColors.length === 0) {
      return {
        dominant: 'neutral',
        accent: [],
        neutral: [],
        temperature: 'neutral',
        saturation: 'medium',
        contrast: 'medium'
      };
    }

    const dominant = this.findDominantColor(colors);
    const { accent, neutral } = this.categorizeColors(colors);
    const temperature = this.determineTemperature(hslColors);
    const saturation = this.determineSaturation(hslColors);
    const contrast = this.determineContrast(hslColors);

    return {
      dominant,
      accent,
      neutral,
      temperature,
      saturation,
      contrast
    };
  }

  private findDominantColor(colors: string[]): string {
    const frequency = new Map<string, number>();
    colors.forEach(color => {
      frequency.set(color, (frequency.get(color) || 0) + 1);
    });

    let maxCount = 0;
    let dominant = 'neutral';
    frequency.forEach((count, color) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = color;
      }
    });

    return dominant;
  }

  private categorizeColors(colors: string[]): { accent: string[], neutral: string[] } {
    const neutralColors = ['white', 'black', 'gray', 'grey', 'beige', 'brown', 'tan', 'navy', 'cream', 'ivory'];
    
    const accent = colors.filter(color => !neutralColors.includes(color));
    const neutral = colors.filter(color => neutralColors.includes(color));

    return { accent, neutral };
  }

  private determineTemperature(hslColors: HSLColor[]): 'warm' | 'cool' | 'neutral' {
    if (hslColors.length === 0) return 'neutral';

    let warmCount = 0;
    let coolCount = 0;

    hslColors.forEach(color => {
      const hue = color.h;
      if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
        warmCount++; // Reds, oranges, yellows
      } else if (hue >= 120 && hue <= 240) {
        coolCount++; // Greens, blues, purples
      }
    });

    if (warmCount > coolCount) return 'warm';
    if (coolCount > warmCount) return 'cool';
    return 'neutral';
  }

  private determineSaturation(hslColors: HSLColor[]): 'high' | 'medium' | 'low' {
    if (hslColors.length === 0) return 'medium';

    const avgSaturation = hslColors.reduce((sum, color) => sum + color.s, 0) / hslColors.length;
    
    if (avgSaturation >= 70) return 'high';
    if (avgSaturation >= 30) return 'medium';
    return 'low';
  }

  private determineContrast(hslColors: HSLColor[]): 'high' | 'medium' | 'low' {
    if (hslColors.length < 2) return 'low';

    const lightnesses = hslColors.map(color => color.l);
    const maxLight = Math.max(...lightnesses);
    const minLight = Math.min(...lightnesses);
    const contrast = maxLight - minLight;

    if (contrast >= 60) return 'high';
    if (contrast >= 30) return 'medium';
    return 'low';
  }

  private calculateHarmonyScore(colors: string[], palette: ColorPaletteAnalysis): DetailedScore {
    if (colors.length <= 1) {
      return {
        score: 85,
        reasoning: 'Single color is inherently harmonious',
        factors: [
          { name: 'Monochromatic', impact: 85, description: 'Single color creates natural harmony' }
        ]
      };
    }

    let score = 50;
    const factors: Array<{ name: string; impact: number; description: string }> = [];

    // Check for complementary colors
    const hasComplementary = this.hasComplementaryColors(colors);
    if (hasComplementary) {
      score += 20;
      factors.push({
        name: 'Complementary Colors',
        impact: 20,
        description: 'Complementary colors create dynamic harmony'
      });
    }

    // Check for analogous colors
    const analogousScore = this.calculateAnalogousScore(colors);
    score += analogousScore;
    if (analogousScore > 0) {
      factors.push({
        name: 'Analogous Colors',
        impact: analogousScore,
        description: 'Similar colors create pleasing harmony'
      });
    }

    // Neutral base bonus
    const neutralCount = palette.neutral.length;
    const neutralBonus = Math.min(neutralCount * 5, 15);
    score += neutralBonus;
    if (neutralBonus > 0) {
      factors.push({
        name: 'Neutral Foundation',
        impact: neutralBonus,
        description: 'Neutral colors provide stable base'
      });
    }

    // Contrast appropriateness
    const contrastScore = this.evaluateContrastAppropriatenss(palette.contrast, colors.length);
    score += contrastScore;
    factors.push({
      name: 'Contrast Balance',
      impact: contrastScore,
      description: 'Appropriate contrast level for outfit complexity'
    });

    // Color count penalty for too many colors
    if (colors.length > 4) {
      const penalty = (colors.length - 4) * 5;
      score -= penalty;
      factors.push({
        name: 'Color Complexity',
        impact: -penalty,
        description: 'Too many colors can create visual chaos'
      });
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      reasoning: this.generateHarmonyReasoning(palette, factors),
      factors
    };
  }

  private hasComplementaryColors(colors: string[]): boolean {
    return this.complementaryPairs.some(([color1, color2]) =>
      colors.includes(color1) && colors.includes(color2)
    );
  }

  private calculateAnalogousScore(colors: string[]): number {
    const hslColors = colors
      .map(color => this.colorMappings.get(color))
      .filter(Boolean) as HSLColor[];

    if (hslColors.length < 2) return 0;

    let analogousCount = 0;
    for (let i = 0; i < hslColors.length; i++) {
      for (let j = i + 1; j < hslColors.length; j++) {
        const hueDiff = Math.abs(hslColors[i].h - hslColors[j].h);
        const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
        if (normalizedDiff <= 60) { // Analogous colors are within 60 degrees
          analogousCount++;
        }
      }
    }

    return Math.min(analogousCount * 5, 15);
  }

  private evaluateContrastAppropriatenss(contrast: string, colorCount: number): number {
    if (colorCount <= 2) {
      // For simple outfits, any contrast level is fine
      return 5;
    } else if (colorCount <= 4) {
      // For moderate complexity, prefer medium contrast
      return contrast === 'medium' ? 10 : contrast === 'high' ? 5 : 8;
    } else {
      // For complex outfits, prefer lower contrast
      return contrast === 'low' ? 10 : contrast === 'medium' ? 5 : 0;
    }
  }

  private generateHarmonyReasoning(palette: ColorPaletteAnalysis, factors: any[]): string {
    const positiveFactors = factors.filter(f => f.impact > 0);
    const negativeFactors = factors.filter(f => f.impact < 0);

    let reasoning = `This ${palette.temperature} color palette `;
    
    if (positiveFactors.length > 0) {
      reasoning += `benefits from ${positiveFactors.map(f => f.name.toLowerCase()).join(' and ')}`;
    }
    
    if (negativeFactors.length > 0) {
      reasoning += `, but could be improved by addressing ${negativeFactors.map(f => f.name.toLowerCase()).join(' and ')}`;
    }
    
    reasoning += `. The ${palette.contrast} contrast level and ${palette.saturation} saturation create `;
    
    if (palette.contrast === 'high' && palette.saturation === 'high') {
      reasoning += 'a bold, attention-grabbing look';
    } else if (palette.contrast === 'low' && palette.saturation === 'low') {
      reasoning += 'a subtle, sophisticated aesthetic';
    } else {
      reasoning += 'a balanced, versatile appearance';
    }

    return reasoning + '.';
  }

  private calculateSeasonAlignment(colors: string[]): DetailedScore {
    const seasonScores = new Map<string, number>();

    // Calculate score for each season
    ['spring', 'summer', 'autumn', 'winter'].forEach(season => {
      const seasonColors = this.colorSeasons.get(season) || [];
      const matches = colors.filter(color => seasonColors.includes(color));
      const score = (matches.length / Math.max(colors.length, 1)) * 100;
      seasonScores.set(season, score);
    });

    // Find best season match
    const bestSeason = Array.from(seasonScores.entries()).reduce((best, current) =>
      current[1] > best[1] ? current : best
    );

    const factors = [
      {
        name: `${bestSeason[0]} Season Match`,
        impact: bestSeason[1],
        description: `Colors align well with ${bestSeason[0]} color palette`
      }
    ];

    return {
      score: bestSeason[1],
      reasoning: `Colors are ${bestSeason[1] > 70 ? 'strongly' : bestSeason[1] > 40 ? 'moderately' : 'weakly'} aligned with ${bestSeason[0]} season palette`,
      factors
    };
  }

  private calculatePersonalAlignment(colors: string[]): DetailedScore {
    // This would integrate with user's personal color analysis
    // For now, providing a baseline implementation
    
    const score = 75; // Default good alignment
    
    return {
      score,
      reasoning: 'Colors work well with most skin tones and personal styles',
      factors: [
        {
          name: 'Universal Appeal',
          impact: score,
          description: 'Color combination is flattering for most people'
        }
      ]
    };
  }

  public generateColorSuggestions(currentColors: string[], context: any): string[] {
    const suggestions: string[] = [];
    
    // Suggest complementary colors
    currentColors.forEach(color => {
      const complement = this.findComplement(color);
      if (complement && !currentColors.includes(complement)) {
        suggestions.push(complement);
      }
    });

    // Suggest analogous colors
    currentColors.forEach(color => {
      const analogous = this.findAnalogous(color);
      analogous.forEach(analogColor => {
        if (!currentColors.includes(analogColor) && !suggestions.includes(analogColor)) {
          suggestions.push(analogColor);
        }
      });
    });

    // Add neutrals if missing
    const hasNeutral = currentColors.some(color => 
      ['white', 'black', 'gray', 'beige', 'brown', 'navy'].includes(color)
    );
    
    if (!hasNeutral) {
      suggestions.push('white', 'black', 'navy');
    }

    return suggestions.slice(0, 5); // Limit suggestions
  }

  private findComplement(color: string): string | null {
    const pair = this.complementaryPairs.find(([c1, c2]) => c1 === color || c2 === color);
    if (!pair) return null;
    return pair[0] === color ? pair[1] : pair[0];
  }

  private findAnalogous(color: string): string[] {
    const colorHSL = this.colorMappings.get(color);
    if (!colorHSL) return [];

    const analogous: string[] = [];
    
    this.colorMappings.forEach((hsl, colorName) => {
      if (colorName === color) return;
      
      const hueDiff = Math.abs(hsl.h - colorHSL.h);
      const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
      
      if (normalizedDiff <= 60 && normalizedDiff > 0) {
        analogous.push(colorName);
      }
    });

    return analogous;
  }
}

interface HSLColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

export const colorHarmonyEngine = new ColorHarmonyEngine();