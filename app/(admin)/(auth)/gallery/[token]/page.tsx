"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { validateGalleryCode } from "@/app/(admin)/actions/validateGalleryCode";
import { FloatingInput } from "@/app/_components/FloatingInput";

export default function GalleryAccessPage() {
  const { token } = useParams<{ token: string }>();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!code.trim()) {
      setError("Veuillez saisir votre code d'accès.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const result = await validateGalleryCode(token, code);

      if ("error" in result) {
        setError(
          result.error || "Une erreur est survenue lors de la vérification.",
        );
        setIsLoading(false);
        return;
      }

      // Code valide → déclenche le téléchargement ZIP
      window.location.href = `/api/download-gallery/${token}`;
      // isLoading reste true pendant la navigation (intentionnel)
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 tablet:mb-10 2k:mb-14 4k:mb-24">
        <h2 className="text-2xl tablet:text-4xl 2k:text-5xl 4k:text-7xl font-bold text-cream leading-tight cursor-default">
          Accédez à vos photos
        </h2>
        <p className="mt-3 text-xs tablet:text-sm 2k:text-base 4k:text-2xl text-cream/60 cursor-default">
          Saisissez le code reçu par email pour télécharger vos photos.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 tablet:gap-6 2k:gap-8 4k:gap-16"
      >
        <FloatingInput
          id="code"
          name="code"
          label="Code d'accès"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          autoComplete="off"
          autoFocus
        />

        {error && (
          <p className="ml-1 text-xs tablet:text-sm 4k:text-2xl text-red-400 font-medium cursor-default">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="group relative mt-2 w-full py-4 tablet:py-5 2k:py-6 4k:py-14 text-xs tablet:text-sm 2k:text-lg 4k:text-4xl uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
          <span className="relative flex items-center justify-center gap-3 z-10">
            {isLoading ? (
              "Vérification..."
            ) : (
              <>
                Télécharger mes photos
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </span>
        </button>
      </form>
    </>
  );
}
