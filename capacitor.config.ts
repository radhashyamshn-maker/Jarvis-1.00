/**
 * Capacitor Configuration for JARVIS
 * Ready for Android APK generation with all requested system & advanced hardware permissions.
 */
export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  android?: {
    allowMixedContent?: boolean;
    permissions?: string[];
  };
  server?: {
    androidScheme?: string;
    cleartext?: boolean;
  };
  plugins?: Record<string, any>;
}

const config: CapacitorConfig = {
  appId: 'com.jarvis.ai',
  appName: 'JARVIS',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
    permissions: [
      // 1. Microphone & Audio
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',

      // 2. Camera & Vision
      'android.permission.CAMERA',

      // 3. Location (GPS & Background)
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',

      // 4. Contacts
      'android.permission.READ_CONTACTS',
      'android.permission.WRITE_CONTACTS',
      'android.permission.GET_ACCOUNTS',

      // 5. Phone Calls & SMS
      'android.permission.CALL_PHONE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.SEND_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_SMS',

      // 6. All Files Access & Media Storage
      'android.permission.MANAGE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',

      // 7. Display Over Other Apps (Floating HUD Overlay)
      'android.permission.SYSTEM_ALERT_WINDOW',

      // 8. Screen Capture & Foreground Services
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MICROPHONE',
      'android.permission.FOREGROUND_SERVICE_CAMERA',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION',

      // 9. Battery Optimization & Background Execution
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      'android.permission.WAKE_LOCK',

      // 10. Auto-Start on Boot & Notifications
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Permissions: {
      all: true,
    },
  },
};

export default config;
