"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { resend } from "@/app/lib/resend";
import { contactRateLimit } from "@/app/lib/ratelimit";

// Schéma de validation du formulaire
const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères.").max(100),
  email: z.string().email("Email invalide."),
  subject: z.string().min(2, "Le sujet est requis.").max(200),
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
  formData: FormData
): Promise<ContactFormState> {
  // 1. Récupérer l'IP pour le rate limit
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";

  // 2. Vérifier le rate limit
  const { success: allowed } = await contactRateLimit.limit(ip);
  if (!allowed) {
    return {
      success: false,
      error: "Trop de messages envoyés. Réessayez dans 30 minutes.",
    };
  }

  // 3. Valider les données
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Données invalides.";
    return { success: false, error: firstError };
  }

  const { name, email, subject, message } = parsed.data;

  // 4. Envoyer l'email via Resend
  const { error } = await resend.emails.send({
    from: "Photolio Contact <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL!,
    replyTo: email,
    subject: `[Photolio] ${subject}`,
    html: `
      <div style="font-family: sans-serif; color: #2c2c2c; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #558b8b;">Nouveau message depuis photolio.fr</h2>
        <p><strong>De :</strong> ${name} (${email})</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error: "Erreur lors de l'envoi. Réessayez." };
  }

  return { success: true };
}
