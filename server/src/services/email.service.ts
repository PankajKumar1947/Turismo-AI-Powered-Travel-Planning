import nodemailer from "nodemailer";
import { config } from "../config/env";

export class EmailService {
  private static getTransporter() {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      return null;
    }
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  /**
   * Sends an OTP verification email to the user
   */
  static async sendOtpEmail(toEmail: string, name: string, otp: string): Promise<boolean> {
    const transporter = this.getTransporter();

    const mailOptions = {
      from: config.smtpFrom,
      to: toEmail,
      subject: "Verify your email address - Turismo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #18181b; text-align: center;">Welcome to Turismo!</h2>
          <p style="color: #27272a; font-size: 16px;">Hello ${name},</p>
          <p style="color: #52525b; font-size: 14px; line-height: 1.5;">
            Thank you for signing up for Turismo, your AI-powered travel planner. To complete your registration and verify your email, please use the following One-Time Password (OTP):
          </p>
          <div style="margin: 30px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #15803d; background-color: #f0fdf4; padding: 12px 24px; border-radius: 8px; border: 1px solid #bbf7d0;">
              ${otp}
            </span>
          </div>
          <p style="color: #52525b; font-size: 12px; line-height: 1.5; text-align: center; margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px;">
            This OTP is valid for 15 minutes. If you did not request this verification, please ignore this email.
          </p>
        </div>
      `,
    };

    if (!transporter) {
      console.log("\n==================================================");
      console.log(`[DEVELOPMENT EMAIL FALLBACK]`);
      console.log(`To: ${toEmail} (${name})`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`OTP Code: ${otp}`);
      console.log("==================================================\n");
      return true;
    }

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending verification email via Nodemailer:", error);
      return false;
    }
  }
}
