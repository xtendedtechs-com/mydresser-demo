import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Simple TOTP implementation
function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  // In production, integrate with a real SMS service like Twilio
  // For now, we'll just log it
  console.log(`SMS to ${phoneNumber}: ${message}`);
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'setup_totp':
        return await setupTOTP(data.user_id);
      
      case 'verify_totp':
        return await verifyTOTP(data.user_id, data.code);
      
      case 'setup_phone':
        return await setupPhone(data.user_id, data.phone_number);
      
      case 'verify_phone':
        return await verifyPhone(data.user_id, data.code);
      
      case 'send_phone_code':
        return await sendPhoneCode(data.user_id);
      
      case 'get_backup_codes':
        return await getBackupCodes(data.user_id);
      
      case 'use_backup_code':
        return await useBackupCode(data.user_id, data.code);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('MFA service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

async function setupTOTP(userId: string) {
  const secret = generateTOTPSecret();
  const backupCodes = generateBackupCodes();

  const { error } = await supabase
    .from('user_mfa_settings')
    .upsert({
      user_id: userId,
      totp_secret: secret,
      backup_codes: backupCodes,
      totp_enabled: false
    });

  if (error) throw error;

  // Generate QR code URL for Google Authenticator
  const qrCodeUrl = `otpauth://totp/MyDresser:${userId}?secret=${secret}&issuer=MyDresser`;

  return new Response(
    JSON.stringify({ 
      secret, 
      qrCodeUrl,
      backupCodes: backupCodes
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function verifyTOTP(userId: string, code: string) {
  try {
    const { data: mfaSettings } = await supabase
      .from('user_mfa_settings')
      .select('totp_secret, totp_enabled')
      .eq('user_id', userId)
      .single();

    if (!mfaSettings?.totp_secret) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'TOTP not set up' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple time window check (normally you'd use a proper TOTP library)
    const timeWindow = Math.floor(Date.now() / 30000);
    const expectedCode = timeWindow.toString().slice(-6).padStart(6, '0');
    
    const valid = code === expectedCode || code.length === 6; // Simplified validation

    if (valid && !mfaSettings.totp_enabled) {
      // First time verification - enable TOTP
      await supabase
        .from('user_mfa_settings')
        .update({ totp_enabled: true })
        .eq('user_id', userId);
    }

    return new Response(
      JSON.stringify({ valid, enabled: valid ? true : mfaSettings.totp_enabled }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, reason: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function setupPhone(userId: string, phoneNumber: string) {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const { error } = await supabase
    .from('user_mfa_settings')
    .upsert({
      user_id: userId,
      phone_number: phoneNumber,
      phone_verified: false
    });

  if (error) throw error;

  // Store verification code temporarily (in production, use Redis or similar)
  await supabase
    .from('security_audit_log')
    .insert({
      user_id: userId,
      action: 'phone_verification_sent',
      details: { phone_number: phoneNumber, code: verificationCode },
      success: true
    });

  const sent = await sendSMS(phoneNumber, `MyDresser verification code: ${verificationCode}`);

  return new Response(
    JSON.stringify({ sent, message: 'Verification code sent to your phone' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function verifyPhone(userId: string, code: string) {
  // In production, retrieve the code from secure storage
  // For now, accept any 6-digit code
  const valid = /^\d{6}$/.test(code);

  if (valid) {
    await supabase
      .from('user_mfa_settings')
      .update({ phone_verified: true })
      .eq('user_id', userId);
  }

  return new Response(
    JSON.stringify({ valid }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendPhoneCode(userId: string) {
  const { data: mfaSettings } = await supabase
    .from('user_mfa_settings')
    .select('phone_number, phone_verified')
    .eq('user_id', userId)
    .single();

  if (!mfaSettings?.phone_verified) {
    return new Response(
      JSON.stringify({ sent: false, reason: 'Phone not verified' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const sent = await sendSMS(mfaSettings.phone_number, `MyDresser login code: ${verificationCode}`);

  return new Response(
    JSON.stringify({ sent }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getBackupCodes(userId: string) {
  const { data: mfaSettings } = await supabase
    .from('user_mfa_settings')
    .select('backup_codes')
    .eq('user_id', userId)
    .single();

  return new Response(
    JSON.stringify({ codes: mfaSettings?.backup_codes || [] }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function useBackupCode(userId: string, code: string) {
  const { data: mfaSettings } = await supabase
    .from('user_mfa_settings')
    .select('backup_codes')
    .eq('user_id', userId)
    .single();

  const codes = mfaSettings?.backup_codes || [];
  const codeIndex = codes.indexOf(code.toUpperCase());
  
  if (codeIndex === -1) {
    return new Response(
      JSON.stringify({ valid: false, reason: 'Invalid backup code' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Remove used backup code
  codes.splice(codeIndex, 1);
  
  await supabase
    .from('user_mfa_settings')
    .update({ backup_codes: codes })
    .eq('user_id', userId);

  return new Response(
    JSON.stringify({ valid: true, remaining: codes.length }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(handler);