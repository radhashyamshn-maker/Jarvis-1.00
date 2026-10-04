#!/usr/bin/env bash
set -e

echo "=============================================="
echo "⚡ Building JARVIS Android APK (Version 1.0.0)"
echo "=============================================="

# 1. Build Vite frontend bundle
echo "==> [1/3] Building Web bundle (npm run build)..."
npm run build

# 2. Synchronize assets to Capacitor Android project
echo "==> [2/3] Synchronizing assets to Android project..."
npx cap sync android

# 3. Assemble Android APK via Gradle
echo "==> [3/3] Compiling APK with Gradle..."
if [ -d "android" ]; then
  cd android
  if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    ./gradlew assembleDebug
    echo "=============================================="
    echo "✅ APK successfully compiled at:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo "=============================================="
  else
    echo "ℹ️  Run 'npx cap open android' to build in Android Studio."
  fi
else
  echo "ℹ️  Run 'npx cap add android' to initialize Android platform."
fi
