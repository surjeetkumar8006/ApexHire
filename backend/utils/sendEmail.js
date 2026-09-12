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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: smtpEmail,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"ApexHire Career Portal" <${smtpEmail}>`,
    to: options.email,
    subject: options.subject || 'Password Reset OTP Verification - ApexHire',
    html: options.htmlMessage || `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; padding: 30px; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800;">ApexHire Portal</h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0 0;">AI Campus & Placement Engine 2026</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
          <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #ffffff;">Password Reset Verification OTP</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 20px 0;">Use the 6-digit OTP code below to reset your account password. This code will expire in 15 minutes.</p>
          <div style="background: #0f172a; border: 2px dashed #38bdf8; padding: 15px 25px; display: inline-block; border-radius: 12px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8;">
            ${options.otp}
          </div>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};

export default sendEmail;
