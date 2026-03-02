const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

let transporter;

const initTransporter = () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) initTransporter();
  try {
    const info = await transporter.sendMail({
      from: `"SkillSwap" <${process.env.FROM_EMAIL}>`,
      to, subject, html, text,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send failed:', error);
    throw error;
  }
};

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your SkillSwap email',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px;background:#0f172a;color:#e2e8f0;border-radius:12px">
        <h1 style="color:#8b5cf6;margin-bottom:8px">Welcome to SkillSwap!</h1>
        <p>Hi ${user.name}, verify your email to start learning and teaching.</p>
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0">Verify Email</a>
        <p style="color:#94a3b8;font-size:14px">Link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your SkillSwap password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px;background:#0f172a;color:#e2e8f0;border-radius:12px">
        <h1 style="color:#8b5cf6">Reset Password</h1>
        <p>Hi ${user.name}, click below to reset your password.</p>
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0">Reset Password</a>
        <p style="color:#94a3b8;font-size:14px">Link expires in 1 hour. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

const sendSessionReminderEmail = async (user, session) => {
  await sendEmail({
    to: user.email,
    subject: `Reminder: "${session.title}" starts in 30 minutes`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px;background:#0f172a;color:#e2e8f0;border-radius:12px">
        <h1 style="color:#8b5cf6">Session Reminder</h1>
        <p>Hi ${user.name}! Your session <strong>${session.title}</strong> starts soon.</p>
        <p>Start time: ${new Date(session.startTime).toLocaleString()}</p>
        <a href="${process.env.CLIENT_URL}/sessions/${session._id}/room" 
           style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0">
          Join Session
        </a>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendSessionReminderEmail };
