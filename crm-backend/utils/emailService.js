// crm-backend/utils/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendNewLeadNotification = async (lead) => {
  const { name, email, phone, source, message } = lead;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
  const crmUrl = process.env.CRM_FRONTEND_URL || 'http://localhost:5173';

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Resend API key missing');
    return { success: false, error: 'Missing API key' };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Received</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 24px 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px; }
        .lead-details { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .detail-row { margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
        .detail-label { font-weight: 600; color: #334155; width: 80px; display: inline-block; }
        .detail-value { color: #0f172a; }
        .button { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white !important; text-decoration: none; padding: 12px 28px; border-radius: 40px; font-weight: 600; margin-top: 20px; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>✨ New Lead Received</h1></div>
        <div class="content">
          <p style="font-size:18px;">Hello,</p>
          <p>A new lead has been submitted. Here are the details:</p>
          <div class="lead-details">
            <div class="detail-row"><span class="detail-label">Name:</span> <span class="detail-value">${escapeHtml(name)}</span></div>
            <div class="detail-row"><span class="detail-label">Email:</span> <span class="detail-value">${escapeHtml(email)}</span></div>
            <div class="detail-row"><span class="detail-label">Phone:</span> <span class="detail-value">${phone ? escapeHtml(phone) : 'Not provided'}</span></div>
            <div class="detail-row"><span class="detail-label">Source:</span> <span class="detail-value">${source ? escapeHtml(source) : 'website'}</span></div>
            <div class="detail-row"><span class="detail-label">Message:</span> <span class="detail-value">${message ? escapeHtml(message) : 'No message'}</span></div>
          </div>
          <div style="text-align: center;"><a href="${crmUrl}/dashboard" class="button">🔐 Go to CRM Dashboard</a></div>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} CRM System | Automated notification</p></div>
      </div>
    </body>
    </html>
  `;

  const text = `New Lead\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nSource: ${source || 'website'}\nMessage: ${message || 'No message'}\n\nLogin: ${crmUrl}/dashboard`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `New Lead: ${name} (${source || 'website'})`,
      html,
      text,
    });
    console.log('✅ Email sent via Resend');
    return { success: true };
  } catch (err) {
    console.error('❌ Email error:', err);
    return { success: false, error: err.message };
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}