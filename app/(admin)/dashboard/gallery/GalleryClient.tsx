"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, Lock, Star, ImageIcon, Crown } from "lucide-react";
import { ExpiresIn, PendingPhoto } from "../../types/gallery";
import { getUploadSignature } from "../../actions/getUploadSignature";
import { createGallery } from "../../actions/createGallery";
import { FloatingInput } from "@/app/_components/FloatingInput";

const GalleryClient = ({ canShare }: { canShare: boolean }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [expiresIn, setExpiresIn] = useState<ExpiresIn>("1d");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newPhotos: PendingPhoto[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      title: "",
      isGalleryCover: false,
    }));
    setPhotos((prev) => {
      const combined = [...prev, ...newPhotos];
      if (!combined.some((p) => p.isGalleryCover))
        combined[0].isGalleryCover = true;
      return combined;
    });
    e.target.value = "";
  };

  const handleSetCover = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({ ...p, isGalleryCover: p.id === id })),
    );
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (filtered.length > 0 && !filtered.some((p) => p.isGalleryCover))
        filtered[0].isGalleryCover = true;
      return filtered;
    });
  };

  const handleUpdatePhoto = (id: string, field: "title", value: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed || emails.includes(trimmed)) return;
    setEmails((prev) => [...prev, trimmed]);
    setEmailInput("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le titre est requis.");
      return;
    }
    if (isPrivate && emails.length === 0) {
      setError("Ajoutez au moins un email.");
      return;
    }

    startTransition(async () => {
      try {
        const uploadedPhotosData = [];

        // Une signature par photo — chacune a son propre public_id basé sur son titre
        for (let i = 0; i < photos.length; i++) {
          const p = photos[i];

          // Si pas de titre, on utilise le nom du fichier original (sans extension)
          const nameForSlug =
            p.title.trim() || p.file.name.replace(/\.[^.]+$/, "");
          const sig = await getUploadSignature(nameForSlug);
          if (sig.error || !sig.signature) {
            setError(sig.error ?? `Impossible de signer la photo ${i + 1}.`);
            return;
          }

          const formData = new FormData();
          formData.append("file", p.file);
          formData.append("api_key", sig.apiKey!);
          formData.append("timestamp", String(sig.timestamp));
          formData.append("signature", sig.signature);
          // public_id remplace folder — Cloudinary utilisera exactement ce nom
          formData.append("public_id", sig.publicId!);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            { method: "POST", body: formData },
          );

          if (!res.ok)
            throw new Error(`Erreur Cloudinary sur la photo ${i + 1}`);

          const json = await res.json();
          uploadedPhotosData.push({
            url: json.secure_url,
            publicId: json.public_id,
            title: p.title,
            isGalleryCover: p.isGalleryCover,
          });
        }

        // ÉTAPE 3 : création de la galerie en base
        const result = await createGallery({
          name,
          description,
          isPremium,
          isPrivate,
          expiresIn,
          emails,
          photos: uploadedPhotosData,
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        setName("");
        setDescription("");
        setIsPremium(false);
        setIsPrivate(false);
        setExpiresIn("1d");
        setEmails([]);
        setPhotos([]);
        setError(undefined);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue.",
        );
      }
    });
  };

  const leftMargin =
    "laptop:ml-[5%] desktop:ml-[5%] 2k:ml-[3%] ultrawide:ml-[3%] 4k:ml-[2.5%]";
  const rightMargin =
    "laptop:mr-[5%] desktop:mr-[5%] 2k:mr-[3%] ultrawide:mr-[3%] 4k:mr-[2.5%]";
  const durationOptions: { label: string; value: ExpiresIn }[] = [
    { label: "1j", value: "1d" },
    { label: "3j", value: "3d" },
    { label: "7j", value: "7d" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full flex flex-col items-center laptop:items-start
        gap-12 laptop:gap-8 desktop:gap-10 2k:gap-12 ultrawide:gap-14 4k:gap-20
        overflow-y-auto no-scrollbar pb-8 tablet:pb-10 2k:pb-14 4k:pb-20"
    >
      {/* RETOUR */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 tablet:gap-3 2k:gap-4 4k:gap-6
  text-cream/50 hover:text-cream transition-colors w-max self-start
  pl-[5%] tablet:pl-[3%] laptop:pl-0"
      >
        <ArrowLeft className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-4 desktop:w-4 desktop:h-5 2k:w-6 2k:h-6 ultrawide:w-8 ultrawide:h-8 4k:w-10 4k:h-10 transition-transform group-hover:-translate-x-1" />
        <span className="uppercase tracking-widest text-[8px] tablet:text-[10px] laptop:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl font-medium cursor-pointer">
          Retour au tableau de bord
        </span>
      </Link>

      {/* TITRE */}
      <h1
        className="font-bold text-cream tracking-wide text-center cursor-default laptop:self-center
        w-[90%] tablet:w-[80%] laptop:w-[70%]
        text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl 2k:text-4xl ultrawide:text-4xl 4k:text-7xl
         laptop:mb-6 desktop:mb-8 2k:mb-12 ultrawide:mb-14 4k:mb-20"
      >
        Ajouter une nouvelle galerie dans votre portfolio
      </h1>

      {/* TITRE + DESCRIPTION */}
      <div
        className={`flex flex-col
        w-[90%] tablet:w-[80%] laptop:w-[45%] desktop:w-[40%] 2k:w-[38%] ultrawide:w-[35%] 4k:w-[32%]
        gap-4 tablet:gap-5 laptop:gap-6 2k:gap-8 ultrawide:gap-10 4k:gap-14
        ${leftMargin}`}
      >
        <FloatingInput
          id="name"
          label="Titre de la galerie"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FloatingInput
          id="description"
          label="Description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* TOGGLES + BOUTON AJOUTER PHOTOS */}
      <div
        className={`flex flex-col laptop:flex-row laptop:items-center laptop:justify-between
        w-[90%] tablet:w-[80%] laptop:w-full
        gap-6 laptop:gap-0`}
      >
        <div
          className={`flex flex-row justify-center laptop:justify-start
          gap-3 tablet:gap-4 laptop:gap-5 2k:gap-6 ultrawide:gap-8 4k:gap-10
          ${leftMargin}`}
        >
          <button
            type="button"
            onClick={() => setIsPremium(!isPremium)}
            className={`flex items-center rounded-xl border transition-all duration-300
              gap-2 tablet:gap-3 4k:gap-4
              px-3 tablet:px-4 laptop:px-5 2k:px-6 4k:px-10
              py-2 tablet:py-3 2k:py-4 4k:py-6
              text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-2xl
              uppercase tracking-widest
              ${isPremium ? "border-blue bg-blue/10 text-blue" : "border-cream/20 text-cream/50 hover:border-cream/40 cursor-pointer"}`}
          >
            <Star className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
            Mise en avant
          </button>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center rounded-xl border transition-all duration-300
              gap-2 tablet:gap-3 4k:gap-4
              px-3 tablet:px-4 laptop:px-5 2k:px-6 4k:px-10
              py-2 tablet:py-3 2k:py-4 4k:py-6
              text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-2xl
              uppercase tracking-widest
              ${isPrivate ? "border-blue bg-blue/10 text-blue" : "border-cream/20 text-cream/50 hover:border-cream/40 cursor-pointer"}`}
          >
            <Lock className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
            Galerie privée
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex items-center justify-center
            w-[70%] tablet:w-[50%] laptop:w-auto
            gap-2 tablet:gap-3 2k:gap-4 4k:gap-6
            px-0 laptop:px-6 desktop:px-8 2k:px-10 4k:px-16
            py-3 tablet:py-4 laptop:py-3 2k:py-4 ultrawide:py-5 4k:py-8
            self-center laptop:self-auto
            rounded-xl border border-dashed border-cream/20
            text-cream/50 hover:text-cream hover:border-cream/40 transition-all
            text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-2xl
            uppercase tracking-widest cursor-pointer ${rightMargin}`}
        >
          <ImageIcon className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
          Ajouter des photos
        </button>
      </div>

      {/* SECTION PRIVÉE */}
      {isPrivate && !canShare && (
        <div
          className={`flex items-center gap-3 laptop:self-center w-[90%] tablet:w-[80%] laptop:w-[70%] desktop:w-[60%] p-4 tablet:p-5 laptop:p-6 rounded-xl border border-cream/10 glass-card`}
        >
          <Lock className="w-4 h-4 text-cream/30 shrink-0" />
          <p className="text-cream/50 text-[10px] tablet:text-xs laptop:text-sm uppercase tracking-widest">
            Partage privé réservé au template Premium —{" "}
            <Link
              href="/dashboard/templates"
              className="underline hover:text-cream transition-colors"
            >
              Voir mes templates
            </Link>
          </p>
        </div>
      )}
      {isPrivate && canShare && (
        <div
          className="flex flex-col laptop:self-center
          w-[90%] tablet:w-[80%] laptop:w-[70%] desktop:w-[60%] 2k:w-[55%] 4k:w-[60%]
          gap-4 tablet:gap-5 laptop:gap-6 2k:gap-8 4k:gap-14
          p-4 tablet:p-5 laptop:p-6 desktop:p-8 2k:p-10 4k:p-16
          rounded-xl border border-cream/10 glass-card"
        >
          <div className="flex flex-wrap items-center gap-3 tablet:gap-4 laptop:gap-5 2k:gap-6 4k:gap-10">
            <span className="text-cream/50 uppercase tracking-widest text-[10px] tablet:text-xs laptop:text-sm 2k:text-base 4k:text-2xl">
              Expire dans
            </span>
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExpiresIn(opt.value)}
                className={`rounded-lg border uppercase tracking-widest transition-all duration-300
                  px-3 tablet:px-4 2k:px-5 4k:px-8
                  py-1.5 tablet:py-2 2k:py-3 4k:py-5
                  text-[10px] tablet:text-xs laptop:text-sm 2k:text-base 4k:text-2xl
                  ${expiresIn === opt.value ? "border-blue bg-blue/10 text-blue" : "border-cream/20 text-cream/50 hover:border-cream/40"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 tablet:gap-4 2k:gap-5 4k:gap-8">
            <div className="flex-1">
              <FloatingInput
                id="email"
                label="Email du client"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                className="backdrop-filter-none! bg-transparent! border-cream/20! shadow-none!"
              />
            </div>
            <button
              type="button"
              onClick={handleAddEmail}
              className="rounded-xl border border-cream/20 text-cream/50 hover:text-cream hover:border-cream/40 transition-all
                px-3 tablet:px-4 2k:px-6 4k:px-10"
            >
              <Plus className="w-4 h-4 tablet:w-5 tablet:h-5 laptop:w-6 laptop:h-6 2k:w-7 2k:h-7 4k:w-10 4k:h-10" />
            </button>
          </div>

          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 tablet:gap-3 4k:gap-4">
              {emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-2 tablet:gap-3 4k:gap-4
                  px-3 tablet:px-4 4k:px-6 py-1.5 tablet:py-2 4k:py-3
                  rounded-full border border-blue/30 bg-blue/10 text-blue
                  text-[10px] tablet:text-xs laptop:text-sm 2k:text-base 4k:text-xl"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    <X className="w-3 h-3 tablet:w-4 tablet:h-4 2k:w-5 2k:h-5 4k:w-6 4k:h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TABLEAU PHOTOS */}
      {photos.length > 0 && (
        <div
          className="laptop:self-center
          w-[90%] tablet:w-[80%] laptop:w-[90%] desktop:w-[90%] 2k:w-[94%] 4k:w-[95%]
          overflow-x-auto no-scrollbar glass-card rounded-xl border border-cream/20
          p-3 tablet:p-4 laptop:p-5 desktop:p-6 2k:p-8 4k:p-14"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-cream/10">
                {["Preview", "Titre", "Cover", ""].map((col) => (
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
              {photos.map((photo) => (
                <tr
                  key={photo.id}
                  className="hover:bg-white/3 transition-colors duration-200"
                >
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <div className="rounded-lg overflow-hidden shrink-0 w-10 h-10 tablet:w-12 tablet:h-12 laptop:w-14 laptop:h-14 2k:w-16 2k:h-16 4k:w-24 4k:h-24">
                      <img
                        src={photo.preview}
                        alt={photo.title || "photo"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <input
                      type="text"
                      value={photo.title}
                      onChange={(e) =>
                        handleUpdatePhoto(photo.id, "title", e.target.value)
                      }
                      placeholder="Titre..."
                      className="w-full bg-transparent border-b border-cream/10 focus:border-blue outline-none
                        text-cream/80 placeholder:text-cream/20 py-1 transition-colors duration-200
                        text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg 4k:text-2xl"
                    />
                  </td>
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      className={`rounded-lg border transition-all duration-300
                        p-1.5 tablet:p-2 laptop:p-2.5 2k:p-3 4k:p-5
                        ${photo.isGalleryCover ? "border-blue bg-blue/10 text-blue" : "border-cream/10 text-cream/20 hover:text-cream/60 hover:border-cream/30"}`}
                    >
                      <Crown className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
                    </button>
                  </td>
                  <td className="py-2 tablet:py-3 2k:py-4 4k:py-6 px-2 tablet:px-3 laptop:px-4 2k:px-5 4k:px-8">
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="rounded-lg border border-cream/10 text-cream/20
                        hover:text-red-400 hover:border-red-400/20 transition-all duration-300
                        p-1.5 tablet:p-2 laptop:p-2.5 2k:p-3 4k:p-5"
                    >
                      <X className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-5 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <p
          className="text-red-400 font-medium laptop:self-center
          w-[90%] tablet:w-[80%] laptop:w-[70%] desktop:w-[65%]
          text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg 4k:text-2xl"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="text-green-400 font-medium laptop:self-center
          w-[90%] tablet:w-[80%] laptop:w-[70%] desktop:w-[65%]
          text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg 4k:text-2xl"
        >
          Galerie créée avec succès !
        </p>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={isPending}
        className={`group relative
          w-[90%] tablet:w-[80%] laptop:w-[32%] desktop:w-[28%] 2k:w-[25%] 4k:w-[25%]
          laptop:self-end
          py-4 tablet:py-5 laptop:py-5 desktop:py-6 2k:py-7 4k:py-14
          text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg 4k:text-3xl
          uppercase tracking-[0.25em] font-semibold text-cream bg-dark
          rounded-xl 4k:rounded-3xl overflow-hidden transition-all duration-300
          hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:opacity-70 cursor-pointer ${rightMargin}`}
      >
        <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
        <span className="relative flex items-center justify-center gap-3 desktop:gap-5 4k:gap-10 z-10">
          {isPending ? "Création en cours..." : "Créer la galerie"}
          {!isPending && (
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          )}
        </span>
      </button>
    </form>
  );
};

export default GalleryClient;
