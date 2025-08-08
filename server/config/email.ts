export const emailConfig = {
  supportEmail: process.env.SUPPORT_EMAIL || "jasapa7424@cotasen.com",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
};

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Simple email sending function - would use nodemailer in production
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // For development, just log the email
    console.log(`📧 Email would be sent to: ${options.to}`);
    console.log(`📧 Subject: ${options.subject}`);
    console.log(`📧 Message: ${options.text}`);
    
    // In production, implement actual email sending with nodemailer
    // const transporter = nodemailer.createTransporter({...});
    // await transporter.sendMail(options);
    
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
