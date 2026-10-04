# 🚀 JARVIS Android APK Releases (`/releases`)

This directory provides release specifications, release notes, and build automation scripts to compile and package JARVIS into a standalone Android APK.

---

## 📦 Release v1.0.0 (Production Ready)

- **Application Name**: JARVIS
- **Package ID**: `com.jarvis.ai`
- **Version**: `1.0.0`
- **Target SDK**: Android 14 (API level 34)
- **Minimum SDK**: Android 7.0 (API level 24)
- **Architecture**: ARM64-v8a, armeabi-v7a, x86_64

---

## 🛠️ One-Click APK Compilation

You can compile the debug or signed release APK with the following commands:

```bash
# 1. Build the production web bundle
npm run build

# 2. Sync to Android project
npx cap sync

# 3. Build Debug APK using Gradle
cd android && ./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk

# 4. Build Signed Release APK
cd android && ./gradlew assembleRelease

# Output APK path:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🔑 Offline API Key & Zero-Server Mobile Operation

When installed on a smartphone, JARVIS operates completely standalone without needing a local development server:
1. Open JARVIS on your phone.
2. Tap the **`[CONFIG]`** settings icon in the bottom dock.
3. Enter your Gemini API Key in the **GEMINI API KEY (APK & LIVE)** field.
4. Tap **`SAVE`**.
5. Tap **`PERMS`** in the top HUD or click **`GRANT ALL 12 PERMISSIONS`** in the permission manager.
6. JARVIS is now ready for continuous, voice-to-voice bidirectional AI assistance!
