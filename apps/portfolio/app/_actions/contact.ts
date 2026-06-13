"use server";

import { getProfile } from "@ykzts/supabase/queries";
import { checkBotId } from "botid/server";
import { start } from "workflow/api";
import { z } from "zod";
import { sendContactEmail } from "@/workflows/send-contact-email";

const contactFormSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  message: z.string().min(10, "メッセージは10文字以上入力してください"),
  name: z.string().min(1, "お名前を入力してください"),
  privacyConsent: z
    .boolean()
    .refine((val) => val === true, "プライバシーポリシーに同意してください"),
  subject: z.string().min(1, "件名を入力してください"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface ContactFormResponse {
  error?: string;
  fieldErrors?: Partial<Record<keyof ContactFormData, string>>;
  formData?: Partial<ContactFormData>;
  success: boolean;
}

export async function submitContactForm(
  _prevState: ContactFormResponse | null,
  formData: FormData
): Promise<ContactFormResponse> {
  // Extract form data
  const rawData = {
    email: formData.get("email"),
    message: formData.get("message"),
    name: formData.get("name"),
    privacyConsent: formData.get("privacyConsent") === "on",
    subject: formData.get("subject"),
  };

  const data: ContactFormData = {
    email: typeof rawData.email === "string" ? rawData.email : "",
    message: typeof rawData.message === "string" ? rawData.message : "",
    name: typeof rawData.name === "string" ? rawData.name : "",
    privacyConsent: rawData.privacyConsent,
    subject: typeof rawData.subject === "string" ? rawData.subject : "",
  };

  const verification = await checkBotId();

  if (verification.isBot) {
    return {
      error: "スパム対策の確認に失敗しました。もう一度お試しください。",
      formData: data,
      success: false,
    };
  }

  try {
    // Fetch contact email from Supabase profile server-side
    const profile = await getProfile();

    if (!profile.email) {
      throw new Error("Contact email is not configured in profile");
    }

    const contactEmail = profile.email;
    // Validate form data
    const validatedData = contactFormSchema.parse(data);

    // Fire-and-forget: enqueue the durable email workflow.
    // No need to await run.returnValue here — the HTTP handler should not block on queued work.
    await start(sendContactEmail, [{ contactEmail, data: validatedData }]);

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      for (const issue of error.issues) {
        const field = issue.path[0] as keyof ContactFormData;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      }
      return {
        fieldErrors,
        formData: data,
        success: false,
      };
    }

    console.error("Unexpected error in submitContactForm:", error);
    return {
      error:
        "予期しないエラーが発生しました。しばらくしてからもう一度お試しください。",
      success: false,
    };
  }
}
