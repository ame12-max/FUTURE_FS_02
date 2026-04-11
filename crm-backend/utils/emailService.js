const nodemailer = require('nodemailer');

// Log credentials presence at startup
console.log('Email Service initialized');
console.log('EMAIL_USER defined:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS defined:', !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Transporter verification failed:', error);
  } else {
    console.log('✅ Email transporter ready');
  }
});

exports.sendNewLeadNotification = async (lead) => {
  const { name, email, phone, source, message } = lead;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const crmUrl = process.env.CRM_FRONTEND_URL || 'http://localhost:5173';

  // Modern HTML email template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Received</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f7fc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #f97316, #ea580c);
          padding: 24px 32px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 32px;
        }
        .lead-details {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          margin-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }
        .detail-label {
          font-weight: 600;
          color: #334155;
          width: 80px;
          display: inline-block;
        }
        .detail-value {
          color: #0f172a;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white !important;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 40px;
          font-weight: 600;
          margin-top: 20px;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .footer {
          background-color: #f1f5f9;
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 20px; }
          .button { display: block; text-align: center; }
        }
      </style>
    </head>
    <body style="margin:0; padding:20px; background-color:#f4f7fc;">
      <div class="container">
        <div class="header">
          <h1>✨ New Lead Received</h1>
        </div>
        <div class="content">
          <p style="font-size:18px; margin-bottom:20px;">Hello,</p>
          <p>A new lead has been submitted through your website. Here are the details:</p>
          
          <div class="lead-details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${escapeHtml(name)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${escapeHtml(email)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${phone ? escapeHtml(phone) : 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Source:</span>
              <span class="detail-value">${source ? escapeHtml(source) : 'website'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Message:</span>
              <span class="detail-value">${message ? escapeHtml(message) : 'No message'}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${crmUrl}/dashboard" class="button">🔐 Go to CRM Dashboard</a>
          </div>
          <p style="margin-top: 24px; font-size: 14px; color: #475569;">
            You can update the lead's status, add notes, and track conversion directly from the dashboard.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CRM System | Automated notification</p>
          <p>If you didn't expect this email, please ignore it.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text alternative (for email clients that block HTML)
  const text = `
New Lead Received
-----------------
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Source: ${source || 'website'}
Message: ${message || 'No message'}

Login to CRM dashboard: ${crmUrl}/dashboard
  `;

  try {
    const info = await transporter.sendMail({
      from: `"CRM System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Lead: ${name} (${source || 'website'})`,
      html,
      text
    });
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email sending failed:', err);
    return { success: false, error: err.message };
  }
};

// Helper to escape HTML special characters
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}