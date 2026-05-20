export type PendingPhoto = {
  id: string; // id local temporaire (pas en base)
  file: File;
  preview: string;
  title: string;
  isGalleryCover: boolean;
};

export type ExpiresIn = "1d" | "3d" | "7d";
