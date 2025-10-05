import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmailRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, type, title, message, actionUrl }: NotificationEmailRequest = await req.json();

    // Get user's email and notification preferences
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      throw new Error('User not found');
    }

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_enabled')
      .eq('user_id', userId)
      .single();

    // Check if email notifications are enabled
    if (!preferences?.email_enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get email template based on notification type
    const getEmailTemplate = (type: string) => {
      const templates: Record<string, { subject: string; emoji: string }> = {
        social: { subject: 'New Social Activity', emoji: '👥' },
        weather: { subject: 'Weather Alert', emoji: '🌤️' },
        marketplace: { subject: 'Marketplace Update', emoji: '🛍️' },
        outfit: { subject: 'New Outfit Suggestion', emoji: '👔' },
        achievement: { subject: 'Achievement Unlocked!', emoji: '🏆' },
        system: { subject: 'MyDresser Notification', emoji: '🔔' },
      };
      return templates[type] || templates.system;
    };

    const template = getEmailTemplate(type);

    // Create HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .emoji { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">${template.emoji}</div>
              <h1 style="margin: 0;">${title}</h1>
            </div>
            <div class="content">
              <p>${message}</p>
              ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
            </div>
            <div class="footer">
              <p>MyDresser - Your AI-Powered Personal Wardrobe Assistant</p>
              <p>You're receiving this email because you have email notifications enabled.</p>
              <p><a href="https://mydresser.app/settings?tab=notifications">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // In production, integrate with an email service like SendGrid, Resend, or AWS SES
    // For now, we'll log the email details
    console.log('Email notification:', {
      to: user.email,
      subject: `${template.emoji} ${template.subject} - ${title}`,
      html: htmlContent,
    });

    // TODO: Replace with actual email sending service
    // Example with Resend:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'MyDresser <notifications@mydresser.app>',
    //   to: user.email,
    //   subject: `${template.emoji} ${template.subject} - ${title}`,
    //   html: htmlContent,
    // });

    return new Response(
      JSON.stringify({ success: true, message: 'Email notification queued' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending notification email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
