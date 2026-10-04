package com.jarvis.ai;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

public class JarvisAccessibilityService extends AccessibilityService {
    private static final String TAG = "JarvisAccessibility";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        Log.d(TAG, "Accessibility Event captured: " + event.getEventType());
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted");
    }
}
