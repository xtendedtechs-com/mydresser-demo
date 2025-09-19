import React, { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CAPTCHA_PROVIDER, CAPTCHA_SITE_KEY } from "@/config/security";

declare global {
  interface Window {
    turnstile?: any;
    hcaptcha?: any;
  }
}

interface SupabaseCaptchaProps {
  onVerify: (token: string) => void;
  className?: string;
}

export const SupabaseCaptcha: React.FC<SupabaseCaptchaProps> = ({ onVerify, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no site key configured, surface a helpful message
    if (!CAPTCHA_SITE_KEY) {
      setError("CAPTCHA is required by the authentication server. Please configure your site key.");
      return;
    }

    const addScript = (src: string, onload: () => void) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        onload();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = onload;
      script.onerror = () => setError("Failed to load CAPTCHA script");
      document.head.appendChild(script);
    };

    if (CAPTCHA_PROVIDER === "turnstile") {
      addScript("https://challenges.cloudflare.com/turnstile/v0/api.js", () => setLoaded(true));
    } else {
      addScript("https://hcaptcha.com/1/api.js?render=explicit", () => setLoaded(true));
    }
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !CAPTCHA_SITE_KEY) return;

    // Clear any previous widget
    containerRef.current.innerHTML = "";

    if (CAPTCHA_PROVIDER === "turnstile" && window.turnstile) {
      try {
        window.turnstile.render(containerRef.current, {
          sitekey: CAPTCHA_SITE_KEY,
          callback: (token: string) => onVerify(token),
          "error-callback": () => setError("CAPTCHA error. Please retry."),
          "expired-callback": () => onVerify(""),
          theme: "auto",
        });
      } catch (e) {
        setError("Failed to initialize Turnstile");
      }
    } else if (CAPTCHA_PROVIDER === "hcaptcha" && window.hcaptcha) {
      try {
        window.hcaptcha.render(containerRef.current, {
          sitekey: CAPTCHA_SITE_KEY,
          callback: (token: string) => onVerify(token),
          "error": () => setError("CAPTCHA error. Please retry."),
          theme: "light",
        });
      } catch (e) {
        setError("Failed to initialize hCaptcha");
      }
    }
  }, [loaded]);

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-3">
        <Label>Security Check</Label>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div ref={containerRef} className="flex justify-center" />
      </CardContent>
    </Card>
  );
};

export default SupabaseCaptcha;
