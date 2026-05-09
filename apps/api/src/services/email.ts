import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"SwiftByte" <${process.env.SMTP_USER || "noreply@swiftbyte.com"}>`;
const CLIENT = process.env.CLIENT_URL || "http://localhost:3000";

/** Branded HTML wrapper for all emails */
function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#0D0B08;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0B08;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#161410;border-radius:16px;overflow:hidden;border:1px solid rgba(245,166,35,0.2)">
        <!-- Header -->
        <tr style="background:#1F1C18">
          <td style="padding:28px 40px;border-bottom:1px solid rgba(245,166,35,0.15)">
            <span style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#F5ECD7">Swift<span style="color:#F5A623">Byte</span></span>
            <span style="font-size:11px;color:#9E8E78;margin-left:8px;font-family:monospace;letter-spacing:0.15em;text-transform:uppercase">Food Delivery</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px">${body}</td></tr>
        <!-- Footer -->
        <tr style="background:#0D0B08">
          <td style="padding:24px 40px;border-top:1px solid rgba(245,166,35,0.1)">
            <p style="color:#4A4035;font-size:12px;font-family:monospace;letter-spacing:0.1em;margin:0">© ${new Date().getFullYear()} SwiftByte · Made with obsession.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#F5A623;color:#0D0B08;text-decoration:none;font-family:monospace;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:14px 32px;border-radius:100px;margin:24px 0">${label}</a>`;
}

function h1(text: string): string {
  return `<h1 style="font-family:Georgia,serif;font-style:italic;font-size:32px;color:#F5ECD7;margin:0 0 16px">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="color:#9E8E78;font-size:15px;line-height:1.7;margin:0 0 16px">${text}</p>`;
}

/** Send an email safely — never throws, just logs on error */
async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log(`[Email skipped — no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html, text });
  } catch (err) {
    console.error("[Email send error]", err);
  }
}

// ─── Email templates ────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${CLIENT}/auth/verify-email?token=${token}`;
  const html = wrap("Verify your email", `
    ${h1("Verify your email.")}
    ${p(`Hi ${name}, welcome to SwiftByte! Click the button below to verify your email address and start ordering.`)}
    ${btn(url, "Verify Email →")}
    ${p(`Or copy this link: <a href="${url}" style="color:#F5A623">${url}</a>`)}
    ${p(`This link expires in 24 hours.`)}
  `);
  await send(to, "Verify your SwiftByte account", html, `Verify your email: ${url}`);
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${CLIENT}/auth/reset-password?token=${token}`;
  const html = wrap("Reset your password", `
    ${h1("Reset your password.")}
    ${p(`Hi ${name}, we received a request to reset your SwiftByte password.`)}
    ${btn(url, "Reset Password →")}
    ${p(`This link expires in 1 hour. If you didn't request a reset, ignore this email.`)}
  `);
  await send(to, "Reset your SwiftByte password", html, `Reset password: ${url}`);
}

export async function sendRestaurantApplicationReceived(to: string, name: string, restaurantName: string): Promise<void> {
  const html = wrap("Application received", `
    ${h1("Application received.")}
    ${p(`Hi ${name}, we've received your application to list <strong style="color:#F5ECD7">${restaurantName}</strong> on SwiftByte.`)}
    ${p(`Our team will review your application within 24–48 hours. You'll get an email the moment a decision is made.`)}
    ${btn(`${CLIENT}/applications/status`, "View Application Status")}
  `);
  await send(to, `Application received — ${restaurantName}`, html, `Application received for ${restaurantName}`);
}

export async function sendRestaurantApplicationApproved(to: string, name: string, restaurantName: string): Promise<void> {
  const html = wrap("You're approved! 🎉", `
    ${h1(`Congratulations, ${name}!`)}
    ${p(`<strong style="color:#F5A623">${restaurantName}</strong> is now live on SwiftByte. Customers can start placing orders immediately.`)}
    ${p(`Sign in to your restaurant dashboard to set your menu, manage orders, and track your performance.`)}
    ${btn(`${process.env.RESTAURANT_URL || "http://localhost:3001"}/login`, "Open Restaurant Dashboard →")}
  `);
  await send(to, `🎉 ${restaurantName} is now live on SwiftByte!`, html, `Congratulations! ${restaurantName} is approved.`);
}

export async function sendRestaurantApplicationRejected(to: string, name: string, restaurantName: string, reason: string): Promise<void> {
  const html = wrap("Application update", `
    ${h1("Application not approved.")}
    ${p(`Hi ${name}, unfortunately we're unable to approve the application for <strong style="color:#F5ECD7">${restaurantName}</strong> at this time.`)}
    <div style="background:#1F1C18;border-left:3px solid #E8372A;padding:16px 20px;border-radius:8px;margin:16px 0">
      <p style="color:#F5ECD7;font-size:14px;margin:0"><strong>Reason:</strong> ${reason}</p>
    </div>
    ${p(`You may reapply after 30 days. If you believe this is a mistake, contact our support team.`)}
    ${btn(`${CLIENT}/support`, "Contact Support")}
  `);
  await send(to, `Application update — ${restaurantName}`, html, `Application rejected: ${reason}`);
}

export async function sendRestaurantApplicationMoreInfo(to: string, name: string, restaurantName: string, questions: string): Promise<void> {
  const html = wrap("More information needed", `
    ${h1("We need a bit more info.")}
    ${p(`Hi ${name}, we're reviewing your application for <strong style="color:#F5ECD7">${restaurantName}</strong> and need some additional information.`)}
    <div style="background:#1F1C18;border-left:3px solid #F5A623;padding:16px 20px;border-radius:8px;margin:16px 0">
      <p style="color:#F5ECD7;font-size:14px;margin:0">${questions}</p>
    </div>
    ${btn(`${CLIENT}/applications/status`, "Update Application")}
  `);
  await send(to, `More info needed — ${restaurantName}`, html, `More info needed: ${questions}`);
}

export async function sendRiderApplicationReceived(to: string, name: string): Promise<void> {
  const html = wrap("Rider application received", `
    ${h1("Application received.")}
    ${p(`Hi ${name}, we've received your application to become a SwiftByte delivery rider.`)}
    ${p(`Our team will review your documents within 24–48 hours.`)}
    ${btn(`${CLIENT}/applications/status`, "View Application Status")}
  `);
  await send(to, "Rider application received — SwiftByte", html, "Rider application received");
}

export async function sendRiderApplicationApproved(to: string, name: string): Promise<void> {
  const html = wrap("Welcome to the fleet! 🛵", `
    ${h1(`Welcome aboard, ${name}!`)}
    ${p(`Your rider application has been approved. You can now start accepting deliveries and earning with SwiftByte.`)}
    ${p(`Sign in to the Rider app to go online and start earning.`)}
    ${btn(`${process.env.RIDER_URL || "http://localhost:3002"}/login`, "Open Rider App →")}
  `);
  await send(to, "🛵 You're approved as a SwiftByte rider!", html, "Rider application approved");
}

export async function sendRiderApplicationRejected(to: string, name: string, reason: string): Promise<void> {
  const html = wrap("Application update", `
    ${h1("Application not approved.")}
    ${p(`Hi ${name}, unfortunately we're unable to approve your rider application at this time.`)}
    <div style="background:#1F1C18;border-left:3px solid #E8372A;padding:16px 20px;border-radius:8px;margin:16px 0">
      <p style="color:#F5ECD7;font-size:14px;margin:0"><strong>Reason:</strong> ${reason}</p>
    </div>
    ${p(`You may reapply after 30 days.`)}
  `);
  await send(to, "Rider application update — SwiftByte", html, `Rider application rejected: ${reason}`);
}
