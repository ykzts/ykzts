import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock environment variables
vi.stubEnv("RESEND_API_KEY", "test_api_key");
vi.stubEnv("NEXT_PUBLIC_SITE_NAME", "example.com");
vi.stubEnv("MAIL_FROM_ADDRESS", "no-reply@example.com");

// Mock getProfile from Supabase
vi.mock("@ykzts/supabase/queries", () => ({
  getProfile: vi.fn(async () => ({
    about: [],
    email: "admin@example.com",
    id: "test-id",
    name: "Test User",
    profile_technologies: [],
    social_links: [],
    tagline: "Test",
  })),
}));

// Mock Resend
const mockSend = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(
    class {
      emails = {
        send: mockSend,
      };
    }
  ),
}));

describe("Contact form action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("submitContactForm", () => {
    it("should return field errors for invalid data", async () => {
      const { submitContactForm } = await import("../contact");

      const formData = new FormData();
      formData.set("email", "invalid-email");
      formData.set("message", "short");
      formData.set("name", "");
      formData.set("subject", "");
      // privacyConsent is missing (unchecked)

      const result = await submitContactForm(null, formData);

      expect(result.success).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors?.name).toBeDefined();
      expect(result.fieldErrors?.email).toBeDefined();
      expect(result.fieldErrors?.subject).toBeDefined();
      expect(result.fieldErrors?.message).toBeDefined();
    });

    it("should validate privacy consent is true", async () => {
      const { submitContactForm } = await import("../contact");

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("message", "This is a test message that is long enough");
      formData.set("name", "Test User");
      formData.set("subject", "Test Subject");
      // privacyConsent is missing (unchecked checkbox)

      const result = await submitContactForm(null, formData);

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.privacyConsent).toBeDefined();
    });

    it("should accept valid data with privacy consent", async () => {
      // Mock successful email send
      mockSend.mockResolvedValue({
        error: null,
        id: "test-email-id",
      });

      const { submitContactForm } = await import("../contact");

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("message", "This is a test message that is long enough");
      formData.set("name", "Test User");
      formData.set("privacyConsent", "on");
      formData.set("subject", "Test Subject");

      const result = await submitContactForm(null, formData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSend).toHaveBeenCalled();
    });

    it('should format sender name with "via example.com" suffix', async () => {
      // Mock successful email send
      mockSend.mockResolvedValue({
        error: null,
        id: "test-email-id",
      });

      const { submitContactForm } = await import("../contact");

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("message", "This is a test message that is long enough");
      formData.set("name", "Test User");
      formData.set("privacyConsent", "on");
      formData.set("subject", "Test Subject");

      await submitContactForm(null, formData);

      // Verify mockSend was called with the correct format
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Test User via example.com <no-reply@example.com>",
        })
      );
    });

    it("should handle Resend email sending errors", async () => {
      // Mock email send error
      mockSend.mockResolvedValue({
        error: {
          message: "Failed to send email",
          name: "EmailError",
        },
      });

      const { submitContactForm } = await import("../contact");

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("message", "This is a test message that is long enough");
      formData.set("name", "Test User");
      formData.set("privacyConsent", "on");
      formData.set("subject", "Test Subject");

      const result = await submitContactForm(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("メールの送信に失敗");
    });
  });
});
