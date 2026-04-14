"use server";

import { z } from "zod";
import { headers } from "next/headers";
import emailjs from "@emailjs/nodejs";
import { contactRateLimit } from "@/app/lib/ratelimit";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères.").max(100),
  email: z.string().email("Email invalide."),
  phone: z.string().max(20).optional().or(z.literal("")), // Optionnel
  message: z
    .string()
    .min(10, "Le message doit faire au moins 10 caractères.")
    .max(2000),
});

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function sendContactEmail(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";

  const { success: allowed } = await contactRateLimit.limit(ip);
  if (!allowed) {
    return {
      success: false,
      error: "Trop de messages envoyés. Réessayez dans 30 minutes.",
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Données invalides.";
    return { success: false, error: firstError };
  }

  const { name, email, phone, message } = parsed.data;

  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      {
        from_name: name,
        from_email: email,
        from_phone: phone || "Non renseigné",
        message: message,
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY!,
        privateKey: process.env.EMAILJS_PRIVATE_KEY!,
      },
    );

    return { success: true };
  } catch (error) {
    console.error("EmailJS error:", error);
    return { success: false, error: "Erreur lors de l'envoi. Réessayez." };
  }
}
