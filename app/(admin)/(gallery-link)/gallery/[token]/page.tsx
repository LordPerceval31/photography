"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { FloatingInput } from "@/app/_components/FloatingInput";

export default function GalleryAccessPage() {
  const { token } = useParams<{ token: string }>();

  console.log("🟢 [RENDER] GalleryAccessPage rendu, token =", token);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    console.log("🔵 [CLICK] handleSubmit appelé, code =", code, "isLoading =", isLoading);
    if (isLoading) {
      console.log("⏸️ [SKIP] isLoading=true, on sort");
      return;
    }
    if (!code.trim()) {
      console.log("⚠️ [VIDE] Code vide, on sort");
      setError("Veuillez saisir votre code d'accès.");
      return;
    }
    setError("");
    setIsLoading(true);
    console.log("🚀 [FETCH] Début validation, token =", token);

    try {
      // 1. Validation du code
      const validationRes = await fetch(`/api/validate-gallery/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      console.log("📡 [VALIDATION] status =", validationRes.status, validationRes.ok ? "OK" : "ERREUR");

      if (!validationRes.ok) {
        const data = (await validationRes.json().catch(() => ({}))) as {
          error?: string;
        };
        console.log("❌ [VALIDATION FAILED] data =", data);
        setError(
          data.error || "Une erreur est survenue lors de la vérification.",
        );
        setIsLoading(false);
        return;
      }

      console.log("✅ [VALIDATION OK] Début download");
      // 2. Récupération de l'URL Cloudinary
      const res = await fetch(`/api/download-gallery/${token}`);
      console.log("📡 [DOWNLOAD] status =", res.status, res.ok ? "OK" : "ERREUR");

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log("❌ [DOWNLOAD FAILED] data =", data);
        setError(data.error || "Impossible de créer le téléchargement.");
        setIsLoading(false);
        return;
      }

      const responseData = await res.json();
      console.log("📦 [RESPONSE DATA]", responseData);

      if (!responseData.url) {
        console.log("❌ [URL INVALIDE] responseData.url est vide");
        setError("L'URL générée est invalide.");
        setIsLoading(false);
        return;
      }

      console.log("⬇️ [REDIRECT] window.location.assign vers", responseData.url);
      // 3. Téléchargement direct (ne quitte pas la page car c'est un ZIP)
      window.location.assign(responseData.url);

      setIsLoading(false);
      setCode("");
    } catch (e) {
      console.error("💥 [CATCH] Erreur inattendue:", e);
      setError("Une erreur inattendue est survenue.");
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

      <div className="flex flex-col gap-5 tablet:gap-6 2k:gap-8 4k:gap-16">
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
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
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="group relative mt-2 w-full py-4 tablet:py-5 2k:py-6 4k:py-14 text-xs tablet:text-sm 2k:text-lg 4k:text-4xl uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
          <span className="relative z-10">
            {isLoading ? "Vérification..." : "Télécharger mes photos"}
          </span>
        </button>
      </div>
    </>
  );
}
