import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.tlempar.app',
  appName: 'TL em Par',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#feb621',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#feb621',
    },
  },
};

export default config;
