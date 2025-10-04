import { useEffect } from 'react';

/**
 * Hook to set security-related meta tags and headers
 */
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy
    const metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    metaCSP.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    
    // X-Frame-Options (Clickjacking protection)
    const metaFrame = document.createElement('meta');
    metaFrame.httpEquiv = 'X-Frame-Options';
    metaFrame.content = 'DENY';
    
    // X-Content-Type-Options
    const metaContentType = document.createElement('meta');
    metaContentType.httpEquiv = 'X-Content-Type-Options';
    metaContentType.content = 'nosniff';
    
    // Referrer Policy
    const metaReferrer = document.createElement('meta');
    metaReferrer.name = 'referrer';
    metaReferrer.content = 'strict-origin-when-cross-origin';
    
    // Permissions Policy
    const metaPermissions = document.createElement('meta');
    metaPermissions.httpEquiv = 'Permissions-Policy';
    metaPermissions.content = 'camera=(self), microphone=(), geolocation=(self)';

    document.head.appendChild(metaCSP);
    document.head.appendChild(metaFrame);
    document.head.appendChild(metaContentType);
    document.head.appendChild(metaReferrer);
    document.head.appendChild(metaPermissions);

    return () => {
      // Cleanup on unmount
      document.head.removeChild(metaCSP);
      document.head.removeChild(metaFrame);
      document.head.removeChild(metaContentType);
      document.head.removeChild(metaReferrer);
      document.head.removeChild(metaPermissions);
    };
  }, []);
};
