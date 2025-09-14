import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaptchaRequest {
  action: 'generate' | 'verify';
  challenge?: string;
  answer?: string;
  userAgent?: string;
  requestCount?: number;
}

// Simple math captcha for bot detection
function generateMathCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer: number;
  switch (operator) {
    case '+':
      answer = num1 + num2;
      break;
    case '-':
      answer = Math.max(num1, num2) - Math.min(num1, num2);
      break;
    case '*':
      answer = num1 * num2;
      break;
    default:
      answer = num1 + num2;
  }
  
  const challenge = operator === '-' 
    ? `${Math.max(num1, num2)} ${operator} ${Math.min(num1, num2)}`
    : `${num1} ${operator} ${num2}`;
    
  return { challenge, answer: answer.toString() };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, challenge, answer, userAgent, requestCount }: CaptchaRequest = await req.json();
    
    switch (action) {
      case 'generate': {
        const captcha = generateMathCaptcha();
        
        // Determine if CAPTCHA should be required based on risk factors
        let requireCaptcha = false;
        
        // Require CAPTCHA for high request counts
        if (requestCount && requestCount > 3) {
          requireCaptcha = true;
        }
        
        // Require CAPTCHA for suspicious user agents
        if (userAgent) {
          const suspiciousPatterns = /bot|crawler|spider|scraper|wget|curl|python/i;
          if (suspiciousPatterns.test(userAgent) || userAgent.length < 20) {
            requireCaptcha = true;
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            requireCaptcha,
            challenge: requireCaptcha ? captcha.challenge : null,
            token: requireCaptcha ? btoa(captcha.answer) : null // Base64 encode the answer
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      case 'verify': {
        if (!challenge || !answer) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing challenge or answer' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
        
        // Simple verification for math captcha
        try {
          const expectedAnswer = eval(challenge.replace(/[^0-9+\-*\s]/g, ''));
          const userAnswer = parseInt(answer);
          const isValid = expectedAnswer === userAnswer;
          
          return new Response(
            JSON.stringify({
              success: true,
              valid: isValid,
              message: isValid ? 'CAPTCHA verification successful' : 'Incorrect answer'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid challenge format' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      }
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});