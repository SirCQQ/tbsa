// Use dynamic import for Resend to ensure it's loaded only on the server
import { Resend } from "resend";
import { prisma } from "./prisma";
import { z } from "zod";

// Email template types
export type EmailTemplate =
  | "welcome"
  | "reset-password"
  | "verify-email"
  | "reading-reminder"
  | "reading-approved"
  | "reading-rejected"
  | "bill-generated"
  | "bill-reminder"
  | "payment-confirmation"
  | "account-update"
  | "organization-invite";

// Email service configuration
export type EmailConfig = {
  from: string;
  replyTo?: string;
  bcc?: string[];
  cc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  trackOpens?: boolean;
  trackClicks?: boolean;
};

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Default email configuration
const defaultConfig: EmailConfig = {
  from: process.env.EMAIL_FROM || "onboarding@resend.dev",
  trackOpens: true,
  trackClicks: true,
};

// Validation schema for email options
const emailOptionsSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  html: z.string().min(1),
  config: z
    .object({
      from: z.string().email().optional(),
      replyTo: z.string().email().optional(),
      bcc: z.array(z.string().email()).optional(),
      cc: z.array(z.string().email()).optional(),
      trackOpens: z.boolean().optional(),
      trackClicks: z.boolean().optional(),
      attachments: z
        .array(
          z.object({
            filename: z.string(),
            content: z.union([z.instanceof(Buffer), z.string()]),
            contentType: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
});

/**
 * Send an email with comprehensive options and error handling
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  customConfig?: Partial<EmailConfig>
) {
  // Validate email options
  try {
    emailOptionsSchema.parse({ to, subject, html, config: customConfig });
  } catch (error) {
    console.error("Email validation failed:", error);
    return {
      success: false,
      error: "Invalid email parameters",
    };
  }

  // Check if email sending is enabled
  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key missing. Email sending is disabled.");
    return {
      success: false,
      error: "Email sending is disabled",
    };
  }

  // Merge default config with custom config
  const config = { ...defaultConfig, ...customConfig };

  try {
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: config.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: config.replyTo,
      bcc: config.bcc,
      cc: config.cc,
      attachments: config.attachments,
      headers: {
        "X-Entity-Ref-ID": `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      },
      tags: [
        {
          name: "category",
          value: "transactional",
        },
      ],
    });

    if (error) {
      console.error("Failed to send email:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Log email sending (optional - can be enabled in production or always in development)
    if (
      process.env.LOG_EMAILS === "true" ||
      process.env.NODE_ENV !== "production"
    ) {
      await logEmailSent(
        Array.isArray(to) ? to[0] : to,
        subject,
        config.from,
        data?.id
      );
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Log email sending to database for tracking
 */
async function logEmailSent(
  to: string,
  subject: string,
  from: string,
  messageId?: string,
  _template?: string // Unused until prisma generate is run
) {
  try {
    // Log to database
    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        sender: from,
        messageId: messageId ?? null,
        template: _template ?? null,
        status: "sent",
        sentAt: new Date(),
        metadata: { timestamp: Date.now() },
      },
    });

    // Also log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `Email log: ${from} -> ${to}: ${subject} ${messageId ? `(ID: ${messageId})` : ""}`
      );
    }
  } catch (error) {
    console.error("Failed to log email:", error);
  }
}

/**
 * Welcome email with verification link
 */
export async function sendWelcomeEmail(
  to: string,
  firstName: string,
  verificationToken: string,
  customConfig?: Partial<EmailConfig>
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

  const subject = "Welcome to Property Association Manager - Verify Your Email";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Property Association Manager!</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for creating an account with us. To complete your registration, please verify your email address by clicking the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
      </p>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Thank you,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

/**
 * Password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  customConfig?: Partial<EmailConfig>
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/confirm?token=${resetToken}`;

  const subject = "Reset Your Password - Property Association Manager";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. To proceed with the password reset, please click the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </p>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Thank you,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

/**
 * Reading reminder email
 */
export async function sendReadingReminderEmail(
  to: string,
  firstName: string,
  dueDate: Date,
  apartmentNumber: string,
  buildingName: string,
  customConfig?: Partial<EmailConfig>
) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dueDate);

  const subject = "Water Reading Reminder - Action Required";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Water Reading Reminder</h2>
      <p>Hello ${firstName},</p>
      <p>This is a friendly reminder to submit your water meter reading for Apartment ${apartmentNumber} in ${buildingName} by <strong>${formattedDate}</strong>.</p>
      <p>Submitting your reading on time helps ensure accurate billing and prevents estimated charges.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/readings/submit" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Submit Reading Now</a>
      </p>
      <p>Thank you for your cooperation.</p>
      <p>Best regards,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

/**
 * Reading approved email
 */
export async function sendReadingApprovedEmail(
  to: string,
  firstName: string,
  readingDate: Date,
  meterNumber: string,
  readingValue: number,
  customConfig?: Partial<EmailConfig>
) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(readingDate);

  const subject = "Water Reading Approved";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Water Reading Approved</h2>
      <p>Hello ${firstName},</p>
      <p>Your water meter reading has been approved. Here are the details:</p>
      <ul>
        <li><strong>Meter Number:</strong> ${meterNumber}</li>
        <li><strong>Reading Date:</strong> ${formattedDate}</li>
        <li><strong>Reading Value:</strong> ${readingValue} m³</li>
      </ul>
      <p>Your water bill will be generated based on this reading.</p>
      <p>Thank you for submitting your reading on time.</p>
      <p>Best regards,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

/**
 * Reading rejected email
 */
export async function sendReadingRejectedEmail(
  to: string,
  firstName: string,
  readingDate: Date,
  meterNumber: string,
  rejectionReason: string,
  customConfig?: Partial<EmailConfig>
) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(readingDate);

  const subject = "Water Reading Rejected - Action Required";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Water Reading Rejected</h2>
      <p>Hello ${firstName},</p>
      <p>Your recent water meter reading has been rejected. Here are the details:</p>
      <ul>
        <li><strong>Meter Number:</strong> ${meterNumber}</li>
        <li><strong>Reading Date:</strong> ${formattedDate}</li>
        <li><strong>Reason for rejection:</strong> ${rejectionReason}</li>
      </ul>
      <p>Please submit a new reading as soon as possible by clicking the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/readings/submit" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Submit New Reading</a>
      </p>
      <p>If you have any questions, please contact your building administrator.</p>
      <p>Best regards,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

/**
 * Bill generated email
 */
export async function sendBillGeneratedEmail(
  to: string,
  firstName: string,
  billAmount: number,
  dueDate: Date,
  apartmentNumber: string,
  buildingName: string,
  billId: string,
  consumption: number,
  customConfig?: Partial<EmailConfig>
) {
  const formattedDueDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dueDate);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(billAmount));

  const subject = `Water Bill Generated for ${buildingName}, Apt ${apartmentNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Water Bill is Ready</h2>
      <p>Hello ${firstName},</p>
      <p>Your water bill for Apartment ${apartmentNumber} in ${buildingName} has been generated. Here are the details:</p>
      <div style="background-color: #f4f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4F46E5;">Bill Summary</h3>
        <p><strong>Total Amount:</strong> ${formattedAmount}</p>
        <p><strong>Consumption:</strong> ${consumption} m³</p>
        <p><strong>Due Date:</strong> ${formattedDueDate}</p>
        <p><strong>Bill Reference:</strong> ${billId}</p>
      </div>
      <p>Please make your payment before the due date to avoid any late fees.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/bills/${billId}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Bill Details</a>
      </p>
      <p>Thank you for your prompt attention to this matter.</p>
      <p>Best regards,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

/**
 * Payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  firstName: string,
  billAmount: number,
  paymentDate: Date,
  apartmentNumber: string,
  buildingName: string,
  billId: string,
  paymentMethod: string,
  transactionId: string,
  customConfig?: Partial<EmailConfig>
) {
  const formattedPaymentDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(paymentDate);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(billAmount));

  const subject = "Payment Confirmation - Water Bill";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Confirmation</h2>
      <p>Hello ${firstName},</p>
      <p>We have received your payment for the water bill for Apartment ${apartmentNumber} in ${buildingName}. Thank you!</p>
      <div style="background-color: #f4f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4F46E5;">Payment Details</h3>
        <p><strong>Amount Paid:</strong> ${formattedAmount}</p>
        <p><strong>Payment Date:</strong> ${formattedPaymentDate}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p><strong>Bill Reference:</strong> ${billId}</p>
      </div>
      <p>This payment has been applied to your account and your bill is now marked as paid.</p>
      <p>If you have any questions about your payment, please contact your building administrator.</p>
      <p>Best regards,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

/**
 * Organization invite email
 */
export async function sendOrganizationInviteEmail(
  to: string,
  organizationName: string,
  inviterName: string,
  inviteUrl: string,
  roleName: string,
  expiresAt: Date,
  customConfig?: Partial<EmailConfig>
) {
  const formattedExpiryDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(expiresAt);

  const subject = `Invitation to join ${organizationName} on Property Association Manager`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You've Been Invited!</h2>
      <p>Hello,</p>
      <p>${inviterName} has invited you to join <strong>${organizationName}</strong> on Property Association Manager as a <strong>${roleName}</strong>.</p>
      <p>To accept this invitation, please click the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accept Invitation</a>
      </p>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #4F46E5;">${inviteUrl}</p>
      <p>This invitation will expire on ${formattedExpiryDate}.</p>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
      <p>Thank you,<br>The Property Association Manager Team</p>
    </div>
  `;

  return sendEmail(to, subject, html, customConfig);
}

// Comprehensive email service API
export const emailService = {
  // Core functions
  sendEmail,

  // Authentication emails
  sendWelcomeEmail,
  sendPasswordResetEmail,

  // Water reading emails
  sendReadingReminderEmail,
  sendReadingApprovedEmail,
  sendReadingRejectedEmail,

  // Billing emails
  sendBillGeneratedEmail,
  sendPaymentConfirmationEmail,

  // Organization emails
  sendOrganizationInviteEmail,

  // Utility to check if email sending is enabled
  isEnabled: () => !!process.env.RESEND_API_KEY,
};
