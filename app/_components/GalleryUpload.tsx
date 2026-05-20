"use client";

import { useRef, useState } from "react";
import { Upload, ChevronDown, X, Crown, Loader2 } from "lucide-react";
import { getUploadSignature } from "../(admin)/actions/getUploadSignature";
import { addPhotosToGallery } from "../(admin)/actions/photos";

interface Gallery {
  id: string;
  name: string;
}

interface Props {
  galleries: Gallery[];
}

interface PendingPhoto {
  id: string;
  file: File;
  preview: string;
  title: string;
  isGalleryCover: boolean;
}

type Status = "idle" | "uploading" | "done";

export const GalleryUpload = ({ galleries }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [galleryId, setGalleryId] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const isPending = status === "uploading";
  const selectedGalleryName = galleries.find((g) => g.id === galleryId)?.name;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newPhotos: PendingPhoto[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      title: "",
      isGalleryCover: false,
    }));

    setPendingPhotos((prev) => [...prev, ...newPhotos]);
    setError("");
    e.target.value = "";
  };

  // Bascule la couronne : click sur la même → désactive, click sur une autre → active celle-ci
  const handleSetCover = (id: string) => {
    setPendingPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isGalleryCover: p.id === id ? !p.isGalleryCover : false,
      })),
    );
  };

  const handleUpdateTitle = (id: string, value: string) => {
    setPendingPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: value } : p)),
    );
  };

  const handleRemove = (id: string) => {
    setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (pendingPhotos.length === 0 || !galleryId) return;
    setError("");
    setStatus("uploading");

    try {
      const uploaded: {
        url: string;
        publicId: string;
        title: string;
        isGalleryCover: boolean;
      }[] = [];

      for (const photo of pendingPhotos) {
        const nameForSlug =
          photo.title.trim() || photo.file.name.replace(/\.[^.]+$/, "");
        const sig = await getUploadSignature(nameForSlug);
        if (sig.error || !sig.signature) {
          setError(sig.error ?? "Erreur de signature.");
          setStatus("idle");
          return;
        }

        const formData = new FormData();
        formData.append("file", photo.file);
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
        uploaded.push({
          url: json.secure_url,
          publicId: json.public_id,
          title: photo.title,
          isGalleryCover: photo.isGalleryCover,
        });
      }

      const result = await addPhotosToGallery(galleryId, uploaded);
      if (result.error) {
        setError(result.error);
        setStatus("idle");
        return;
      }

      setStatus("done");
      setPendingPhotos([]);
      setGalleryId("");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("idle");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 tablet:gap-5 2k:gap-8 4k:gap-12">
      {/* Grand bouton d'upload */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="w-full py-8 tablet:py-10 2k:py-14 4k:py-20 flex flex-col items-center justify-center gap-3 2k:gap-4 4k:gap-6 glass-card border-2 border-dashed border-cream/20 hover:border-blue/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
        <Upload className="w-8 h-8 tablet:w-10 tablet:h-10 2k:w-14 2k:h-14 4k:w-20 4k:h-20 text-blue/50" />
        <span className="text-cream/40 text-[10px] tablet:text-xs 2k:text-base 4k:text-2xl uppercase tracking-widest">
          {pendingPhotos.length > 0
            ? "Ajouter d'autres photos"
            : "Sélectionner des photos"}
        </span>
      </button>

      {/* Tableau des photos en attente */}
      {pendingPhotos.length > 0 && (
        <div className="overflow-x-auto no-scrollbar glass-card rounded-xl border border-cream/20 p-3 tablet:p-4 laptop:p-5 2k:p-8 4k:p-14">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-cream/10">
                {["Preview", "Titre", "Couverture", ""].map((col) => (
                  <th
                    key={col}
                    className="text-left uppercase tracking-widest font-medium text-cream/30
                    py-2 tablet:py-3 2k:py-4 4k:py-6
                    px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8
                    text-[8px] tablet:text-[10px] laptop:text-xs desktop:text-sm 2k:text-base 4k:text-xl"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/5">
              {pendingPhotos.map((photo) => (
                <tr
                  key={photo.id}
                  className="hover:bg-white/3 transition-colors duration-200"
                >
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <div className="rounded-lg overflow-hidden shrink-0 w-10 h-10 tablet:w-12 tablet:h-12 laptop:w-14 laptop:h-14 2k:w-16 2k:h-16 4k:w-24 4k:h-24">
                      <img
                        src={photo.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <label htmlFor={`title-${photo.id}`} className="sr-only">
                      Titre de la photo
                    </label>
                    <input
                      id={`title-${photo.id}`}
                      type="text"
                      value={photo.title}
                      onChange={(e) =>
                        handleUpdateTitle(photo.id, e.target.value)
                      }
                      placeholder="Titre..."
                      disabled={isPending}
                      className="w-full bg-transparent border-b border-cream/10 focus:border-blue outline-none
                        text-cream/80 placeholder:text-cream/20 py-1 transition-colors duration-200
                        text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg 4k:text-2xl disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <button
                      type="button"
                      aria-label={
                        photo.isGalleryCover
                          ? "Photo de couverture actuelle"
                          : "Définir comme couverture de la galerie"
                      }
                      onClick={() => handleSetCover(photo.id)}
                      disabled={isPending}
                      className={`rounded-lg border transition-all duration-300
                        p-1.5 tablet:p-2 laptop:p-2.5 2k:p-3 4k:p-5 disabled:opacity-30
                        ${
                          photo.isGalleryCover
                            ? "border-blue bg-blue/10 text-blue"
                            : "border-cream/10 text-cream/20 hover:text-cream/60 hover:border-cream/30"
                        }`}
                    >
                      <Crown
                        aria-hidden="true"
                        className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8"
                      />
                    </button>
                  </td>
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <button
                      type="button"
                      aria-label="Retirer cette photo"
                      onClick={() => handleRemove(photo.id)}
                      disabled={isPending}
                      className="rounded-lg border border-cream/10 text-cream/20
                        hover:text-red-400 hover:border-red-400/20 transition-all duration-300
                        p-1.5 tablet:p-2 laptop:p-2.5 2k:p-3 4k:p-5 disabled:opacity-30"
                    >
                      <X
                        aria-hidden="true"
                        className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contrôles : galerie + soumettre */}
      {pendingPhotos.length > 0 && (
        <div className="flex items-center justify-end gap-2 tablet:gap-4 2k:gap-6 4k:gap-10">
          {/* Dropdown galerie */}
          <div className="relative shrink-0">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsGalleryOpen((v) => !v)}
              className={`flex items-center gap-2 glass-input px-3 py-2 text-[10px] tablet:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl uppercase tracking-widest text-cream/80 outline-none transition-all duration-300 disabled:opacity-50 ${
                isGalleryOpen ? "rounded-t-lg rounded-b-none" : "rounded-lg"
              }`}
            >
              <span className="truncate max-w-20 tablet:max-w-30 desktop:max-w-37.5 2k:max-w-50 4k:max-w-75">
                {selectedGalleryName ?? "Galerie..."}
              </span>
              <ChevronDown
                className={`w-3 h-3 tablet:w-4 tablet:h-4 desktop:w-5 desktop:h-5 2k:w-6 2k:h-6 4k:w-10 4k:h-10 shrink-0 transition-transform duration-300 ${
                  isGalleryOpen ? "rotate-180 text-cream" : "text-cream/50"
                }`}
              />
            </button>

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

          {/* Bouton soumettre */}
          <button
            type="button"
            disabled={!galleryId || isPending}
            onClick={handleSubmit}
            className="shrink-0 glass-card text-blue px-4 py-2 rounded-lg text-[10px] tablet:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl uppercase tracking-widest font-semibold disabled:opacity-30 transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `Ajouter ${pendingPhotos.length} photo${pendingPhotos.length > 1 ? "s" : ""}`
            )}
          </button>
        </div>
      )}

      {status === "done" && (
        <p className="text-green-400 text-[10px] tablet:text-xs 4k:text-xl text-center uppercase tracking-widest">
          Photos ajoutées !
        </p>
      )}

      {error && (
        <p className="text-red-400 text-[10px] tablet:text-xs 4k:text-xl text-center leading-snug">
          {error}
        </p>
      )}
    </div>
  );
};
