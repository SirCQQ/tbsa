import { type ContactFormData } from "@/lib/validations/contact";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import {
  ContactAdminNotificationEmail,
  ContactUserConfirmationEmail,
} from "@/components/emails";

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
  id?: string;
}

export interface ContactServiceConfig {
  adminEmail: string;
  fromEmail: string;
  replyToEmail?: string;
  enableUserConfirmation: boolean;
  enableAdminNotification: boolean;
}

export class ContactService {
  private config: ContactServiceConfig;

  constructor(config?: Partial<ContactServiceConfig>) {
    this.config = {
      adminEmail: process.env.CONTACT_ADMIN_EMAIL || "gatucristian@gmail.com",
      fromEmail: process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev",
      replyToEmail: process.env.CONTACT_REPLY_TO_EMAIL,
      enableUserConfirmation: true,
      enableAdminNotification: true,
      ...config,
    };
  }

  /**
   * Process contact form submission
   */
  async submitContactForm(
    data: ContactFormData,
    metadata?: {
      userAgent?: string;
      timestamp?: string;
    }
  ): Promise<ContactSubmissionResult> {
    try {
      // Generate unique submission ID
      const submissionId = this.generateSubmissionId();

      // Log submission for debugging
      this.logSubmission(data, submissionId, metadata);

      // Send emails in parallel
      const emailPromises: Promise<void>[] = [];

      if (this.config.enableAdminNotification) {
        emailPromises.push(this.sendAdminNotification(data, submissionId));
      }

      if (this.config.enableUserConfirmation) {
        emailPromises.push(this.sendUserConfirmation(data, submissionId));
      }

      // Wait for all emails to be sent
      await Promise.all(emailPromises);

      // TODO: Store in database if needed
      // await this.storeSubmission(data, submissionId, metadata);

      return {
        success: true,
        message: "Mesajul a fost trimis cu succes. Vă vom contacta în curând!",
        id: submissionId,
      };
    } catch (error) {
      console.error("Contact service error:", error);

      return {
        success: false,
        message:
          "A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou.",
      };
    }
  }

  /**
   * Send notification email to admin
   */
  private async sendAdminNotification(
    data: ContactFormData,
    submissionId: string
  ): Promise<void> {
    const subject = `[TBSA Contact] ${data.subject}`;
    const htmlContent = await render(
      ContactAdminNotificationEmail({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        submissionId,
        submissionDate: new Date().toLocaleString("ro-RO"),
      })
    );

    await sendEmail(this.config.adminEmail, subject, htmlContent, {
      from: this.config.fromEmail,
      replyTo: data.email,
    });
  }

  /**
   * Send confirmation email to user
   */
  private async sendUserConfirmation(
    data: ContactFormData,
    submissionId: string
  ): Promise<void> {
    const subject = "Confirmarea mesajului tău - TBSA";
    const htmlContent = await render(
      ContactUserConfirmationEmail({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        submissionId,
        submissionDate: new Date().toLocaleString("ro-RO"),
        adminEmail: this.config.adminEmail,
      })
    );

    await sendEmail(data.email, subject, htmlContent, {
      from: this.config.fromEmail,
      replyTo: this.config.replyToEmail || this.config.adminEmail,
    });
  }

  /**
   * Generate unique submission ID
   */
  private generateSubmissionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `contact_${timestamp}_${random}`;
  }

  /**
   * Log submission for debugging and monitoring
   */
  private logSubmission(
    data: ContactFormData,
    submissionId: string,
    metadata?: { userAgent?: string; timestamp?: string }
  ): void {
    console.log("Contact form submission:", {
      submissionId,
      timestamp: metadata?.timestamp || new Date().toISOString(),
      userAgent: metadata?.userAgent,
      contact: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        messageLength: data.message.length,
      },
    });
  }

  /**
   * Store submission in database (placeholder for future implementation)
   */
  // private async storeSubmission(
  //   data: ContactFormData,
  //   submissionId: string,
  //   metadata?: { userAgent?: string; timestamp?: string }
  // ): Promise<void> {
  //   // TODO: Implement database storage
  //   // await prisma.contactSubmission.create({
  //   //   data: {
  //   //     id: submissionId,
  //   //     firstName: data.firstName,
  //   //     lastName: data.lastName,
  //   //     email: data.email,
  //   //     phone: data.phone,
  //   //     subject: data.subject,
  //   //     message: data.message,
  //   //     userAgent: metadata?.userAgent,
  //   //     status: 'new',
  //   //   }
  //   // });
  // }
}

// Export singleton instance
export const contactService = new ContactService();
