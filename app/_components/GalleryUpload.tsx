"use client";

import { useRef, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { getUploadSignature } from "../(admin)/actions/getUploadSignature";
import { addPhotoToGallery } from "../(admin)/actions/photos";

interface Gallery {
  id: string;
  name: string;
}

interface Props {
  galleries: Gallery[];
}

type Status = "idle" | "signing" | "uploading" | "saving" | "done";

export const GalleryUpload = ({ galleries }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [galleryId, setGalleryId] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const isPending =
    status === "signing" || status === "uploading" || status === "saving";

  const statusLabel = {
    idle: "",
    signing: "Préparation...",
    uploading: "Upload...",
    saving: "Sauvegarde...",
    done: "",
  }[status];

  const selectedGalleryName = galleries.find((g) => g.id === galleryId)?.name;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!file || !galleryId) return;
    setError("");

    try {
      setStatus("signing");
      const nameForSlug = title.trim() || file.name.replace(/\.[^.]+$/, "");
      const sig = await getUploadSignature(nameForSlug);
      if (sig.error || !sig.signature) {
        setError(sig.error ?? "Erreur de signature.");
        setStatus("idle");
        return;
      }

      setStatus("uploading");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey!);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("public_id", sig.publicId!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!res.ok) throw new Error("Échec de l'upload.");

      const json = await res.json();

      setStatus("saving");
      const result = await addPhotoToGallery(
        galleryId,
        json.secure_url,
        json.public_id,
        title,
      );

      if (result.error) {
        setError(result.error);
        setStatus("idle");
        return;
      }

      setStatus("done");
      setFile(null);
      setPreview(null);
      setTitle("");
      setGalleryId("");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("idle");
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 tablet:gap-3 2k:gap-6 4k:gap-10 items-center laptop:items-end">
      {/* 1. ZONE PHOTO (Ton design original, avec les icônes qui montent en 4K) */}
      <div
        className="relative aspect-video w-full overflow-hidden glass-card flex items-center justify-center cursor-pointer active:scale-[0.99] group"
        onClick={() => !isPending && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview && (
          <img
            src={preview}
            alt="aperçu"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <span className="text-cream text-[10px] tablet:text-xs desktop:text-sm 2k:text-lg 4k:text-3xl uppercase tracking-widest animate-pulse">
              {statusLabel}
            </span>
          </div>
        )}

        {status === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <span className="text-cream text-[10px] tablet:text-xs desktop:text-sm 2k:text-lg 4k:text-3xl uppercase tracking-widest">
              Photo ajoutée !
            </span>
          </div>
        )}

        {!isPending && status !== "done" && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-300 ${preview ? "bg-black/0 group-hover:bg-black/30" : ""}`}
          >
            <Plus
              className={`w-8 h-8 tablet:w-10 tablet:h-10 laptop:w-8 laptop:h-8 desktop:w-12 desktop:h-12 2k:w-16 2k:h-16 4k:w-24 4k:h-24 ${preview ? "text-white opacity-50" : "text-blue opacity-50"} group-hover:scale-110 transition-all`}
            />
          </div>
        )}
      </div>

      {/* 2. CONTRÔLES (Tes styles glass-input/glass-card avec l'alignement responsive) */}
      <div className="flex items-center justify-center laptop:justify-end gap-2 tablet:gap-4 laptop:gap-2 desktop:gap-4 2k:gap-6 4k:gap-10 w-full mt-1 2k:mt-2 4k:mt-4">
        {/* Titre optionnel */}
        <input
          type="text"
          placeholder="Titre..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          className="flex-1 laptop:flex-none laptop:w-32 desktop:w-48 2k:w-64 ultrawide:w-72 4k:w-96 bg-transparent border-b border-cream/10 focus:border-blue outline-none text-cream/80 placeholder:text-cream/20 py-1 text-[10px] tablet:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl tracking-widest transition-colors disabled:opacity-50"
        />

        {/* Dropdown galerie */}
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsGalleryOpen((v) => !v)}
            className={`flex items-center gap-2 glass-input px-3 py-2 text-[10px] tablet:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl uppercase tracking-widest text-cream/80 outline-none transition-all duration-300 disabled:opacity-50 ${isGalleryOpen ? "rounded-t-lg rounded-b-none" : "rounded-lg"}`}
          >
            <span className="truncate max-w-[80px] tablet:max-w-[120px] desktop:max-w-[150px] 2k:max-w-[200px] 4k:max-w-[300px]">
              {selectedGalleryName ?? "Galerie..."}
            </span>
            <ChevronDown
              className={`w-3 h-3 tablet:w-4 tablet:h-4 desktop:w-5 desktop:h-5 2k:w-6 2k:h-6 4k:w-10 4k:h-10 shrink-0 transition-transform duration-300 ${isGalleryOpen ? "rotate-180 text-cream" : "text-cream/50"}`}
            />
          </button>

          {/* Menu déroulant - S'ouvre vers le HAUT pour ne pas être coupé */}
          {isGalleryOpen && (
            <div className="absolute right-0 bottom-full z-50 w-48 tablet:w-56 laptop:w-48 desktop:w-56 2k:w-72 4k:w-100 glass-card rounded-t-lg rounded-b-none max-h-48 overflow-y-auto no-scrollbar">
              {galleries.length === 0 ? (
                <p className="p-3 text-[10px] tablet:text-xs 4k:text-xl text-cream/30 uppercase tracking-widest">
                  Aucune galerie.
                </p>
              ) : (
                galleries.map((gal) => (
                  <button
                    key={gal.id}
                    type="button"
                    className="w-full text-right p-3 4k:p-6 text-[10px] tablet:text-xs desktop:text-sm 2k:text-base 4k:text-2xl text-cream/80 hover:text-cream hover:bg-black/40 truncate transition-colors uppercase tracking-widest"
                    onClick={() => {
                      setGalleryId(gal.id);
                      setIsGalleryOpen(false);
                    }}
                  >
                    {gal.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bouton confirmer */}
        <button
          type="button"
          disabled={!file || !galleryId || isPending}
          onClick={handleSubmit}
          className="shrink-0 glass-card text-blue px-4 py-2 rounded-lg text-[10px] tablet:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl uppercase tracking-widest font-semibold disabled:opacity-30 transition-colors"
        >
          Ajouter
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-red-400 text-[10px] tablet:text-xs 4k:text-xl text-center leading-snug w-full">
          {error}
        </p>
      )}
    </div>
  );
};
