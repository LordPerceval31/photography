"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { getUploadSignature } from "../(admin)/actions/getUploadSignature";
import { savePhoto } from "../(admin)/actions/savePhoto";

type PhotoSlotType =
  | "isCover"
  | "isPortrait"
  | "isAboutPicture1"
  | "isAboutPicture2"
  | "isAboutPicture3";
type UploadStatus = "idle" | "signing" | "uploading" | "saving";

interface PhotoSlotProps {
  slot: PhotoSlotType;
  aspectRatio: string;
  currentUrl?: string;
}

export const PhotoSlot = ({
  slot,
  aspectRatio,
  currentUrl,
}: PhotoSlotProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(
    currentUrl || undefined,
  );
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isPending = status !== "idle";

  const handleClick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    try {
      // 1. Signature côté serveur — l'API secret ne quitte jamais le serveur
      setStatus("signing");
      const sig = await getUploadSignature(slot);
      if (sig.error || !sig.signature) {
        setPreview(currentUrl);
        setError(sig.error ?? "Erreur de signature");
        return;
      }
      setError(null);

      // 2. Upload direct vers Cloudinary — pas de proxy serveur, pas de limite de taille
      setStatus("uploading");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey!);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", "photographe");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        setPreview(currentUrl);
        setStatus("idle");
        return;
      }

      const data = await response.json();

      // 3. Sauvegarde en base
      setStatus("saving");
      const result = await savePhoto(data.secure_url, data.public_id, slot);
      if (result.error) {
        setPreview(currentUrl);
        setError(result.error);
      }
    } finally {
      setStatus("idle");
    }
  };

  const statusLabel = {
    signing: "Préparation...",
    uploading: "Upload...",
    saving: "Sauvegarde...",
    idle: "",
  }[status];

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className={`relative ${aspectRatio} w-full overflow-hidden glass-card flex items-center justify-center cursor-pointer active:scale-95 group`}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {/* IMAGE */}
        {preview && (
          <img
            src={preview}
            alt={slot}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Upload en cours */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <span className="text-cream text-xs uppercase tracking-widest animate-pulse">
              {statusLabel}
            </span>
          </div>
        )}

        {/* Croix permanente — bleue/50 sans image, blanche avec image (+ hover overlay) */}
        {!isPending && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-300
          ${preview ? "bg-black/0 group-hover:bg-black/30" : ""}`}
          >
            <Plus
              className={`w-6 h-6 tablet:w-8 tablet:h-8 laptop:w-6 laptop:h-6 desktop:w-8 desktop:h-8 2k:w-12 2k:h-12 4k:w-16 4k:h-16
            ${preview ? "text-white opacity-50" : "text-blue opacity-50"}`}
            />
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-[10px] tablet:text-xs 4k:text-xl text-center leading-snug">
          {error}
        </p>
      )}
    </div>
  );
};
