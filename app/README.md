# 📱 JARVIS Android App Module (`/app`)

This directory contains the native Android Application source files for JARVIS:

- `src/main/AndroidManifest.xml`: Declares all 12 critical permissions, background services, accessibility service, notification listener & boot receiver.
- `src/main/java/com/jarvis/ai/MainActivity.java`: Capacitor Bridge Activity granting webview microphone & camera hardware permissions automatically.
- `build.gradle`: Android application build configuration.

To build the project:
```bash
npm run build
npx cap sync
npx cap open android
```
