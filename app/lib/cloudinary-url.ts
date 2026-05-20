// Fonction pure de manipulation d'URL — pas de SDK Cloudinary, utilisable côté client
export const optimizeCloudinaryUrl = (url: string, width = 1080): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("f_auto") || url.includes("q_auto")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};
