import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityAlert {
  user_id: string;
  alert_type: 'suspicious_access' | 'data_breach' | 'rate_limit_violation' | 'session_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { action, user_id, data } = await req.json();

    console.log(`Security Monitor - Action: ${action}, User: ${user_id}`);

    let alerts: SecurityAlert[] = [];

    switch (action) {
      case 'check_suspicious_access':
        alerts = await checkSuspiciousAccess(supabaseClient, user_id, data);
        break;
      
      case 'detect_data_breach':
        alerts = await detectDataBreach(supabaseClient, user_id, data);
        break;
      
      case 'monitor_rate_limits':
        alerts = await monitorRateLimits(supabaseClient, user_id);
        break;
      
      case 'analyze_session_anomalies':
        alerts = await analyzeSessionAnomalies(supabaseClient, user_id, data);
        break;
      
      default:
        throw new Error(`Unknown security monitoring action: ${action}`);
    }

    // Log all security alerts
    if (alerts.length > 0) {
      await logSecurityAlerts(supabaseClient, alerts);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts_generated: alerts.length,
        alerts: alerts.filter(a => a.severity === 'high' || a.severity === 'critical')
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Security Monitor Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function checkSuspiciousAccess(supabaseClient: any, user_id: string, data: any): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];
  
  try {
    // Check for rapid successive access to sensitive data
    const { data: recentAccess, error } = await supabaseClient
      .from('contact_info_access_log')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (recentAccess && recentAccess.length > 20) {
      alerts.push({
        user_id,
        alert_type: 'suspicious_access',
        severity: 'high',
        details: {
          access_count: recentAccess.length,
          time_window: '10_minutes',
          accessed_tables: [...new Set(recentAccess.map((a: any) => a.action.split('_')[0]))]
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check for unusual IP patterns (if available)
    const uniqueIPs = new Set(recentAccess?.map((a: any) => a.ip_address).filter(Boolean));
    if (uniqueIPs.size > 5) {
      alerts.push({
        user_id,
        alert_type: 'session_anomaly',
        severity: 'medium',
        details: {
          unique_ips: uniqueIPs.size,
          suspicious_pattern: 'multiple_ip_access'
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error checking suspicious access:', error);
  }

  return alerts;
}

async function detectDataBreach(supabaseClient: any, user_id: string, data: any): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];
  
  try {
    // Check for mass data extraction patterns
    const tables_accessed = data.tables_accessed || [];
    const sensitive_tables = ['profile_contact_info', 'merchant_profiles', 'user_mfa_settings'];
    
    const sensitive_access_count = tables_accessed.filter((table: string) => 
      sensitive_tables.includes(table)
    ).length;

    if (sensitive_access_count >= 2) {
      alerts.push({
        user_id,
        alert_type: 'data_breach',
        severity: 'critical',
        details: {
          sensitive_tables_accessed: sensitive_access_count,
          total_tables_accessed: tables_accessed.length,
          pattern: 'mass_sensitive_data_access'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check for automated access patterns
    if (data.request_frequency && data.request_frequency > 100) {
      alerts.push({
        user_id,
        alert_type: 'data_breach',
        severity: 'high',
        details: {
          request_frequency: data.request_frequency,
          pattern: 'automated_access_suspected'
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error detecting data breach:', error);
  }

  return alerts;
}

async function monitorRateLimits(supabaseClient: any, user_id: string): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];
  
  try {
    // Check current rate limit violations
    const { data: violations, error } = await supabaseClient
      .from('security_audit_log')
      .select('*')
      .eq('user_id', user_id)
      .eq('action', 'rate_limit_exceeded')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (violations && violations.length > 5) {
      alerts.push({
        user_id,
        alert_type: 'rate_limit_violation',
        severity: 'medium',
        details: {
          violation_count: violations.length,
          time_window: '1_hour',
          frequent_violations: true
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error monitoring rate limits:', error);
  }

  return alerts;
}

async function analyzeSessionAnomalies(supabaseClient: any, user_id: string, data: any): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];
  
  try {
    // Check for session hijacking indicators
    if (data.user_agent_changes && data.user_agent_changes > 3) {
      alerts.push({
        user_id,
        alert_type: 'session_anomaly',
        severity: 'high',
        details: {
          user_agent_changes: data.user_agent_changes,
          pattern: 'potential_session_hijacking'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check for geographic anomalies (if location data available)
    if (data.location_changes && data.location_changes > 2) {
      alerts.push({
        user_id,
        alert_type: 'session_anomaly',
        severity: 'medium',
        details: {
          location_changes: data.location_changes,
          pattern: 'geographic_anomaly'
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error analyzing session anomalies:', error);
  }

  return alerts;
}

async function logSecurityAlerts(supabaseClient: any, alerts: SecurityAlert[]): Promise<void> {
  try {
    for (const alert of alerts) {
      await supabaseClient
        .from('security_audit_log')
        .insert({
          user_id: alert.user_id,
          action: `security_monitor_${alert.alert_type}`,
          resource: 'security_monitoring',
          success: true,
          details: {
            severity: alert.severity,
            alert_details: alert.details,
            timestamp: alert.timestamp
          }
        });
      
      console.log(`Security Alert Generated: ${alert.alert_type} - ${alert.severity} for user ${alert.user_id}`);
    }
  } catch (error) {
    console.error('Error logging security alerts:', error);
  }
}