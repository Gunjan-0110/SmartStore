const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
     return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('⚠️ Mailer skipped: EMAIL_USER or EMAIL_PASS not configured in .env');
      return;
    }

    await transporter.sendMail({
      from: `"SmartStock OS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log(`✉️ Email dispatched to ${to}: ${subject}`);
  } catch (error) {
    console.error('❌ Mailer Error:', error.message);
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #3b82f6;">Welcome to SmartStock OS!</h2>
      <p>Hello <b>${userName}</b>,</p>
      <p>Your account has been successfully registered. You can now access the inventory management system.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated system notification.</p>
    </div>
  `;
  await sendEmail(userEmail, 'Account Registered - SmartStock OS', html);
};

const sendLoginAlert = async (userEmail, userName) => {
  const time = new Date().toLocaleString();
  const html = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #f59e0b;">New Login Detected</h2>
      <p>Hello <b>${userName}</b>,</p>
      <p>A successful login was just detected on your SmartStock account.</p>
      <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border-left: 4px solid #f59e0b; margin: 16px 0;">
         <p style="margin: 0;"><b>Time:</b> ${time}</p>
      </div>
      <p>If this was you, you can safely ignore this email.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated security notification.</p>
    </div>
  `;
  await sendEmail(userEmail, 'Security Alert: New Login - SmartStock OS', html);
};

module.exports = { sendWelcomeEmail, sendLoginAlert };
