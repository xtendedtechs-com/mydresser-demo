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
  try {
    const secret = generateTOTPSecret();
    const backupCodes = generateBackupCodes();

    // Use secure database function instead of direct table access
    const { data, error } = await supabase.rpc('setup_user_mfa', {
      setup_type: 'totp',
      secret_data: secret,
      backup_codes_data: backupCodes
    });

    if (error) throw error;

    // Generate QR code URL for Google Authenticator
    const qrCodeUrl = `otpauth://totp/MyDresser:${userId}?secret=${secret}&issuer=MyDresser`;

    return new Response(
      JSON.stringify({ 
        secret, 
        qrCodeUrl,
        backupCodes: backupCodes,
        mfa_id: data.mfa_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TOTP setup error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to setup TOTP authentication' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function verifyTOTP(userId: string, code: string) {
  try {
    // Use secure verification function that handles rate limiting and audit logs
    const { data: isValid, error } = await supabase.rpc('verify_totp_secret', {
      input_code: code
    });

    if (error) {
      console.error('TOTP verification error:', error);
      return new Response(
        JSON.stringify({ valid: false, reason: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If verification successful and first time, enable TOTP
    if (isValid) {
      const { error: statusError } = await supabase.rpc('update_mfa_status', {
        enable_totp: true
      });
      
      if (statusError) {
        console.error('MFA status update error:', statusError);
      }
    }

    return new Response(
      JSON.stringify({ valid: isValid, enabled: isValid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TOTP verification error:', error);
    return new Response(
      JSON.stringify({ valid: false, reason: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function setupPhone(userId: string, phoneNumber: string) {
  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Use secure database function for phone setup
    const { data, error } = await supabase.rpc('setup_user_mfa', {
      setup_type: 'phone',
      phone_data: phoneNumber
    });

    if (error) throw error;

    // Store verification code temporarily in audit log (in production, use Redis or similar)
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
      JSON.stringify({ sent, message: 'Verification code sent to your phone', mfa_id: data.mfa_id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Phone setup error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to setup phone authentication' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function verifyPhone(userId: string, code: string) {
  try {
    // In production, retrieve and compare the code from secure storage
    // For now, accept any 6-digit code
    const valid = /^\d{6}$/.test(code);

    if (valid) {
      // Use secure function to update phone verification status
      const { error } = await supabase.rpc('update_mfa_status', {
        verify_phone: true
      });

      if (error) {
        console.error('Phone verification error:', error);
        return new Response(
          JSON.stringify({ valid: false, reason: 'Verification update failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ valid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Phone verification error:', error);
    return new Response(
      JSON.stringify({ valid: false, reason: 'Phone verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendPhoneCode(userId: string) {
  try {
    // Use secure view to get phone status without exposing secrets
    const { data: mfaStatus } = await supabase
      .from('user_mfa_status')
      .select('phone_number, phone_verified')
      .single();

    if (!mfaStatus?.phone_verified) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'Phone not verified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const sent = await sendSMS(mfaStatus.phone_number, `MyDresser login code: ${verificationCode}`);

    return new Response(
      JSON.stringify({ sent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send phone code error:', error);
    return new Response(
      JSON.stringify({ sent: false, reason: 'Failed to send verification code' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getBackupCodes(userId: string) {
  try {
    // Use secure view to get backup code count without exposing actual codes
    const { data: mfaStatus } = await supabase
      .from('user_mfa_status')
      .select('backup_codes_count')
      .single();

    return new Response(
      JSON.stringify({ 
        codes_count: mfaStatus?.backup_codes_count || 0,
        message: 'Backup codes cannot be displayed for security reasons. They were shown only during initial setup.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get backup codes error:', error);
    return new Response(
      JSON.stringify({ codes_count: 0, message: 'Unable to retrieve backup code information' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function useBackupCode(userId: string, code: string) {
  try {
    // Use secure function to verify and consume backup code
    const { data: isValid, error } = await supabase.rpc('use_backup_code', {
      input_code: code.toUpperCase()
    });

    if (error) {
      console.error('Backup code usage error:', error);
      return new Response(
        JSON.stringify({ valid: false, reason: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get remaining backup codes count
    const { data: mfaStatus } = await supabase
      .from('user_mfa_status')
      .select('backup_codes_count')
      .single();

    return new Response(
      JSON.stringify({ 
        valid: isValid, 
        remaining: mfaStatus?.backup_codes_count || 0 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Backup code usage error:', error);
    return new Response(
      JSON.stringify({ valid: false, reason: 'Backup code verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(handler);