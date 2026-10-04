# 🚀 GitHub Actions से APK कैसे बनाएं और डाउनलोड करें (Step-by-Step Guide)

इस रिपॉजिटरी में `.github/workflows/build-apk.yml` वर्कफ़्लो जोड़ दिया गया है, जो **GitHub Actions** के ज़रिये ऑटोमैटिक और मैन्युअल दोनों तरीकों से **Android APK** तैयार करता है।

---

## 📌 तरीक़ा 1: GitHub वेबसाइट से 1-क्लिक में APK बनाना (Manual Trigger)

1. अपने GitHub रिपॉजिटरी पेज पर जाएँ।
2. ऊपर **`Actions`** टैब पर क्लिक करें।
3. बाएँ मेन्यू में **`🚀 Build JARVIS Android APK`** पर क्लिक करें।
4. दाएँ कोने में स्थित **`Run workflow`** बटन पर क्लिक करें।
5. **Build Type** चुनें (`debug`, `release`, या `both`)।
6. **`Run workflow`** हरे बटन को दबाएँ!
7. कुछ ही मिनटों (2-3 मिनट) में वर्कफ़्लो पूरा हो जाएगा (हरा टिक ✅ दिखेगा)।
8. उस रन पर क्लिक करें और सबसे नीचे **Artifacts** सेक्शन में जाकर **`jarvis-debug-apk`** या **`jarvis-release-apk`** डाउनलोड कर लें!

---

## 📌 तरीक़ा 2: ऑटोमैटिक बिल्ड (On Git Push / Git Tag)

- जब भी आप `main` या `master` ब्रांच में कोई नया कोड **`git push`** करेंगे, GitHub Actions अपने आप नया APK बिल्ड कर देगा।
- यदि आप नया रिलीज़ टैग पुश करते हैं (उदाहरण: `git tag v1.0.0 && git push origin v1.0.0`), तो GitHub Actions अपने आप **GitHub Release** बनाकर APK को सीधे रिलीज़ पेज पर अटैच कर देगा!

---

## 🛠️ वर्कफ़्लो की तकनीकी विशेषताएं:
- **JDK 17 (Temurin)**: आधुनिक Android SDK 34 कंपाइलेशन।
- **Node.js 20**: React 18 + Vite प्रोडक्शन बंडल बिल्ड।
- **Capacitor Auto-Sync**: वेब कोड को नेटिव एंड्रॉइड में सिंक करता है।
- **Gradle 8.2**: APK को कंपाइल करके आर्टिफैक्ट्स में 30 दिनों के लिए सुरक्षित स्टोर करता है।
