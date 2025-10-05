import { supabase } from '@/integrations/supabase/client';

export interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: string;
  status: string;
  detected_at: string;
  incident_details: any;
}

export interface SecurityIncidentInput {
  incident_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  details: Record<string, any>;
}

export interface SecurityMetrics {
  security_score: number;
  risk_level: string;
  active_incidents: number;
  recent_threats: number;
}

class SecurityMonitoringService {
  private static instance: SecurityMonitoringService;

  private constructor() {}

  static getInstance(): SecurityMonitoringService {
    if (!SecurityMonitoringService.instance) {
      SecurityMonitoringService.instance = new SecurityMonitoringService();
    }
    return SecurityMonitoringService.instance;
  }

  /**
   * Log a security incident
   */
  async logIncident(incident: SecurityIncidentInput): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc('log_security_incident' as any, {
        p_incident_type: incident.incident_type,
        p_severity: incident.severity,
        p_user_id: user?.id || null,
        p_details: incident.details
      }) as any;

      if (error) throw error;

      return data as string;
    } catch (error) {
      console.error('Failed to log security incident:', error);
      return null;
    }
  }

  /**
   * Get user security score
   */
  async getUserSecurityScore(userId?: string): Promise<number> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return 50;

      const { data, error } = await supabase.rpc('calculate_user_security_score' as any, {
        p_user_id: targetUserId
      }) as any;

      if (error) throw error;

      return typeof data === 'number' ? data : 50;
    } catch (error) {
      console.error('Failed to calculate security score:', error);
      return 50;
    }
  }

  /**
   * Check IP reputation
   */
  async checkIPReputation(ipAddress: string): Promise<{
    reputation_score: number;
    threat_level: string;
    is_blocked: boolean;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('check_ip_reputation' as any, {
        p_ip_address: ipAddress
      }) as any;

      if (error) throw error;

      return data?.[0] || null;
    } catch (error) {
      console.error('Failed to check IP reputation:', error);
      return null;
    }
  }

  /**
   * Monitor failed login attempt
   */
  async recordFailedLogin(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current failed attempts
      const { data: currentScore } = await supabase
        .from('user_security_score')
        .select('failed_login_attempts')
        .eq('user_id', user.id)
        .single();

      const newCount = (currentScore?.failed_login_attempts || 0) + 1;

      // Update security score
      await supabase
        .from('user_security_score')
        .upsert({
          user_id: user.id,
          failed_login_attempts: newCount,
          updated_at: new Date().toISOString()
        });

      // Log incident if threshold exceeded
      if (newCount >= 5) {
        await this.logIncident({
          incident_type: 'brute_force',
          severity: 'high',
          details: {
            failed_attempts: newCount,
            threshold_exceeded: true
          }
        });
      }
    } catch (error) {
      console.error('Failed to record failed login:', error);
    }
  }

  /**
   * Monitor suspicious activity
   */
  async recordSuspiciousActivity(activityType: string, details: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await this.logIncident({
        incident_type: 'suspicious_activity',
        severity: 'medium',
        details: {
          activity_type: activityType,
          ...details
        }
      });

      // Get current count
      const { data: currentScore } = await supabase
        .from('user_security_score')
        .select('suspicious_activities')
        .eq('user_id', user.id)
        .single();

      // Update security score
      await supabase
        .from('user_security_score')
        .upsert({
          user_id: user.id,
          suspicious_activities: (currentScore?.suspicious_activities || 0) + 1,
          last_suspicious_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Recalculate score
      await this.getUserSecurityScore(user.id);
    } catch (error) {
      console.error('Failed to record suspicious activity:', error);
    }
  }

  /**
   * Get recent security incidents
   */
  async getRecentIncidents(limit: number = 10): Promise<SecurityIncident[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to load incidents:', error);
      return [];
    }
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const score = await this.getUserSecurityScore(user.id);

      const { data: scoreData } = await supabase
        .from('user_security_score')
        .select('risk_level')
        .eq('user_id', user.id)
        .single();

      const { data: incidentsData } = await supabase
        .from('security_incidents')
        .select('id, severity')
        .eq('user_id', user.id)
        .eq('status', 'open');

      const { data: recentThreats } = await supabase
        .from('security_incidents')
        .select('id')
        .eq('user_id', user.id)
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return {
        security_score: score,
        risk_level: scoreData?.risk_level || 'medium',
        active_incidents: incidentsData?.length || 0,
        recent_threats: recentThreats?.length || 0
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return null;
    }
  }
}

export const securityMonitoringService = SecurityMonitoringService.getInstance();
