import { getSiteName } from "@ykzts/site-config";
import { Resend } from "resend";
import type { ContactFormData } from "@/app/_actions/contact";

export interface SendContactEmailInput {
  contactEmail: string;
  data: ContactFormData;
}

export interface SendContactEmailResult {
  error?: string;
  success: boolean;
}

/**
 * Step that performs the actual email send via Resend.
 * This is the durable unit: it gets automatic retries, persistence,
 * and appears as its own entry in the workflow dashboard.
 */
async function sendEmailWithResendStep(input: SendContactEmailInput) {
  "use step";

  const resend = new Resend(process.env.RESEND_API_KEY as string);
  const siteName = getSiteName();
  const fromAddress = process.env.MAIL_FROM_ADDRESS ?? "no-reply@example.com";

  const emailResult = await resend.emails.send({
    from: `${input.data.name} via ${siteName} <${fromAddress}>`,
    replyTo: `${input.data.name} <${input.data.email}>`,
    subject: `[お問い合わせ] ${input.data.subject}`,
    text: input.data.message,
    to: [input.contactEmail],
  });

  if (emailResult.error) {
    console.error("Resend error:", emailResult.error);
    // Throw so the step (and thus the workflow) can be retried by the platform
    // for transient issues. Use FatalError from 'workflow' for permanent failures.
    throw new Error(
      emailResult.error.message || "Failed to send email via Resend"
    );
  }

  return emailResult;
}

/**
 * Durable workflow for sending contact form emails via Resend.
 *
 * Invoked from the contact server action after validation and bot checks.
 * The actual send is performed in a "use step" so it gets:
 * - Automatic retries for transient failures (network, rate limits, etc.)
 * - Full observability in the Vercel Workflows dashboard
 * - Durability across deploys, timeouts, etc.
 *
 * The workflow itself orchestrates (validation of config + calling the step).
 */
export async function sendContactEmail(
  input: SendContactEmailInput
): Promise<SendContactEmailResult> {
  "use workflow";

  const { contactEmail, data } = input;

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured.");
    return {
      error:
        "メール送信の設定が正しくありません。管理者にお問い合わせください。",
      success: false,
    };
  }

  try {
    await sendEmailWithResendStep({ contactEmail, data });
    return { success: true };
  } catch (error) {
    console.error("Email send step failed:", error);
    return {
      error:
        "メールの送信に失敗しました。しばらくしてからもう一度お試しください。",
      success: false,
    };
  }
}
