import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitCheck {
  identifier: string;
  action: string;
  limit: number;
  windowMinutes: number;
}

interface SecurityAuditLog {
  user_id?: string;
  action: string;
  resource?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  details?: any;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    switch (action) {
      case 'check_signup_allowed':
        return await checkSignupAllowed();
      
      case 'rate_limit_check':
        return await rateLimitCheck(data as RateLimitCheck);
      
      case 'audit_log':
        return await auditLog({
          ...data,
          ip_address: ip,
          user_agent: userAgent
        } as SecurityAuditLog);
      
      case 'validate_invitation':
        return await validateInvitation(data.token);
      
      case 'create_invitation':
        return await createInvitation(data);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Auth security error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

async function checkSignupAllowed() {
  try {
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'signup_enabled')
      .single();

    const signupAllowed = settings?.setting_value?.enabled || false;
    const reason = settings?.setting_value?.reason || 'Signup is currently disabled';

    return new Response(
      JSON.stringify({ allowed: signupAllowed, reason }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Default to blocked if can't check
    return new Response(
      JSON.stringify({ 
        allowed: false, 
        reason: 'Unable to verify signup permissions. Signup is temporarily disabled for security.' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function rateLimitCheck({ identifier, action, limit, windowMinutes }: RateLimitCheck) {
  try {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    // Clean old records
    await supabase
      .from('rate_limits')
      .delete()
      .lt('window_start', windowStart.toISOString());

    // Check current rate
    const { data: existing, error } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw error;
    }

    const currentCount = existing?.count || 0;
    const allowed = currentCount < limit;

    if (allowed) {
      // Increment counter
      await supabase
        .from('rate_limits')
        .upsert({
          identifier,
          action,
          count: currentCount + 1,
          window_start: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ 
        allowed, 
        remaining: Math.max(0, limit - currentCount - 1),
        resetAt: new Date(Date.now() + windowMinutes * 60 * 1000).toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Rate limit check error:', error);
    return new Response(
      JSON.stringify({ allowed: false, remaining: 0 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function auditLog(logData: SecurityAuditLog) {
  try {
    await supabase
      .from('security_audit_log')
      .insert(logData);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Audit log error:', error);
    return new Response(
      JSON.stringify({ success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function validateInvitation(token: string) {
  try {
    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !invitation) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'Invalid or expired invitation' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, email: invitation.email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, reason: 'Unable to validate invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createInvitation(data: { email: string; invited_by: string }) {
  try {
    const token = crypto.randomUUID();
    
    const { error } = await supabase
      .from('user_invitations')
      .insert({
        email: data.email,
        token,
        invited_by: data.invited_by
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, token }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(handler);