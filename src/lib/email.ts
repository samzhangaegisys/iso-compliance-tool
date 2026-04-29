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

const FROM = process.env.SMTP_FROM ?? "ISOComply <noreply@isocomply.io>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://isocomply.io";

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ISOComply</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#0a0f1e;border-radius:12px 12px 0 0;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">ISO</span><span style="font-size:20px;font-weight:700;color:#60a5fa;letter-spacing:-0.3px;">Comply</span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#475569;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;">Compliance Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;">
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.6;">
                This email was sent by ISOComply. If you have questions, contact us at
                <a href="mailto:support@isocomply.io" style="color:#60a5fa;text-decoration:none;">support@isocomply.io</a>
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">
                © ${new Date().getFullYear()} ISOComply &nbsp;·&nbsp; SOC 2 Type II &nbsp;·&nbsp; 256-bit Encryption
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background:#2563eb;border-radius:10px;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />`;
}

function fallbackLink(url: string): string {
  return `<p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
    Button not working? Copy and paste this link into your browser:<br/>
    <a href="${url}" style="color:#2563eb;word-break:break-all;text-decoration:none;">${url}</a>
  </p>`;
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = layout(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#eff6ff;border-radius:14px;padding:16px 20px;margin-bottom:20px;">
        <span style="font-size:32px;">🔐</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Reset your password</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
        We received a request to reset the password on your ISOComply account.
      </p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;">
        Click the button below to choose a new password. This link is valid for <strong style="color:#0f172a;">1 hour</strong> and can only be used once.
      </p>
    </div>

    <div style="text-align:center;">
      ${primaryButton("Reset my password", resetUrl)}
    </div>

    ${divider()}

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#92400e;line-height:1.6;">
        <strong>Didn't request this?</strong> Your password hasn't changed. You can safely ignore this email. If you're concerned about your account security, please contact us immediately.
      </p>
    </div>

    ${fallbackLink(resetUrl)}
  `);

  const text = `Reset your ISOComply password\n\nWe received a request to reset the password on your account.\n\nClick the link below to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, your password hasn't changed.`;

  await transporter.sendMail({ from: FROM, to, subject: "Reset your ISOComply password", html, text });
}

// ─── Email verification OTP ───────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, otp: string, name: string) {
  const html = layout(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#f0fdf4;border-radius:14px;padding:16px 20px;margin-bottom:20px;">
        <span style="font-size:32px;">✉️</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Verify your email</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
        Hi ${name}, welcome to ISOComply! Enter the code below to verify your email address.
      </p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#0a0f1e;border-radius:12px;padding:20px 36px;">
        <span style="font-size:36px;font-weight:700;color:#60a5fa;letter-spacing:10px;">${otp}</span>
      </div>
      <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">This code expires in <strong style="color:#64748b;">1 hour</strong></p>
    </div>

    ${divider()}

    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
      If you didn't create an ISOComply account, you can safely ignore this email.
    </p>
  `);

  const text = `Verify your ISOComply account\n\nHi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 1 hour.`;

  await transporter.sendMail({ from: FROM, to, subject: "Your ISOComply verification code", html, text });
}

// ─── Welcome / onboarding ─────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const dashboardUrl = `${BASE_URL}/dashboard`;

  const html = layout(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#eff6ff;border-radius:14px;padding:16px 20px;margin-bottom:20px;">
        <span style="font-size:32px;">🛡️</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Welcome to ISOComply, ${name.split(" ")[0]}!</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
        Your account is ready. Let's get your organisation on the path to ISO certification.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ["📋", "Set up your workspace", "Create your organisation and invite your team members."],
        ["🔍", "Run a gap analysis", "See exactly where you stand against ISO 27001 or SOC 2 requirements."],
        ["✅", "Track your progress", "Assign tasks, upload evidence, and monitor compliance in real time."],
      ].map(([icon, title, desc]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;width:40px;">
          <span style="font-size:20px;">${icon}</span>
        </td>
        <td style="padding:12px 0 12px 14px;border-bottom:1px solid #f1f5f9;">
          <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#0f172a;">${title}</p>
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">${desc}</p>
        </td>
      </tr>`).join("")}
    </table>

    <div style="text-align:center;">
      ${primaryButton("Go to my dashboard →", dashboardUrl)}
    </div>

    ${divider()}

    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
      Need help getting started? Reply to this email or visit our
      <a href="${BASE_URL}/docs" style="color:#2563eb;text-decoration:none;">documentation</a>.
    </p>
  `);

  const text = `Welcome to ISOComply, ${name.split(" ")[0]}!\n\nYour account is ready. Get started at:\n${dashboardUrl}`;

  await transporter.sendMail({ from: FROM, to, subject: `Welcome to ISOComply, ${name.split(" ")[0]}!`, html, text });
}

// ─── Team invitation ──────────────────────────────────────────────────────────

export async function sendTeamInviteEmail(
  to: string,
  inviterName: string,
  orgName: string,
  role: string,
  registerUrl: string,
) {
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

  const html = layout(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#faf5ff;border-radius:14px;padding:16px 20px;margin-bottom:20px;">
        <span style="font-size:32px;">👥</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">You've been invited</h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
        <strong style="color:#0f172a;">${inviterName}</strong> has invited you to join
        <strong style="color:#0f172a;">${orgName}</strong> on ISOComply.
      </p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:6px;">Organisation</td>
          <td style="font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:6px;">Your role</td>
        </tr>
        <tr>
          <td style="font-size:14px;font-weight:600;color:#0f172a;">${orgName}</td>
          <td>
            <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;">${roleLabel}</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;">
      ${primaryButton("Accept invitation →", registerUrl)}
    </div>

    ${divider()}

    <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.6;">
      This invitation will expire in <strong style="color:#64748b;">7 days</strong>. If you don't have an ISOComply account yet, you'll be asked to create one.
    </p>
    ${fallbackLink(registerUrl)}
  `);

  const text = `You've been invited to join ${orgName} on ISOComply\n\n${inviterName} has invited you as ${roleLabel}.\n\nAccept the invitation:\n${registerUrl}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `${inviterName} invited you to ${orgName} on ISOComply`,
    html,
    text,
  });
}
