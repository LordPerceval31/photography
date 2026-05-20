import { resend } from "./resend";

export const sendRecoveryEmail = async (email: string, code: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Photographe Admin <noreply@photolio.fr>",
      to: email,
      subject: "Ton code de sécurité",
      html: `
        <div style="font-family: sans-serif; color: #2c2c2c;">
          <h2>Récupération de compte</h2>
          <p>Bonjour,</p>
          <p>Voici votre code de sécurité pour réinitialiser votre mot de passe :</p>
          <div style="background: #f5f5f0; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #558b8b;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Ce code est valide pendant 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw new Error("Échec de l'envoi de l'email.");
    }

    return data;
  } catch (error) {
    console.error("Mail Service Error:", error);
    throw error;
  }
};

export const sendGalleryInviteEmail = async (
  email: string,
  token: string,
  code: string,
  expiresAt?: Date | null,
) => {
  const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${token}`;

  const expirationText = expiresAt
    ? `Attention : Ce lien et les photos seront automatiquement supprimés le <strong>${expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(":", "h")}</strong>.`
    : `Ce lien expirera automatiquement.`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Photographe Admin <noreply@photolio.fr>",
      to: email,
      subject: "Vos photos sont disponibles",
      html: `
        <div style="font-family: sans-serif; color: #2c2c2c; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #558b8b;">Vos photos sont prêtes</h2>
          <p>Bonjour,</p>
          <p>Votre photographe vient de partager une galerie de photos avec vous.</p>

          <a href="${galleryUrl}" style="display: inline-block; margin: 20px 0; padding: 14px 28px; background: #558b8b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Accéder à mes photos
          </a>

          <p>Ce lien est protégé. Utilisez le code ci-dessous pour y accéder :</p>
          <div style="background: #f5f5f0; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #558b8b;">
            ${code}
          </div>

          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            ${expirationText}<br>
            Si vous n'êtes pas concerné par ce message, ignorez cet email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw new Error("Échec de l'envoi de l'email.");
    }

    return data;
  } catch (error) {
    console.error("Mail Service Error:", error);
    throw error;
  }
};

// Partage simple : juste le lien, pas de code ni d'expiration
export const sendGalleryShareEmail = async (
  email: string,
  galleryUrl: string,
  galleryName: string,
) => {
  const { error } = await resend.emails.send({
    from: "Photographe Admin <noreply@photolio.fr>",
    to: email,
    subject: `Des photos partagées avec vous — ${galleryName}`,
    html: `
      <div style="font-family: sans-serif; color: #2c2c2c; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #558b8b;">Des photos partagées avec vous</h2>
        <p>Bonjour,</p>
        <p>Votre photographe vient de partager la galerie <strong>${galleryName}</strong> avec vous.</p>
        <a href="${galleryUrl}" style="display: inline-block; margin: 20px 0; padding: 14px 28px; background: #558b8b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Télécharger les photos (ZIP)
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          Si vous n'êtes pas concerné par ce message, ignorez cet email.
        </p>
      </div>
    `,
  });

  if (error) throw new Error("Échec de l'envoi de l'email.");
};
