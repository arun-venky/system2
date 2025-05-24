import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP connection error:', error);
  } else {
    logger.info('SMTP server is ready to send emails');
  }
});

// Email templates
const emailTemplates = {
  passwordReset: (resetLink: string) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  }),
  verification: (verificationLink: string) => ({
    subject: 'Verify Your Email',
    html: `
      <h1>Email Verification</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `,
  }),
};

// Send email function
async function sendEmail(to: string, template: { subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to,
      subject: template.subject,
      html: template.html,
    });
    
    logger.info('Email sent successfully', { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  const template = emailTemplates.passwordReset(resetLink);
  return sendEmail(email, template);
}

// Send verification email
export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  const template = emailTemplates.verification(verificationLink);
  return sendEmail(email, template);
} 