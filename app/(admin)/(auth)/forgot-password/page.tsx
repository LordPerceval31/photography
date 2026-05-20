"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "../../actions/auth";
import { FloatingInput } from "@/app/_components/FloatingInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      router.push("/login");
    }
  }, [isSuccess, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || isSuccess) return;

    const formData = new FormData();
    formData.append("email", email);

    startTransition(async () => {
      const data = await forgotPassword(formData);
      if (data?.error) {
        setError(data.error);
      } else {
        setIsSuccess(true);
      }
    });
  };

  return (
    <>
      {/* RETOUR : Navigation fluide sur tous les formats */}
      {!isSuccess && (
        <Link
          href="/login"
          className="group flex items-center gap-2 text-cream/50 hover:text-blue transition-colors mb-6 tablet:mb-8 laptop:mb-10 desktop:mb-12 2k:mb-14 ultrawide:mb-16 4k:mb-24 text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-3xl uppercase tracking-widest"
        >
          <ArrowLeft
            className="transition-transform group-hover:-translate-x-1"
            size={14}
          />
          <span>Retour</span>
        </Link>
      )}

      {/* EN-TÊTE : Échelle progressive complète */}
      <div className="mb-8 tablet:mb-10 laptop:mb-12 desktop:mb-14 2k:mb-16 ultrawide:mb-20 4k:mb-32">
        <p className="text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-3xl uppercase tracking-[0.3em] text-blue font-medium mb-3 tablet:mb-4 4k:mb-8 cursor-default">
          Mot de passe oublié ?
        </p>
        <p className="text-base tablet:text-xl laptop:text-2xl desktop:text-3xl 2k:text-4xl ultrawide:text-4xl 4k:text-5xl text-cream leading-relaxed font-light cursor-default">
          {isSuccess
            ? "Vérifiez vos emails : un message contenant vos instructions de récupération vient d'être envoyé."
            : "Veuillez renseigner votre adresse email pour que l'on vous retourne un mot de passe temporaire."}
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-6 tablet:space-y-8 laptop:space-y-10 desktop:space-y-12 2k:space-y-14 ultrawide:space-y-16 4k:space-y-24 animate-in fade-in zoom-in duration-500">
          {/* CARTE DE SUCCÈS : On adapte l'icône à CHAQUE étape */}
          <div className="flex items-center gap-4 desktop:gap-6 2k:gap-8 4k:gap-14 p-5 tablet:p-6 laptop:p-8 desktop:p-10 2k:p-12 ultrawide:p-14 4k:p-20 rounded-xl bg-blue/10 border border-blue/20 text-cream">
            <div className="shrink-0 text-blue">
              <div className="laptop:hidden">
                <CheckCircle2 size={24} />
              </div>
              <div className="hidden laptop:block desktop:hidden">
                <CheckCircle2 size={32} />
              </div>
              <div className="hidden desktop:block 2k:hidden">
                <CheckCircle2 size={40} />
              </div>
              <div className="hidden 2k:block ultrawide:hidden">
                <CheckCircle2 size={56} />
              </div>
              <div className="hidden ultrawide:block 4k:hidden">
                <CheckCircle2 size={72} />
              </div>
              <div className="hidden 4k:block">
                <CheckCircle2 size={110} />
              </div>
            </div>
            <p className="text-xs tablet:text-sm laptop:text-lg desktop:text-xl 2k:text-3xl ultrawide:text-4xl 4k:text-6xl cursor-default leading-snug">
              Code envoyé avec succès à{" "}
              <strong className="text-blue font-semibold">{email}</strong>.
            </p>
          </div>

          <p className="text-cream/60 text-center text-[10px] tablet:text-sm laptop:text-base desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-5xl italic cursor-default">
            Redirection automatique dans{" "}
            <span className="text-blue font-bold">{countdown}</span> secondes...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 tablet:gap-8 laptop:gap-10 desktop:gap-12 2k:gap-14 ultrawide:gap-16 4k:gap-24"
        >
          <FloatingInput
            id="email"
            type="email"
            label="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />

          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-2 w-full 
            /* Hauteurs ajustées pour matcher l'input */
            py-4 tablet:py-5 laptop:py-5 desktop:py-6 2k:py-7 ultrawide:py-8 4k:py-14 
            text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-2xl ultrawide:text-2xl 4k:text-4xl 
            uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-4xl 
            overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:opacity-70"
          >
            <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
            <span className="relative flex items-center justify-center gap-3 desktop:gap-5 4k:gap-10 z-10">
              {isPending ? "Envoi..." : "Recevoir le code"}
              {!isPending && (
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              )}
            </span>
          </button>
        </form>
      )}
    </>
  );
}
