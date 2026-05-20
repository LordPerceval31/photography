import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

// Si la clé est manquante (pendant le build par exemple),
// on passe une chaîne bidon pour éviter l'erreur "Missing API key"
export const resend = new Resend(apiKey || "re_dummy_key_for_build");
