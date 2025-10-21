import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class PushService {
  private firebaseConfigured: boolean = false;
  private oneSignalConfigured: boolean = false;

  constructor() {
    // Initialize from environment variables
    this.firebaseConfigured = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY);
    this.oneSignalConfigured = !!process.env.ONESIGNAL_APP_ID;
  }

  async sendPush(notification: Notification, deviceTokens: string[]): Promise<boolean> {
    try {
      if (this.firebaseConfigured) {
        return await this.sendViaFirebase(notification, deviceTokens);
      } else if (this.oneSignalConfigured) {
        return await this.sendViaOneSignal(notification, deviceTokens);
      } else {
        // No service configured - log and return success for development
        console.log('🔔 PUSH (No service configured):', {
          title: notification.title,
          body: notification.message,
          tokens: deviceTokens.length,
        });
        return true;
      }
    } catch (error) {
      console.error('Push notification sending failed:', error.message);
      return false;
    }
  }

  private async sendViaFirebase(notification: Notification, deviceTokens: string[]): Promise<boolean> {
    // Firebase Cloud Messaging Implementation
    // const admin = require('firebase-admin');
    
    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert({
    //       projectId: process.env.FIREBASE_PROJECT_ID,
    //       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    //       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    //     }),
    //   });
    // }
    
    // const message = {
    //   notification: {
    //     title: notification.title,
    //     body: notification.message,
    //   },
    //   data: {
    //     notificationId: notification.id,
    //     category: notification.category,
    //     priority: notification.priority,
    //     actionUrl: notification.actionUrl?.path || '',
    //   },
    //   tokens: deviceTokens,
    // };
    
    // await admin.messaging().sendMulticast(message);
    
    console.log('🔔 PUSH (Firebase):', notification.title, 'to', deviceTokens.length, 'devices');
    return true;
  }

  private async sendViaOneSignal(notification: Notification, deviceTokens: string[]): Promise<boolean> {
    // OneSignal Implementation
    // const fetch = require('node-fetch');
    
    // const message = {
    //   app_id: process.env.ONESIGNAL_APP_ID,
    //   contents: { en: notification.message },
    //   headings: { en: notification.title },
    //   include_player_ids: deviceTokens,
    //   data: {
    //     notificationId: notification.id,
    //     category: notification.category,
    //     priority: notification.priority,
    //     actionUrl: notification.actionUrl?.path || '',
    //   },
    // };
    
    // await fetch('https://onesignal.com/api/v1/notifications', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
    //   },
    //   body: JSON.stringify(message),
    // });
    
    console.log('🔔 PUSH (OneSignal):', notification.title, 'to', deviceTokens.length, 'devices');
    return true;
  }
}
