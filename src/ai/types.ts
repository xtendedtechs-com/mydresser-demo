import { WardrobeItem } from '@/hooks/useWardrobe';

export interface AIOutfitContext {
  weather: WeatherContext;
  occasion: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  userPreferences: UserStyleProfile;
  constraints?: OutfitConstraints;
  socialContext?: SocialContext;
}

export interface WeatherContext {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  uvIndex?: number;
  precipitation?: number;
  feelsLike: number;
}

export interface UserStyleProfile {
  favoriteColors: string[];
  preferredBrands: string[];
  stylePersonality: StylePersonality;
  bodyType?: BodyType;
  colorSeason?: ColorSeason;
  lifestyleFactors: LifestyleFactors;
  fashionGoals: string[];
  avoidedItems: string[];
}

export interface StylePersonality {
  primary: 'minimalist' | 'bohemian' | 'classic' | 'edgy' | 'romantic' | 'sporty' | 'trendy';
  secondary?: string;
  confidence: number; // 0-100
  experimentalness: number; // 0-100 (willingness to try new styles)
  formality: number; // 0-100
  colorfulness: number; // 0-100
}

export interface BodyType {
  shape: 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted-triangle';
  height: 'petite' | 'average' | 'tall';
  preferences: {
    emphasize: string[];
    balance: string[];
  };
}

export interface ColorSeason {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  subtype: string;
  bestColors: string[];
  neutrals: string[];
  accentColors: string[];
}

export interface LifestyleFactors {
  workEnvironment: 'corporate' | 'creative' | 'casual' | 'remote' | 'mixed';
  socialLife: 'active' | 'moderate' | 'quiet';
  exerciseFrequency: 'daily' | 'regular' | 'occasional' | 'rare';
  travelFrequency: 'frequent' | 'moderate' | 'rare';
  sustainabilityImportance: number; // 0-100
}

export interface OutfitConstraints {
  maxItems: number;
  requiredCategories: string[];
  forbiddenCategories: string[];
  maxBudget?: number;
  sustainabilityMinScore?: number;
  brandPreferences?: string[];
}

export interface SocialContext {
  platform?: 'instagram' | 'tiktok' | 'linkedin' | 'general';
  audience?: 'professional' | 'friends' | 'public' | 'date';
  event?: string;
  location?: string;
  culturalContext?: string;
}

export interface AIOutfitRecommendation {
  outfit: EnhancedOutfit;
  aiAnalysis: AIAnalysis;
  personalizedInsights: PersonalizedInsights;
  improvements: ImprovementSuggestions;
  confidence: AIConfidence;
}

export interface EnhancedOutfit {
  id: string;
  name: string;
  items: WardrobeItem[];
  layering: LayeringStructure;
  accessories: AccessoryRecommendations;
  styling: StylingTips;
  occasions: string[];
  seasons: string[];
  weatherRange: WeatherRange;
}

export interface LayeringStructure {
  base: WardrobeItem[];
  middle: WardrobeItem[];
  outer: WardrobeItem[];
  feet: WardrobeItem[];
  accessories: WardrobeItem[];
  layeringLogic: string;
}

export interface AccessoryRecommendations {
  recommended: WardrobeItem[];
  optional: WardrobeItem[];
  alternatives: WardrobeItem[];
  reasoning: string;
}

export interface StylingTips {
  proportions: string[];
  colorBalance: string[];
  texturePlay: string[];
  fitAdjustments: string[];
  confidenceBoosts: string[];
}

export interface WeatherRange {
  minTemp: number;
  maxTemp: number;
  conditions: string[];
  adaptations: string[];
}

export interface AIAnalysis {
  styleConsistency: DetailedScore;
  colorHarmony: ColorAnalysis;
  weatherAppropriatenss: DetailedScore;
  occasionFit: DetailedScore;
  comfortLevel: DetailedScore;
  trendiness: TrendAnalysis;
  sustainability: SustainabilityAnalysis;
  versatility: VersatilityScore;
}

export interface DetailedScore {
  score: number;
  reasoning: string;
  factors: ScoringFactor[];
}

export interface ScoringFactor {
  name: string;
  impact: number;
  description: string;
}

export interface ColorAnalysis {
  harmony: DetailedScore;
  seasonAlignment: DetailedScore;
  personalAlignment: DetailedScore;
  palette: ColorPaletteAnalysis;
}

export interface ColorPaletteAnalysis {
  dominant: string;
  accent: string[];
  neutral: string[];
  temperature: 'warm' | 'cool' | 'neutral';
  saturation: 'high' | 'medium' | 'low';
  contrast: 'high' | 'medium' | 'low';
}

export interface TrendAnalysis {
  currentRelevance: number;
  timelessness: number;
  viralPotential: number;
  seasonalTrend: string;
  influencerAlignment: number;
}

export interface SustainabilityAnalysis {
  overallScore: number;
  factors: {
    longevity: number;
    versatility: number;
    qualityScore: number;
    brandEthics: number;
    materialSustainability: number;
  };
  improvements: string[];
}

export interface VersatilityScore {
  score: number;
  occasionRange: string[];
  seasonRange: string[];
  mixMatchPotential: number;
  investmentValue: number;
}

export interface PersonalizedInsights {
  styleGrowth: StyleGrowthInsights;
  wardrobe: WardrobeInsights;
  preferences: PreferenceInsights;
  recommendations: PersonalRecommendations;
}

export interface StyleGrowthInsights {
  experimentation: string[];
  comfort: string[];
  newDirections: string[];
  skillBuilding: string[];
}

export interface WardrobeInsights {
  gaps: WardrobeGap[];
  overuse: WardrobeItem[];
  underuse: WardrobeItem[];
  costPerWear: CostAnalysis[];
}

export interface WardrobeGap {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
}

export interface CostAnalysis {
  item: WardrobeItem;
  costPerWear: number;
  valueScore: number;
  recommendation: string;
}

export interface PreferenceInsights {
  discovered: DiscoveredPreference[];
  evolving: EvolvingPreference[];
  stable: string[];
}

export interface DiscoveredPreference {
  type: string;
  value: string;
  confidence: number;
  evidence: string[];
}

export interface EvolvingPreference {
  type: string;
  from: string;
  to: string;
  confidence: number;
  timeline: string;
}

export interface PersonalRecommendations {
  immediate: ActionableRecommendation[];
  shortTerm: ActionableRecommendation[];
  longTerm: ActionableRecommendation[];
}

export interface ActionableRecommendation {
  action: string;
  description: string;
  expectedBenefit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeline: string;
}

export interface ImprovementSuggestions {
  quickFixes: QuickFix[];
  upgrades: UpgradeSuggestion[];
  alternatives: AlternativeOutfit[];
  longTermGoals: LongTermGoal[];
}

export interface QuickFix {
  change: string;
  impact: string;
  effort: 'minimal' | 'low' | 'medium';
}

export interface UpgradeSuggestion {
  category: string;
  currentItem?: WardrobeItem;
  suggestion: string;
  reasoning: string;
  priority: number;
}

export interface AlternativeOutfit {
  variation: string;
  items: WardrobeItem[];
  benefits: string[];
  tradeoffs: string[];
}

export interface LongTermGoal {
  goal: string;
  steps: string[];
  timeline: string;
  expectedOutcome: string;
}

export interface AIConfidence {
  overall: number;
  factors: {
    dataQuality: number;
    matchAccuracy: number;
    personalization: number;
    seasonalRelevance: number;
  };
  uncertainty: UncertaintyFactors;
}

export interface UncertaintyFactors {
  limitedData: string[];
  assumptions: string[];
  variability: string[];
}

export interface LearningContext {
  feedback: OutfitFeedback;
  usage: UsagePatterns;
  preferences: PreferenceEvolution;
}

export interface OutfitFeedback {
  outfitId: string;
  liked: boolean;
  worn: boolean;
  rating?: number;
  comments?: string;
  context?: string;
  timestamp: Date;
}

export interface UsagePatterns {
  frequentlyWorn: WardrobeItem[];
  rarelyWorn: WardrobeItem[];
  favoriteCombinatinos: WardrobeItem[][];
  seasonalPatterns: SeasonalPattern[];
  occasionPatterns: OccasionPattern[];
}

export interface SeasonalPattern {
  season: string;
  preferredItems: WardrobeItem[];
  avoidedItems: WardrobeItem[];
  colorPreferences: string[];
}

export interface OccasionPattern {
  occasion: string;
  goToOutfits: WardrobeItem[][];
  confidence: number;
  satisfaction: number;
}

export interface PreferenceEvolution {
  timeline: PreferenceSnapshot[];
  trends: PreferenceTrend[];
  stability: PreferenceStability;
}

export interface PreferenceSnapshot {
  date: Date;
  preferences: UserStyleProfile;
  confidence: number;
}

export interface PreferenceTrend {
  aspect: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number;
  timeline: string;
}

export interface PreferenceStability {
  stable: string[];
  evolving: string[];
  experimental: string[];
}