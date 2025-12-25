import { Injectable } from '@nestjs/common';
import { config } from '../../../../config/env';

export interface StoreOwnerWelcomeEmailData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  verificationLink: string;
}

@Injectable()
export class StoreOwnerWelcomeEmailService {
  /**
   * Generate HTML email content for store owner welcome email
   */
  generateEmailContent(data: StoreOwnerWelcomeEmailData): string {
    const { email, firstName, lastName, password, verificationLink } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
        }
        .content {
            background-color: #ffffff;
            padding: 25px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .password-box {
            background-color: #f0f0f0;
            border: 2px dashed #3498db;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            background-color: #2980b9;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #7f8c8d;
            font-size: 12px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Platform!</h1>
        </div>
        
        <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            
            <p>Your store owner account has been successfully created. Below are your account credentials:</p>
            
            <div class="password-box">
                <strong>Your Temporary Password:</strong><br>
                ${password}
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> Please change your password after your first login and verify your email address.
            </div>
            
            <p>To get started, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3498db;">${verificationLink}</p>
            
            <p>After verifying your email, you can log in using:</p>
            <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Password:</strong> ${password}</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            ${config.brevo.senderName}</p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text email content for store owner welcome email
   */
  generatePlainTextContent(data: StoreOwnerWelcomeEmailData): string {
    const { email, firstName, lastName, password, verificationLink } = data;

    return `
Welcome to Our Platform!

Dear ${firstName} ${lastName},

Your store owner account has been successfully created. Below are your account credentials:

Your Temporary Password: ${password}

⚠️ Important: Please change your password after your first login and verify your email address.

To get started, please verify your email address by visiting this link:
${verificationLink}

After verifying your email, you can log in using:
- Email: ${email}
- Password: ${password}

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
${config.brevo.senderName}

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} All rights reserved.
    `.trim();
  }
}
