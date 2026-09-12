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
      <body style="margin: 0; padding: 0; background-color: #030712; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 580px; margin: 30px auto; background: #0b1329; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Gradient Accent Bar -->
          <div style="height: 6px; background: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);"></div>

          <!-- Header Section -->
          <div style="padding: 32px 40px 24px 40px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
            <div style="margin-bottom: 10px;">
              <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">Apex<span style="color: #38bdf8;">Hire</span></span>
            </div>
            <div style="display: inline-block; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;">
              AI Campus & Placement Engine 2026
            </div>
          </div>

          <!-- Main Content Area -->
          <div style="padding: 36px 40px;">
            
            <!-- Heading & Context -->
            <div style="text-align: center; margin-bottom: 28px;">
              <div style="display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; text-align: center; font-size: 26px; margin-bottom: 16px;">
                🔐
              </div>
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">
                Password Reset Verification
              </h1>
              <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                We received a request to reset your password for your ApexHire account. Use the 6-digit OTP code below to proceed:
              </p>
            </div>

            <!-- Premium OTP Display Box -->
            <div style="background: linear-gradient(180deg, #0f172a 0%, #090d16 100%); border: 1px solid #334155; border-radius: 20px; padding: 26px 20px; text-align: center; margin-bottom: 28px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
              <p style="margin: 0 0 14px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #64748b;">
                YOUR 6-DIGIT VERIFICATION CODE
              </p>
              <div style="display: inline-block; background: #030712; border: 2px dashed #38bdf8; border-radius: 16px; padding: 16px 32px; margin-bottom: 14px;">
                <span style="font-family: 'Consolas', 'Courier New', monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; margin-right: -10px;">
                  ${options.otp}
                </span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #fbbf24; font-weight: 600;">
                ⏱ Code expires in <strong>15 minutes</strong> • Do not share with anyone
              </p>
            </div>

            <!-- Security Notice Card -->
            <div style="background: rgba(30, 41, 59, 0.5); border-left: 4px solid #38bdf8; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 28px;">
              <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.55;">
                <strong style="color: #ffffff;">🛡️ Security Notice:</strong> If you did not request a password reset, you can safely ignore this message. Your account remains secure.
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #64748b;">
              Need assistance? Contact support at <a href="mailto:support@apexhire.ai" style="color: #38bdf8; text-decoration: none; font-weight: 600;">support@apexhire.ai</a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #070b14; border-top: 1px solid rgba(255, 255, 255, 0.05); padding: 20px 40px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">
              ApexHire AI Placement Engine 2026
            </p>
            <p style="margin: 0; font-size: 11px; color: #334155;">
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
