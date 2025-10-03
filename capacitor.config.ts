import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.98ef31511e174996ae6eea7cd0cea467',
  appName: 'mydresser-firts-demo',
  webDir: 'dist',
  server: {
    url: 'https://98ef3151-1e17-4996-ae6e-ea7cd0cea467.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    }
  }
};

export default config;
