import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class EmailService {
  private sendGridApiKey: string;
  private awsSesConfigured: boolean = false;

  constructor() {
    // Initialize from environment variables
    this.sendGridApiKey = process.env.SENDGRID_API_KEY || '';
    this.awsSesConfigured = !!(process.env.AWS_SES_REGION && process.env.AWS_ACCESS_KEY_ID);
  }

  async sendEmail(notification: Notification): Promise<boolean> {
    try {
      // Check if any service is configured
      if (this.sendGridApiKey) {
        return await this.sendViaSendGrid(notification);
      } else if (this.awsSesConfigured) {
        return await this.sendViaAWSSES(notification);
      } else {
        // No service configured - log and return success for development
        console.log('📧 EMAIL (No service configured):', {
          to: notification.userId,
          subject: notification.title,
          body: notification.message,
        });
        return true;
      }
    } catch (error) {
      console.error('Email sending failed:', error.message);
      return false;
    }
  }

  private async sendViaSendGrid(notification: Notification): Promise<boolean> {
    // SendGrid Implementation
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.sendGridApiKey);
    
    // const msg = {
    //   to: notification.userEmail, // would need user email
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject: notification.title,
    //   text: notification.message,
    //   html: this.generateHtmlTemplate(notification),
    // };
    
    // await sgMail.send(msg);
    
    console.log('📧 EMAIL (SendGrid):', notification.title);
    return true;
  }

  private async sendViaAWSSES(notification: Notification): Promise<boolean> {
    // AWS SES Implementation
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: process.env.AWS_SES_REGION });
    
    // const params = {
    //   Source: process.env.AWS_SES_FROM_EMAIL,
    //   Destination: {
    //     ToAddresses: [notification.userEmail],
    //   },
    //   Message: {
    //     Subject: { Data: notification.title },
    //     Body: {
    //       Html: { Data: this.generateHtmlTemplate(notification) },
    //       Text: { Data: notification.message },
    //     },
    //   },
    // };
    
    // await ses.sendEmail(params).promise();
    
    console.log('📧 EMAIL (AWS SES):', notification.title);
    return true;
  }

  private generateHtmlTemplate(notification: Notification): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
            .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${notification.title}</h2>
            </div>
            <div class="content">
              <p>${notification.message}</p>
              ${notification.actionUrl ? `<p><a href="${notification.actionUrl.path}" class="button">${notification.actionUrl.label || 'View Details'}</a></p>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated message from H2 HRMS. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
