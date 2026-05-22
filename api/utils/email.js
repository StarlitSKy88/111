// 邮件发送模块 - 腾讯云邮件推送
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 腾讯云 SMTP 配置
const SMTP_CONFIG = {
  host: 'gz-smtp.qcloudmail.com',
  port: 465,
  secure: true, // SSL
  user: 'nodemailer@taomyst.top',
  pass: 'X1aoYang820212'
};

// 创建 transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass
      }
    });
  }
  return transporter;
}

// 生成6位验证码
function generateVerifyCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// 生成验证Token（用于邮箱验证链接）
function generateVerifyToken(email) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 15 * 60 * 1000; // 15分钟有效
  return {
    token,
    expires,
    email,
    tokenHash: crypto.createHash('sha256').update(token + email).digest('hex')
  };
}

// 发送验证码邮件
async function sendVerifyCodeEmail(email, code) {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"taomyst" <nodemailer@taomyst.top>`,
    to: email,
    subject: '【OPC节点百科】邮箱验证码',
    html: `
      <div style="font-family: 'Noto Sans SC', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 300; color: #F0EDE6; letter-spacing: -0.02em;">OPC节点百科</h1>
        </div>
        <div style="background: #1A1A18; border: 1px solid #2A2A28; padding: 32px; text-align: center;">
          <p style="color: #7A7670; font-size: 14px; margin-bottom: 24px;">您的验证码是</p>
          <p style="font-size: 48px; font-weight: 300; color: #C0392B; letter-spacing: 0.2em; margin: 0;">${code}</p>
          <p style="color: #4A4744; font-size: 12px; margin-top: 24px;">验证码15分钟内有效，请尽快完成验证</p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #4A4744; font-size: 12px;">如果没有收到邮件，请检查垃圾箱或重新发送</p>
        </div>
      </div>
    `,
    text: `您的验证码是：${code}，15分钟内有效。OPC节点百科。`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[email] 验证码邮件已发送:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] 发送失败:', error);
    return { success: false, error: error.message };
  }
}

// 发送验证链接邮件
async function sendVerifyLinkEmail(email, token) {
  const transporter = getTransporter();
  const verifyUrl = `https://taomyst.top/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"taomyst" <nodemailer@taomyst.top>`,
    to: email,
    subject: '【OPC节点百科】邮箱验证',
    html: `
      <div style="font-family: 'Noto Sans SC', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 300; color: #F0EDE6; letter-spacing: -0.02em;">OPC节点百科</h1>
        </div>
        <div style="background: #1A1A18; border: 1px solid #2A2A28; padding: 32px; text-align: center;">
          <p style="color: #7A7670; font-size: 14px; margin-bottom: 24px;">点击下方按钮验证您的邮箱</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #C0392B; color: #F0EDE6; text-decoration: none; padding: 14px 32px; font-size: 14px; letter-spacing: 0.1em;">验证邮箱</a>
          <p style="color: #4A4744; font-size: 12px; margin-top: 24px;">链接15分钟内有效</p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #4A4744; font-size: 12px;">如果没有收到邮件，请检查垃圾箱或重新发送</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[email] 验证链接已发送:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] 发送失败:', error);
    return { success: false, error: error.message };
  }
}

// 发送欢迎邮件
async function sendWelcomeEmail(email) {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"taomyst" <nodemailer@taomyst.top>`,
    to: email,
    subject: '【OPC节点百科】注册成功',
    html: `
      <div style="font-family: 'Noto Sans SC', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 300; color: #F0EDE6; letter-spacing: -0.02em;">OPC节点百科</h1>
        </div>
        <div style="background: #1A1A18; border: 1px solid #2A2A28; padding: 32px; text-align: center;">
          <p style="color: #F0EDE6; font-size: 16px; margin-bottom: 16px;">注册成功</p>
          <p style="color: #7A7670; font-size: 14px;">欢迎来到OPC节点百科，开始你的创业之旅吧！</p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://taomyst.top" style="color: #C0392B; text-decoration: none; font-size: 14px;">进入网站 →</a>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] 欢迎邮件发送失败:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendVerifyCodeEmail,
  sendVerifyLinkEmail,
  sendWelcomeEmail,
  generateVerifyCode,
  generateVerifyToken,
  SMTP_CONFIG
};
