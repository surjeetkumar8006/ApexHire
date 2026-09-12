import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER || '';
  const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || '';

  if (!smtpEmail || !smtpPass) {
    console.log(`[Email Service Notice] SMTP_EMAIL / SMTP_PASSWORD not configured in .env. Email to ${options.email} skipped. OTP Code: ${options.otp}`);
    return { success: false, simulated: true };
  }

  // Clean SMTP password (remove any spaces user might have pasted)
  const cleanPass = smtpPass.replace(/\s+/g, '');

  const isGmail = (process.env.SMTP_HOST || 'smtp.gmail.com').includes('gmail');

  const transporterConfig = isGmail
    ? {
        service: 'gmail',
        auth: {
          user: smtpEmail,
          pass: cleanPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: smtpEmail,
          pass: cleanPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      };

  const transporter = nodemailer.createTransport(transporterConfig);

  const mailOptions = {
    from: `"ApexHire Career Portal" <${smtpEmail}>`,
    to: options.email,
    subject: options.subject || 'Password Reset OTP Verification - ApexHire',
    html: options.htmlMessage || `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ApexHire Security OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 580px; margin: 30px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          
          <!-- Top Accent Bar -->
          <div style="height: 6px; background: linear-gradient(90deg, #0284c7 0%, #6366f1 50%, #8b5cf6 100%);"></div>

          <!-- Header Section -->
          <div style="padding: 32px 40px 24px 40px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
            <div style="margin-bottom: 10px;">
              <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">Apex<span style="color: #0284c7;">Hire</span></span>
            </div>
            <div style="display: inline-block; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 1px;">
              AI Campus & Placement Engine 2026
            </div>
          </div>

          <!-- Main Content Area -->
          <div style="padding: 36px 40px; background: #ffffff;">
            
            <!-- Heading & Context -->
            <div style="text-align: center; margin-bottom: 28px;">
              <div style="display: inline-block; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 50%; width: 58px; height: 58px; line-height: 58px; text-align: center; font-size: 26px; margin-bottom: 16px;">
                🔐
              </div>
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                Password Reset Verification
              </h1>
              <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
                We received a request to reset your password for your ApexHire account. Use the 6-digit OTP code below to proceed:
              </p>
            </div>

            <!-- Clean White/Light OTP Display Box -->
            <div style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 18px; padding: 26px 20px; text-align: center; margin-bottom: 28px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.02);">
              <p style="margin: 0 0 14px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #64748b;">
                YOUR 6-DIGIT VERIFICATION CODE
              </p>
              <div style="display: inline-block; background: #ffffff; border: 2px dashed #0284c7; border-radius: 14px; padding: 16px 32px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.12);">
                <span style="font-family: 'Consolas', 'Courier New', monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0284c7; margin-right: -10px;">
                  ${options.otp}
                </span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #d97706; font-weight: 600;">
                ⏱ Code expires in <strong>15 minutes</strong> • Do not share with anyone
              </p>
            </div>

            <!-- Security Notice Card -->
            <div style="background: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 28px;">
              <p style="margin: 0; font-size: 12px; color: #0369a1; line-height: 1.55;">
                <strong style="color: #0c4a6e;">🛡️ Security Notice:</strong> If you did not request a password reset, you can safely ignore this message. Your account remains secure.
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #64748b;">
              Need assistance? Contact support at <a href="mailto:support@apexhire.ai" style="color: #0284c7; text-decoration: none; font-weight: 600;">support@apexhire.ai</a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">
              ApexHire AI Placement Engine 2026
            </p>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
              © 2026 ApexHire Inc. All rights reserved. Automated security email.
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};

export default sendEmail;
