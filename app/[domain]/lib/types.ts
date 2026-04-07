export interface Item {
  id: string;
  img: string;
  url: string;
  height: number;
  galleryId: string | null;
}

export function optimizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("f_auto") || url.includes("q_auto")) return url;

  // On ajoute w_1080 pour limiter la largeur à 1080 pixels
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1080/");
}
