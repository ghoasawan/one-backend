import nodemailer from "nodemailer";
import { generateToken } from "./token_generation.js";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .email-header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .email-header p {
          color: #e0e7ff;
          font-size: 16px;
        }
        .email-body {
          padding: 40px 30px;
        }
        .email-body h2 {
          color: #2d3748;
          font-size: 22px;
          margin-bottom: 15px;
        }
        .email-body p {
          color: #4a5568;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .verify-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 40px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          margin: 25px 0;
          transition: transform 0.2s;
        }
        .verify-button:hover {
          transform: translateY(-2px);
        }
        .email-footer {
          background: #f7fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .email-footer p {
          color: #718096;
          font-size: 13px;
          line-height: 1.6;
        }
        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 20px 0;
        }
        .warning-text {
          color: #e53e3e;
          font-size: 13px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>🎉 Welcome!</h1>
          <p>You're one step away from completing your registration</p>
        </div>
        <div class="email-body">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="verify-button">Verify My Email</a>
          </div>
          
          <div class="divider"></div>
          
          <p style="font-size: 13px; color: #718096;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #667eea; word-break: break-all;">${verificationUrl}</p>
          
          <p class="warning-text">⚠️ This verification link will expire in 1 hour. If you don't verify your email within this time, you'll need to sign up again.</p>
          
          <p style="font-size: 13px; color: #a0aec0; margin-top: 20px;">If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="email-footer">
          <p>© 2026 One-Chat. All rights reserved.</p>
          <p style="margin-top: 10px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"One-Chat" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '✓ Verify Your Email Address - One-Chat',
    html: htmlTemplate,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

