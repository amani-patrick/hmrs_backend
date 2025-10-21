import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class SmsService {
  private twilioConfigured: boolean = false;
  private awsSnsConfigured: boolean = false;

  constructor() {
    // Initialize from environment variables
    this.twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    this.awsSnsConfigured = !!(process.env.AWS_SNS_REGION && process.env.AWS_ACCESS_KEY_ID);
  }

  async sendSMS(notification: Notification, phoneNumber: string): Promise<boolean> {
    try {
      if (this.twilioConfigured) {
        return await this.sendViaTwilio(notification, phoneNumber);
      } else if (this.awsSnsConfigured) {
        return await this.sendViaAWSSNS(notification, phoneNumber);
      } else {
        // No service configured - log and return success for development
        console.log('📱 SMS (No service configured):', {
          to: phoneNumber,
          message: `${notification.title}: ${notification.message}`,
        });
        return true;
      }
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      return false;
    }
  }

  private async sendViaTwilio(notification: Notification, phoneNumber: string): Promise<boolean> {
    // Twilio Implementation
    // const twilio = require('twilio');
    // const client = twilio(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN
    // );
    
    // await client.messages.create({
    //   body: `${notification.title}: ${notification.message}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber,
    // });
    
    console.log('📱 SMS (Twilio):', notification.title, 'to', phoneNumber);
    return true;
  }

  private async sendViaAWSSNS(notification: Notification, phoneNumber: string): Promise<boolean> {
    // AWS SNS Implementation
    // const AWS = require('aws-sdk');
    // const sns = new AWS.SNS({ region: process.env.AWS_SNS_REGION });
    
    // const params = {
    //   Message: `${notification.title}: ${notification.message}`,
    //   PhoneNumber: phoneNumber,
    //   MessageAttributes: {
    //     'AWS.SNS.SMS.SenderID': {
    //       DataType: 'String',
    //       StringValue: 'H2HRMS',
    //     },
    //   },
    // };
    
    // await sns.publish(params).promise();
    
    console.log('📱 SMS (AWS SNS):', notification.title, 'to', phoneNumber);
    return true;
  }
}
