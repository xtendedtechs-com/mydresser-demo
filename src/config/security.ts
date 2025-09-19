// Supabase CAPTCHA configuration
// IMPORTANT: Set these to match your Supabase Auth > Captcha settings
// Provider options: 'turnstile' | 'hcaptcha'
export const CAPTCHA_PROVIDER: 'turnstile' | 'hcaptcha' = 'turnstile';

// Set your provider site key here. Example (Turnstile test key): '1x00000000000000000000AA'
// For production, use your actual site key configured in Supabase.
export const CAPTCHA_SITE_KEY = '';
