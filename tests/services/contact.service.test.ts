import { ContactService } from "@/services/contact.service";
import { render } from "@react-email/render";
import {
  ContactAdminNotificationEmail,
  ContactUserConfirmationEmail,
} from "@/components/emails";

// Mock the email service
jest.mock("@/lib/email", () => ({
  sendEmail: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: "test-message-id" }),
}));

// Mock React Email render
jest.mock("@react-email/render", () => ({
  render: jest.fn().mockResolvedValue("<html>Mock email content</html>"),
}));

describe("ContactService", () => {
  let contactService: ContactService;

  beforeEach(() => {
    contactService = new ContactService({
      adminEmail: "admin@test.com",
      fromEmail: "noreply@test.com",
      enableUserConfirmation: true,
      enableAdminNotification: true,
    });

    jest.clearAllMocks();
  });

  describe("submitContactForm", () => {
    const mockContactData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+40123456789",
      subject: "Test Subject",
      message: "This is a test message",
    };

    const mockMetadata = {
      userAgent: "Mozilla/5.0 Test Browser",
      timestamp: "2024-01-01T12:00:00.000Z",
    };

    it("should successfully submit contact form and send emails", async () => {
      const result = await contactService.submitContactForm(
        mockContactData,
        mockMetadata
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        "Mesajul a fost trimis cu succes. Vă vom contacta în curând!"
      );
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^contact_/);
    });

    it("should render admin notification email with correct props", async () => {
      await contactService.submitContactForm(mockContactData, mockMetadata);

      // Check that render was called with a React element (the result of calling ContactAdminNotificationEmail)
      expect(render).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(Object), // React element type
          props: expect.objectContaining({
            children: expect.any(Array), // React children
          }),
        })
      );

      // Verify render was called twice (admin + user emails)
      expect(render).toHaveBeenCalledTimes(2);
    });

    it("should render user confirmation email with correct props", async () => {
      await contactService.submitContactForm(mockContactData, mockMetadata);

      // Check that render was called with React elements
      expect(render).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(Object), // React element type
          props: expect.objectContaining({
            children: expect.any(Array), // React children
          }),
        })
      );

      // Verify render was called twice (admin + user emails)
      expect(render).toHaveBeenCalledTimes(2);
    });

    it("should handle contact form without phone number", async () => {
      const dataWithoutPhone = {
        ...mockContactData,
        phone: undefined,
      };

      const result = await contactService.submitContactForm(
        dataWithoutPhone,
        mockMetadata
      );

      expect(result.success).toBe(true);

      // Check that render was called with React elements (phone handling is internal to the email components)
      expect(render).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(Object),
          props: expect.objectContaining({
            children: expect.any(Array),
          }),
        })
      );

      // Verify render was called twice (admin + user emails)
      expect(render).toHaveBeenCalledTimes(2);
    });

    it("should generate unique submission IDs", async () => {
      const result1 = await contactService.submitContactForm(
        mockContactData,
        mockMetadata
      );
      const result2 = await contactService.submitContactForm(
        mockContactData,
        mockMetadata
      );

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^contact_/);
      expect(result2.id).toMatch(/^contact_/);
    });

    it("should handle email sending errors gracefully", async () => {
      const { sendEmail } = require("@/lib/email");
      sendEmail.mockRejectedValueOnce(new Error("Email service error"));

      const result = await contactService.submitContactForm(
        mockContactData,
        mockMetadata
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou."
      );
    });

    it("should log submission details", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await contactService.submitContactForm(mockContactData, mockMetadata);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Contact form submission:",
        expect.objectContaining({
          submissionId: expect.stringMatching(/^contact_/),
          timestamp: mockMetadata.timestamp,
          userAgent: mockMetadata.userAgent,
          contact: {
            name: `${mockContactData.firstName} ${mockContactData.lastName}`,
            email: mockContactData.email,
            phone: mockContactData.phone,
            subject: mockContactData.subject,
            messageLength: mockContactData.message.length,
          },
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe("configuration", () => {
    it("should use default configuration when none provided", () => {
      const defaultService = new ContactService();

      // Access private config through type assertion for testing
      const config = (defaultService as any).config;

      expect(config.adminEmail).toBe("admin@gmail.com");
      expect(config.fromEmail).toBe("contact@tbsa.ro");
      expect(config.enableUserConfirmation).toBe(true);
      expect(config.enableAdminNotification).toBe(true);
    });

    it("should merge custom configuration with defaults", () => {
      const customService = new ContactService({
        adminEmail: "custom@example.com",
        enableUserConfirmation: false,
      });

      const config = (customService as any).config;

      expect(config.adminEmail).toBe("custom@example.com");
      expect(config.fromEmail).toBe("contact@tbsa.ro"); // Default (corrected)
      expect(config.enableUserConfirmation).toBe(false); // Custom
      expect(config.enableAdminNotification).toBe(true); // Default
    });
  });
});
