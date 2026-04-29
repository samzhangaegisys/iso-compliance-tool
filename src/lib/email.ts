import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.SMTP_FROM ?? "noreply@isocomply.io";
  await transporter.sendMail({
    from,
    to,
    subject: "Reset your ISOComply password",
    text: `You requested a password reset. Use the link below — it expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#1e293b">ISOComply</span>
        </div>
        <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px">Reset your password</h1>
        <p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.6">
          We received a request to reset the password for your account. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;margin-bottom:24px">
          Reset password
        </a>
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6">
          If you didn't request a password reset, you can safely ignore this email — your password won't change.<br><br>
          Or copy this URL into your browser:<br>
          <a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}
