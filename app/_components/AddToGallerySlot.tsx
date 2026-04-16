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

export const AddToGallerySlot = ({ galleries }: Props) => {
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
      // Si pas de titre, on utilise le nom du fichier original (sans extension)
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
      // public_id remplace folder — Cloudinary utilisera exactement ce nom
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
    <div className="flex flex-col gap-3 w-full">
      {/* Zone photo — même style que PhotoSlot */}
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
            <span className="text-cream text-xs uppercase tracking-widest animate-pulse">
              {statusLabel}
            </span>
          </div>
        )}

        {status === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <span className="text-cream text-xs uppercase tracking-widest">
              Photo ajoutée !
            </span>
          </div>
        )}

        {!isPending && status !== "done" && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-300 ${preview ? "bg-black/0 group-hover:bg-black/30" : ""}`}
          >
            <Plus
              className={`w-6 h-6 tablet:w-8 tablet:h-8 laptop:w-6 laptop:h-6 desktop:w-8 desktop:h-8 2k:w-12 2k:h-12 4k:w-16 4k:h-16 ${preview ? "text-white opacity-50" : "text-blue opacity-50"}`}
            />
          </div>
        )}
      </div>

      {/* Contrôles en dessous de la photo */}
      <div className="flex items-center gap-2 w-full">
        {/* Titre optionnel */}
        <input
          type="text"
          placeholder="Titre..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          className="flex-1 bg-transparent border-b border-cream/10 focus:border-blue outline-none text-cream/80 placeholder:text-cream/20 py-1 text-[10px] tablet:text-xs 2k:text-sm 4k:text-lg uppercase tracking-widest transition-colors disabled:opacity-50"
        />

        {/* Dropdown galerie */}
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsGalleryOpen((v) => !v)}
            className={`flex items-center gap-2 glass-input px-3 py-2 text-[10px] tablet:text-xs 2k:text-sm 4k:text-lg uppercase tracking-widest text-cream/80 outline-none transition-all duration-300 disabled:opacity-50 ${isGalleryOpen ? "rounded-t-lg rounded-b-none" : "rounded-lg"}`}
          >
            <span className="truncate max-w-32">
              {selectedGalleryName ?? "Galerie..."}
            </span>
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform duration-300 ${isGalleryOpen ? "rotate-180 text-cream" : "text-cream/50"}`}
            />
          </button>

          {isGalleryOpen && (
            <div className="absolute z-50 right-0 top-full w-48 glass-card rounded-t-none rounded-b-lg max-h-48 overflow-y-auto no-scrollbar">
              {galleries.length === 0 ? (
                <p className="p-3 text-[10px] text-cream/30 uppercase tracking-widest">
                  Aucune galerie.
                </p>
              ) : (
                galleries.map((gal) => (
                  <button
                    key={gal.id}
                    type="button"
                    className="w-full text-left p-3 text-[10px] tablet:text-xs text-cream/80 hover:text-cream hover:bg-black/40 truncate transition-colors uppercase tracking-widest"
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
          className="shrink-0 glass-card text-blue px-4 py-2 rounded-lg text-[10px] tablet:text-xs 2k:text-sm 4k:text-lg uppercase tracking-widest font-semibold disabled:opacity-30 transition-colors"
        >
          Ajouter
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-[10px] tablet:text-xs 4k:text-xl text-center leading-snug">
          {error}
        </p>
      )}
    </div>
  );
};
