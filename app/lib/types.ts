export interface Item {
  id: string;
  img: string;
  url: string;
  height: number;
  galleryId: string | null;
}

export function optimizeCloudinaryUrl(url: string): string {
  // Si ce n'est pas une URL Cloudinary ou qu'il y a un souci, on la retourne telle quelle
  if (!url || !url.includes("cloudinary.com")) return url;

  // Si elle est DÉJÀ optimisée, on ne fait rien
  if (url.includes("f_auto") || url.includes("q_auto")) return url;

  // On trouve l'endroit "/upload/" et on glisse nos paramètres magiques juste après
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
