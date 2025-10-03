import { z } from 'zod';

// Wardrobe Item Validation
export const wardrobeItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  category: z.enum(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories']),
  brand: z.string().max(50).optional(),
  color: z.string().max(30).optional(),
  size: z.string().max(10).optional(),
  season: z.enum(['spring', 'summer', 'fall', 'winter', 'all-season']).optional(),
  occasion: z.enum(['casual', 'business', 'formal', 'sport', 'party']).optional(),
  material: z.string().max(50).optional(),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'worn']).optional(),
  purchase_price: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

// Outfit Creation Validation
export const outfitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500).optional(),
  occasion: z.string().max(30).optional(),
  season: z.string().max(20).optional(),
  style_tags: z.array(z.string()).optional(),
});

// Market Listing Validation
export const marketListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  category: z.enum(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories']),
  price: z.number().min(1, 'Price must be at least $1').max(10000, 'Price cannot exceed $10,000'),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'worn']),
  brand: z.string().max(50).optional(),
  color: z.string().max(30).optional(),
  size: z.string().max(10).optional(),
  material: z.string().max(50).optional(),
});

// Profile Update Validation
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  is_profile_public: z.boolean().optional(),
});

// Contact Info Validation
export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  social_instagram: z.string().max(100).optional(),
  social_facebook: z.string().max(100).optional(),
  social_tiktok: z.string().max(100).optional(),
});

// Merchant Profile Validation
export const merchantProfileSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  business_type: z.string().max(50).optional(),
  tax_id: z.string().max(20).optional(),
  business_address: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(50),
    zip: z.string().max(20),
    country: z.string().max(50),
  }).optional(),
  contact_info: z.object({
    email: z.string().email(),
    phone: z.string().max(20),
  }).optional(),
});

// Order Validation
export const orderSchema = z.object({
  items: z.array(z.object({
    merchant_item_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
    price: z.number().min(0),
  })).min(1, 'Order must contain at least one item'),
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z.string().max(20).optional(),
  shipping_address: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(50),
    zip: z.string().max(20),
    country: z.string().max(50),
  }),
  billing_address: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(50),
    zip: z.string().max(20),
    country: z.string().max(50),
  }).optional(),
});

// Transaction Validation
export const transactionSchema = z.object({
  item_id: z.string().uuid(),
  seller_id: z.string().uuid(),
  price: z.number().min(0),
  shipping_cost: z.number().min(0).optional(),
  shipping_address: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(50),
    zip: z.string().max(20),
    country: z.string().max(50),
  }).optional(),
});

// Helper function to validate data
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

// Helper to format Zod errors for display
export const formatZodErrors = (errors: z.ZodError): string[] => {
  return errors.errors.map(err => `${err.path.join('.')}: ${err.message}`);
};
