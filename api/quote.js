import nodemailer from 'nodemailer';

// ── Input sanitization ──
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, 2000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Email: Admin notification ──
function adminEmailHtml(data) {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;background-color:#f5f5f5;">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.1);">
  <tr>
    <td style="background:#e0531f;padding:25px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:26px;letter-spacing:1px;">THE LIGHTWAVES</h1>
      <p style="margin:4px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">Construction Services</p>
    </td>
  </tr>
  <tr>
    <td style="padding:35px;color:#333;">
      <h2 style="margin-top:0;font-size:22px;">New Quote Request</h2>
      <p style="font-size:16px;line-height:1.6;color:#555;">A new quote request has been submitted through the website. Details are below:</p>
      <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;margin-top:15px;border:1px solid #eee;">
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;width:40%;">Full Name</td><td style="border:1px solid #eee;">${escapeHtml(data.fullName)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Email</td><td style="border:1px solid #eee;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Phone Number</td><td style="border:1px solid #eee;">${escapeHtml(data.phone)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Project Location</td><td style="border:1px solid #eee;">${escapeHtml(data.location)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Service Required</td><td style="border:1px solid #eee;">${escapeHtml(data.service)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Project Description</td><td style="border:1px solid #eee;">${escapeHtml(data.description)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Date Submitted</td><td style="border:1px solid #eee;">${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</td></tr>
      </table>
      <p style="margin-top:20px;font-size:15px;color:#333;">Please respond to this enquiry as soon as possible.</p>
      <p style="font-size:15px;color:#333;">– The Lightwaves Construction Services</p>
    </td>
  </tr>
  <tr>
    <td style="background:#fafafa;padding:18px;text-align:center;font-size:12px;color:#777;">
      &copy; ${year} The Lightwaves Construction Services. All rights reserved.
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Email: Customer confirmation ──
function customerEmailHtml(data) {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;background-color:#f5f5f5;">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.1);">
  <tr>
    <td style="background:#e0531f;padding:25px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:26px;letter-spacing:1px;">THE LIGHTWAVES</h1>
      <p style="margin:4px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">Construction Services</p>
    </td>
  </tr>
  <tr>
    <td style="padding:35px;color:#333;">
      <h2 style="margin-top:0;font-size:22px;">Quote Request Received</h2>
      <p style="font-size:16px;line-height:1.6;color:#555;">
        Hi <strong>${escapeHtml(data.fullName)}</strong>,
      </p>
      <p style="font-size:16px;line-height:1.6;color:#555;">
        Thank you for requesting a free quote. We have successfully received your project enquiry and one of our construction specialists will review the information you have provided.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#555;">
        We will contact you as soon as possible to discuss your project and provide a quotation.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#555;">Below is a copy of your request for your records:</p>

      <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;margin-top:15px;border:1px solid #eee;">
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;width:40%;">Full Name</td><td style="border:1px solid #eee;">${escapeHtml(data.fullName)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Phone Number</td><td style="border:1px solid #eee;">${escapeHtml(data.phone)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Email</td><td style="border:1px solid #eee;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Project Location</td><td style="border:1px solid #eee;">${escapeHtml(data.location)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Service Required</td><td style="border:1px solid #eee;">${escapeHtml(data.service)}</td></tr>
        <tr><td style="font-weight:bold;background:#f9f5f0;border:1px solid #eee;">Project Description</td><td style="border:1px solid #eee;">${escapeHtml(data.description)}</td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr><td>
          <h3 style="margin:0 0 12px;font-size:18px;color:#1b1a18;">What happens next?</h3>
          <table width="100%" cellpadding="6" cellspacing="0">
            <tr><td style="font-size:15px;color:#555;line-height:1.6;">&#10003; We review your project requirements.</td></tr>
            <tr><td style="font-size:15px;color:#555;line-height:1.6;">&#10003; We may contact you for additional details.</td></tr>
            <tr><td style="font-size:15px;color:#555;line-height:1.6;">&#10003; We prepare a customized quotation.</td></tr>
            <tr><td style="font-size:15px;color:#555;line-height:1.6;">&#10003; We get back to you as soon as possible.</td></tr>
          </table>
        </td></tr>
      </table>

      <p style="margin-top:28px;font-size:15px;color:#555;">Thank you for choosing The Lightwaves Construction Services.</p>
      <p style="font-size:15px;color:#333;">Best regards,<br/>The Lightwaves Construction Services Team</p>
    </td>
  </tr>
  <tr>
    <td style="background:#fafafa;padding:18px;text-align:center;font-size:12px;color:#777;">
      &copy; ${year} The Lightwaves Construction Services. All rights reserved.
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Vercel Serverless Handler ──
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullName, email, phone, location, service, description } = req.body || {};

  const name = sanitize(fullName);
  const mail = sanitize(email);
  const phoneNum = sanitize(phone);
  const loc = sanitize(location);
  const svc = sanitize(service);
  const desc = sanitize(description);

  if (!name || !mail || !phoneNum) {
    return res.status(400).json({ message: 'Full name, email, and phone are required.' });
  }
  if (!isValidEmail(mail)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const ownerEmail = process.env.OWNER_EMAIL;
  const data = { fullName: name, email: mail, phone: phoneNum, location: loc, service: svc, description: desc };

  try {
    // Admin email — must succeed
    await transport.sendMail({
      from: `"The Lightwaves Construction" <${process.env.SMTP_USER}>`,
      to: ownerEmail,
      replyTo: mail,
      subject: `New Quote Request - ${name}`,
      html: adminEmailHtml(data)
    });

    // Customer confirmation — best effort
    try {
      await transport.sendMail({
        from: `"The Lightwaves Construction" <${process.env.SMTP_USER}>`,
        to: mail,
        replyTo: process.env.SMTP_USER,
        subject: `We've Received Your Quote Request`,
        html: customerEmailHtml(data),
        headers: {
          'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=Unsubscribe>`
        }
      });
    } catch (custErr) {
      console.error('Customer email failed:', custErr);
    }

    return res.status(200).json({ message: 'Quote request submitted successfully.' });
  } catch (err) {
    console.error('Admin email error:', err);
    return res.status(500).json({ message: 'Failed to send email. Please try again or contact us via WhatsApp.' });
  }
}
