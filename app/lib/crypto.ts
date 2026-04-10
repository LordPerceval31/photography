import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

const ALGORITHM = "aes-256-cbc";

// On récupère la clé de manière sécurisée
const getEncryptionKey = () => {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY est manquante dans le fichier .env");
  }
  // scryptSync permet de garantir qu'on a bien la bonne longueur de clé pour AES-256
  return scryptSync(secret, "salt", 32);
};

export const encrypt = (text: string) => {
  if (!text) return text;

  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

export const decrypt = (text: string) => {
  // Si le texte n'a pas le séparateur ":", c'est qu'il n'est pas chiffré
  if (!text || !text.includes(":")) return text;

  try {
    const [ivHex, encryptedText] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(`[crypto:decrypt] Impossible de déchiffrer la valeur: ${error}`);
  }
};
