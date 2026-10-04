package com.jarvis.ai;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

public class JarvisNotificationListenerService extends NotificationListenerService {
    private static final String TAG = "JarvisNotification";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        Log.d(TAG, "Notification received from package: " + packageName);
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Notification dismissed
    }
}
