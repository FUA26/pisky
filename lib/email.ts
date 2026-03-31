interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Mock email service for development
 * In production, replace with actual email service like Resend, SendGrid, etc.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  console.log("\n=== MOCK EMAIL SERVICE ===");
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.html}`);
  console.log("==========================\n");

  return { success: true };
}

/**
 * Email template types
 */
export type EmailTemplate =
  | "email-verification"
  | "password-reset"
  | "welcome"
  | "password-reset-confirm";

interface TemplateData {
  userName?: string;
  verifyUrl?: string;
  resetUrl?: string;
  loginUrl?: string;
  expiryHours?: number;
  title?: string;
  message?: string;
  actionText?: string;
  actionUrl?: string;
}

/**
 * Send email using template
 */
export async function sendTemplate(
  template: EmailTemplate,
  options: Omit<SendEmailOptions, "html"> & { data: TemplateData }
): Promise<EmailResult> {
  const html = generateTemplateHtml(template, options.data);
  return sendEmail({
    to: options.to,
    subject: options.subject,
    html,
  });
}

function generateTemplateHtml(template: EmailTemplate, data: TemplateData): string {
  const userName = data.userName || "User";

  switch (template) {
    case "email-verification":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Verify Your Email Address</h2>
  <p>Hi ${userName},</p>
  <p>Please click the link below to verify your email address:</p>
  <p><a href="${data.verifyUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
  <p>This link will expire in ${data.expiryHours || 24} hours.</p>
</body>
</html>
      `.trim();

    case "password-reset":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Reset Your Password</h2>
  <p>Hi ${userName},</p>
  <p>Click the link below to reset your password:</p>
  <p><a href="${data.resetUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
  <p>This link will expire in ${data.expiryHours || 1} hour.</p>
  <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
      `.trim();

    case "password-reset-confirm":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Successfully Reset</h2>
  <p>Hi ${userName},</p>
  <p>Your password has been successfully reset.</p>
  <p><a href="${data.loginUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Log In</a></p>
</body>
</html>
      `.trim();

    case "welcome":
      return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to Pisky!</h2>
  <p>Hi ${userName},</p>
  <p>Welcome to Pisky! Your account has been created successfully.</p>
  <p><a href="${data.loginUrl}" style="background: #1B53D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Log In</a></p>
</body>
</html>
      `.trim();

    default:
      return "";
  }
}
