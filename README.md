# 🎯 JARVIS — Sassy Female AI Assistant (Voice-to-Voice APK-ready)

An ultra-responsive, mobile-first, voice-to-voice AI assistant web application and Android APK built with **React 18 + TypeScript + Tailwind CSS + Vite**, powered by **Google Gemini Live API (`@google/genai`)**.

---

## 📱 Full Android Permission Manifest Requirement Guide

When packaging JARVIS as a native Android APK via **Capacitor** or building with **Android Studio & Gradle**, the Android system requires explicit permissions declared in `android/app/src/main/AndroidManifest.xml` and user runtime approvals for sensitive features.

The `PermissionManager.tsx` component systematically iterates through all **12 critical permissions**:

| # | Permission Name | Android Manifest Identifier | Purpose in JARVIS |
|---|---|---|---|
| 1 | **Microphone** | `android.permission.RECORD_AUDIO`<br>`android.permission.MODIFY_AUDIO_SETTINGS` | 16kHz duplex audio for continuous bidirectional voice-to-voice stream & live barge-in. |
| 2 | **Camera** | `android.permission.CAMERA`<br>`android.hardware.camera` | Real-time vision analysis, spatial object recognition & document OCR. |
| 3 | **Location** | `android.permission.ACCESS_FINE_LOCATION`<br>`android.permission.ACCESS_COARSE_LOCATION`<br>`android.permission.ACCESS_BACKGROUND_LOCATION` | Weather forecasts, route navigation & Emergency SOS GPS coordinate broadcast. |
| 4 | **Contacts** | `android.permission.READ_CONTACTS`<br>`android.permission.WRITE_CONTACTS`<br>`android.permission.GET_ACCOUNTS` | Contact directory lookup, speed dialing & automated emergency contact messaging. |
| 5 | **Call / SMS** | `android.permission.CALL_PHONE`<br>`android.permission.READ_PHONE_STATE`<br>`android.permission.SEND_SMS`<br>`android.permission.RECEIVE_SMS`<br>`android.permission.READ_SMS` | Direct phone calling via Phone Intent, reading urgent SMS & sending automated replies. |
| 6 | **Storage (All Files)** | `android.permission.MANAGE_EXTERNAL_STORAGE`<br>`android.permission.READ_MEDIA_IMAGES`<br>`android.permission.READ_MEDIA_VIDEO`<br>`android.permission.READ_MEDIA_AUDIO` | Comprehensive document reading, memory log export & media indexing. |
| 7 | **Accessibility Service** | `android.permission.BIND_ACCESSIBILITY_SERVICE` | Automated button tapping, scrolling, and system interaction protocols. |
| 8 | **Notification Listener** | `android.permission.BIND_NOTIFICATION_LISTENER_SERVICE` | Intercepting incoming WhatsApp, Telegram & OTP alerts in real-time. |
| 9 | **Display Over Apps (Overlay)** | `android.permission.SYSTEM_ALERT_WINDOW` | Floating Arc Reactor HUD bubble over games, browser & background navigation. |
| 10 | **Screen Capture** | `android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION`<br>`android.permission.FOREGROUND_SERVICE` | Real-time on-screen inspection, reading on-screen UI text & contextual assistance. |
| 11 | **Battery Optimization** | `android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`<br>`android.permission.WAKE_LOCK` | Exempts JARVIS from the OS background sleep killer; keeps the assistant alive 24/7. |
| 12 | **Auto-Start on Boot** | `android.permission.RECEIVE_BOOT_COMPLETED` | Starts JARVIS background service automatically when device finishes booting. |

---

### 📄 Complete `AndroidManifest.xml` Configuration

Copy the following manifest into `android/app/src/main/AndroidManifest.xml` (or refer to `android-manifest-template.xml` in this repository):

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.jarvis.ai">

    <!-- 1. Voice & Audio -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- 2. Camera & Vision -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <!-- 3. GPS Geolocation -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- 4. Contacts -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.WRITE_CONTACTS" />
    <uses-permission android:name="android.permission.GET_ACCOUNTS" />

    <!-- 5. Phone Calls & SMS -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />

    <!-- 6. All Files Access & Media Storage -->
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" tools:ignore="ScopedStorage" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" tools:ignore="ScopedStorage" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

    <!-- 7. Display Over Other Apps (Floating Arc Reactor Overlay) -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- 8. Screen Capture & Foreground Services -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />

    <!-- 9. Battery Optimization & Background Execution -->
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- 10. Auto-Start on Boot, Internet & Haptics -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:requestLegacyExternalStorage="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Notification Listener Service for reading incoming alerts -->
        <service
            android:name=".JarvisNotificationListenerService"
            android:label="JARVIS Notification Listener"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

        <!-- Accessibility Service for automated device assistance -->
        <service
            android:name=".JarvisAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:label="JARVIS Assistant Automation"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
        </service>

        <!-- Boot Receiver for Auto-Start on Device Boot -->
        <receiver
            android:name=".BootCompletedReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
```

---

## 📦 Building the Android APK with Capacitor

To compile JARVIS into an installable Android APK:

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Android platform (if not already added)
npx cap add android

# 3. Synchronize web assets and plugins to Android project
npx cap sync

# 4. Open project in Android Studio to build APK
npx cap open android
```

In Android Studio:
1. Go to **Build > Generate Signed Bundle / APK**.
2. Select **APK** and click **Next**.
3. Choose your release keystore and click **Finish**.
4. The compiled APK will be in `android/app/release/app-release.apk`.

---

## 🔐 Standalone APK Mode (Offline API Key Storage)

When packaged as an APK, the app runs without a local Node.js proxy server.
- Users can input their Gemini API Key in the **`[CONFIG]`** settings panel.
- The key is securely saved in `localStorage` under `jarvis_custom_api_key`.
- `LiveSession.ts` prioritizes this key before checking `/api/config` or environment variables, allowing the APK to function standalone on any Android device!

---

## 🎭 Persona: JARVIS
- **Identity**: Young, confident, witty, sassy female AI assistant speaking vibrant **Hinglish** (Hindi + English mix).
- **Tone**: Playful, flirty, charming banter ("Sir, chai banaun ya neend?", "Ho gaya Sir.").
- **Voice**: `Aoede` (Female, crystal-clear 24kHz stream).
- **Model**: `gemini-3.8-live` (with automatic fallback to `gemini-3.1-flash-live-preview`).
- **Format**: Pure audio-to-audio streaming with live barge-in support.

---

## ⚡ Adaptive Tone & Emotion Matching Matrix (12 Rules)

| 🎙️ User Input | 🔊 JARVIS Output | 🎧 Vocal Modulation |
|---|---|---|
| **Dheere bol raha** | **Dheere reply** | Slow, gentle, relaxed cadence. |
| **Tez bol raha** | **Tez reply** | Brisk, fast, snappy tempo. |
| **Whisper me** | **Whisper me** | Hushed, soft, breathy whisper (*whispering softly*). |
| **Zor se** | **Zor se** | Bold, projected, strong Stark presence. |
| **Excited** | **Excited** | High energy, enthusiastic, upbeat joy. |
| **Calm** | **Calm** | Serene, composed, balanced tone. |
| **Gussa** | **Shant + caring** | Soft, soothing care ("Shant ho jaiye Sir, main hoon na"). |
| **Sad** | **Soft + empathetic** | Warm, consoling, tender empathy. |
| **Tired** | **Dheemi + pyaar se** | Soft, sweet bedtime affection. |
| **Confident** | **Confident reply** | Crisp, sharp, authoritative precision. |
| **Nervous** | **Reassuring tone** | Supportive, grounding encouragement. |
| **Happy** | **Happy reply** | Radiant, cheerful laughter, joyful banter. |

---

## 🛠️ Project Structure

```
jarvis-frontend/
├── android-manifest-template.xml  # Complete Android manifest with 12 permissions
├── capacitor.config.ts            # Capacitor Android configuration
├── index.html                     # Entry point & PWA meta
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite bundler configuration
└── src/
    ├── main.tsx                   # App bootstrap
    ├── App.tsx                    # Main Stark HUD interface
    ├── lib/
    │   ├── AudioStreamer.ts       # 16kHz mic recorder + 24kHz audio streamer
    │   ├── LiveSession.ts         # Gemini Live API engine with priority API key loading
    │   ├── permissions.ts         # Runtime permission controller
    │   ├── systemPrompt.ts        # Dynamic prompt & 12-rule tone matching matrix
    │   └── tools.ts               # 50-category tool executor
    └── components/
        ├── ArcReactorCore.tsx     # Central glowing Arc Reactor visualizer
        ├── BottomDock.tsx         # Bottom dock navigation bar
        ├── BreathingModal.tsx     # 4-7-8 breathing meditation guide
        ├── ConfigModal.tsx        # System settings, API Key input & 11 working perms
        ├── FakeCallModal.tsx      # Realistic incoming call simulator
        ├── FeatureMatrixModal.tsx # 500+ features & Tone Matching Matrix
        ├── PermissionManager.tsx  # Systematic 12-permission iterator HUD
        ├── TopHudHeader.tsx       # System status & Stark metrics
        └── VisionModal.tsx        # Live camera & vision scanner
```
