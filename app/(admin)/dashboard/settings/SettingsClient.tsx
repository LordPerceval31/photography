"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import {
  updateCloudinaryCredentials,
  updateEmail,
  updateEmailJsCredentials,
  updatePassword,
} from "../../actions/settings";
import { FloatingInput } from "@/app/_components/FloatingInput";

type User = {
  email: string;
  cloudinaryName: string | null;
  cloudinaryKey: string | null;
  cloudinarySecret: string | null;
  emailjsServiceId: string | null;
  emailjsTemplateId: string | null;
  emailjsPublicKey: string | null;
};

type SectionStatus = "idle" | "success" | "error";

// Bouton submit réutilisé dans chaque section
const SubmitButton = ({
  pending,
  status,
  label,
}: {
  pending: boolean;
  status: SectionStatus;
  label: string;
}) => {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative self-start flex items-center justify-center
        py-3 px-8 tablet:py-4 tablet:px-10 2k:py-5 2k:px-14 4k:py-8 4k:px-20
        text-[9px] tablet:text-[11px] laptop:text-[11px] desktop:text-xs 2k:text-base 4k:text-2xl
        uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-3xl
        overflow-hidden transition-all duration-300
        hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:opacity-70 cursor-pointer whitespace-nowrap"
    >
      <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
      <span className="relative z-10 flex items-center gap-2 desktop:gap-3 4k:gap-6 leading-none">
        {pending ? (
          "Sauvegarde..."
        ) : status === "success" ? (
          <>
            <CheckCircle className="w-3 h-3 tablet:w-4 tablet:h-4 4k:w-8 4k:h-8" />
            Enregistré
          </>
        ) : status === "error" ? (
          <>
            <XCircle className="w-3 h-3 tablet:w-4 tablet:h-4 4k:w-8 4k:h-8" />
            Erreur — réessaie
          </>
        ) : (
          <>
            {label}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </>
        )}
      </span>
    </button>
  );
};

// Hook pour gérer status + auto-reset à 3s
const useFormStatus = () => {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const submit = (
    action: () => Promise<{ success?: boolean; error?: string } | undefined>,
  ) => {
    startTransition(async () => {
      const result = await action();
      if (result?.success) {
        setStatus("success");
        setErrorMessage("");
      } else {
        setStatus("error");
        setErrorMessage(result?.error ?? "Une erreur est survenue");
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus("idle"), 4000);
    });
  };

  return { isPending, status, errorMessage, submit };
};

const SettingsClient = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isConfigured, setIsConfigured] = useState(
    !!user.cloudinaryName && !!user.cloudinaryKey && !!user.cloudinarySecret,
  );

  const cloudinary = useFormStatus();
  const emailjs = useFormStatus();
  const email = useFormStatus();
  const password = useFormStatus();

  const [isEmailJsConfigured, setIsEmailJsConfigured] = useState(
    !!user.emailjsServiceId &&
      !!user.emailjsTemplateId &&
      !!user.emailjsPublicKey,
  );

  const sectionSpacing = "gap-6 tablet:gap-8 2k:gap-10 4k:gap-16";
  const rowWidth = "w-[90%] tablet:w-[80%] laptop:w-full";
  const separatorMargin =
    "my-4 tablet:my-6 laptop:my-8 desktop:my-8 2k:my-20 4k:my-24";

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* HEADER FIXE */}
      <div className="flex flex-col shrink-0 gap-1 tablet:gap-2 desktop:gap-4 4k:gap-8 mb-8 tablet:mb-12 laptop:mb-10 px-4 tablet:px-6 laptop:px-0">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-cream/50 hover:text-cream transition-colors w-max"
        >
          <ArrowLeft className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-4 desktop:w-4 desktop:h-5 2k:w-6 2k:h-6 ultrawide:w-8 ultrawide:h-8 4k:w-10 4k:h-10 transition-transform group-hover:-translate-x-1" />
          <span className="uppercase tracking-widest text-[8px] tablet:text-[10px] laptop:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl font-medium cursor-pointer">
            Retour au tableau de bord
          </span>
        </Link>
        <h1
          className="font-bold text-cream tracking-wide text-center cursor-default laptop:self-center
          w-[90%] tablet:w-[80%] laptop:w-[70%]
          text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl 2k:text-4xl ultrawide:text-4xl 4k:text-7xl
          laptop:mb-6 desktop:mb-8 2k:mb-12 ultrawide:mb-14 4k:mb-20"
        >
          Paramètres
        </h1>
      </div>

      {/* CONTENU DÉFILANT */}
      <div className="flex-1 flex flex-col items-center laptop:items-stretch w-full overflow-y-auto no-scrollbar pb-20 px-4 tablet:px-6 laptop:px-0">
        <div className={`flex flex-col ${rowWidth} gap-0`}>
          {/* ── SECTION EMAIL ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              email.submit(() => updateEmail(fd));
            }}
            className={`flex flex-col ${sectionSpacing}`}
          >
            <div className="flex flex-col gap-2 tablet:gap-3">
              <h2 className="text-base tablet:text-lg laptop:text-xl desktop:text-2xl 2k:text-3xl 4k:text-5xl font-semibold text-cream tracking-wide">
                Adresse email
              </h2>
              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                Email actuel :{" "}
                <span className="not-italic text-cream/80">{user.email}</span>
              </p>
            </div>

            <div className="flex flex-col gap-4 2k:gap-6 4k:gap-10 w-full laptop:max-w-lg desktop:max-w-xl 4k:max-w-5xl">
              <FloatingInput
                name="newEmail"
                label="Nouvel email"
                type="email"
                autoComplete="email"
              />
              <FloatingInput
                name="currentPassword"
                label="Mot de passe actuel (confirmation)"
                type="password"
                autoComplete="current-password"
              />
            </div>

            {email.status === "error" && (
              <p className="text-red-400 text-xs tablet:text-sm 4k:text-2xl">
                {email.errorMessage}
              </p>
            )}

            <SubmitButton
              pending={email.isPending}
              status={email.status}
              label="Changer l'email"
            />
          </form>

          {/* ── SÉPARATEUR ── */}
          <div className={`w-full h-px bg-cream/10 ${separatorMargin}`} />

          {/* ── SECTION MOT DE PASSE ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              password.submit(() => updatePassword(fd));
            }}
            className={`flex flex-col ${sectionSpacing}`}
          >
            <div className="flex flex-col gap-2 tablet:gap-3">
              <h2 className="text-base tablet:text-lg laptop:text-xl desktop:text-2xl 2k:text-3xl 4k:text-5xl font-semibold text-cream tracking-wide">
                Mot de passe
              </h2>
              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                8 caractères minimum, avec une lettre, un chiffre et un
                caractère spécial.
              </p>
            </div>

            <div className="flex flex-col gap-4 2k:gap-6 4k:gap-10 w-full laptop:max-w-lg desktop:max-w-xl 4k:max-w-5xl">
              <FloatingInput
                name="currentPassword"
                label="Mot de passe actuel"
                type="password"
                autoComplete="current-password"
              />
              <FloatingInput
                name="newPassword"
                label="Nouveau mot de passe"
                type="password"
                autoComplete="new-password"
              />
              <FloatingInput
                name="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                type="password"
                autoComplete="new-password"
              />
            </div>

            {password.status === "error" && (
              <p className="text-red-400 text-xs tablet:text-sm 4k:text-2xl">
                {password.errorMessage}
              </p>
            )}

            <SubmitButton
              pending={password.isPending}
              status={password.status}
              label="Changer le mot de passe"
            />
          </form>

          {/* ── SÉPARATEUR ── */}
          <div className={`w-full h-px bg-cream/10 ${separatorMargin}`} />

          {/* ── SECTION TEMPLATES ── */}
          <div className={`flex flex-col ${sectionSpacing}`}>
            <div className="flex flex-col gap-2 tablet:gap-3">
              <h2 className="text-base tablet:text-lg laptop:text-xl desktop:text-2xl 2k:text-3xl 4k:text-5xl font-semibold text-cream tracking-wide">
                Gabaris
              </h2>
              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                Choisissez le design de votre vitrine parmi vos gabarits
                achetés.
              </p>
            </div>
            <Link
              href="/dashboard/templates"
              className="group relative self-start flex items-center justify-center
                py-3 px-8 tablet:py-4 tablet:px-10 2k:py-5 2k:px-14 4k:py-8 4k:px-20
                text-[9px] tablet:text-[11px] laptop:text-[11px] desktop:text-xs 2k:text-base 4k:text-2xl
                uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-3xl
                overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
            >
              <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
              <span className="relative z-10">Gérer mes gabarits</span>
            </Link>
          </div>

          {/* ── SÉPARATEUR ── */}
          <div className={`w-full h-px bg-cream/10 ${separatorMargin}`} />

          {/* ── SECTION CLOUDINARY ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              cloudinary.submit(async () => {
                const result = await updateCloudinaryCredentials(fd);
                if (result?.success) {
                  setIsConfigured(true);
                  router.refresh();
                }
                return result;
              });
            }}
            className={`flex flex-col ${sectionSpacing}`}
          >
            <div className="flex flex-col gap-3 tablet:gap-4">
              <div className="flex items-center gap-3 tablet:gap-4 4k:gap-8">
                <h2 className="text-base tablet:text-lg laptop:text-xl desktop:text-2xl 2k:text-3xl 4k:text-5xl font-semibold text-cream tracking-wide">
                  Cloudinary
                </h2>
                <span
                  className={`flex items-center gap-1.5 tablet:gap-2 4k:gap-4 px-2.5 py-1 4k:px-6 4k:py-2 rounded-full text-[9px] tablet:text-[10px] laptop:text-xs 4k:text-xl font-semibold uppercase tracking-wider
                    ${
                      isConfigured
                        ? "bg-green-500/15 text-green-400 border border-green-500/30"
                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 4k:w-3 4k:h-3 rounded-full ${isConfigured ? "bg-green-400" : "bg-red-400"}`}
                  />
                  {isConfigured ? "Configuré" : "Non configuré"}
                </span>
              </div>

              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                Cloudinary héberge toutes vos photos. Créez un compte gratuit,
                puis copiez vos identifiants depuis{" "}
                <a
                  href="https://console.cloudinary.com/settings/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue underline underline-offset-2 hover:text-cream transition-colors inline-flex items-center gap-1"
                >
                  console.cloudinary.com
                  <ExternalLink className="w-3 h-3 tablet:w-3.5 tablet:h-3.5 4k:w-6 4k:h-6 inline" />
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-4 2k:gap-6 4k:gap-10 w-full laptop:max-w-lg desktop:max-w-xl 4k:max-w-5xl">
              <FloatingInput
                name="cloudinaryName"
                label="Cloud Name"
                defaultValue=""
                autoComplete="off"
              />
              <FloatingInput
                name="cloudinaryKey"
                label="API Key"
                defaultValue=""
                autoComplete="off"
              />
              <FloatingInput
                name="cloudinarySecret"
                label="API Secret"
                type="password"
                defaultValue=""
                autoComplete="off"
              />
            </div>

            {cloudinary.status === "error" && (
              <p className="text-red-400 text-xs tablet:text-sm 4k:text-2xl">
                {cloudinary.errorMessage}
              </p>
            )}

            <SubmitButton
              pending={cloudinary.isPending}
              status={cloudinary.status}
              label="Enregistrer"
            />
          </form>

          {/* ── SÉPARATEUR ── */}
          <div className={`w-full h-px bg-cream/10 ${separatorMargin}`} />

          {/* ── SECTION EMAILJS ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              emailjs.submit(async () => {
                const result = await updateEmailJsCredentials(fd);
                if (result?.success) {
                  setIsEmailJsConfigured(true);
                }
                return result;
              });
            }}
            className={`flex flex-col ${sectionSpacing}`}
          >
            <div className="flex flex-col gap-3 tablet:gap-4">
              <div className="flex items-center gap-3 tablet:gap-4 4k:gap-8">
                <h2 className="text-base tablet:text-lg laptop:text-xl desktop:text-2xl 2k:text-3xl 4k:text-5xl font-semibold text-cream tracking-wide">
                  EmailJS
                </h2>
                <span
                  className={`flex items-center gap-1.5 tablet:gap-2 4k:gap-4 px-2.5 py-1 4k:px-6 4k:py-2 rounded-full text-[9px] tablet:text-[10px] laptop:text-xs 4k:text-xl font-semibold uppercase tracking-wider
                    ${
                      isEmailJsConfigured
                        ? "bg-green-500/15 text-green-400 border border-green-500/30"
                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 4k:w-3 4k:h-3 rounded-full ${isEmailJsConfigured ? "bg-green-400" : "bg-red-400"}`}
                  />
                  {isEmailJsConfigured ? "Configuré" : "Non configuré"}
                </span>
              </div>

              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                EmailJS permet d&apos;envoyer des emails depuis le formulaire de
                contact. Créez un compte gratuit, puis copiez vos identifiants
                depuis{" "}
                <a
                  href="https://dashboard.emailjs.com/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue underline underline-offset-2 hover:text-cream transition-colors inline-flex items-center gap-1"
                >
                  dashboard.emailjs.com
                  <ExternalLink className="w-3 h-3 tablet:w-3.5 tablet:h-3.5 4k:w-6 4k:h-6 inline" />
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-5 2k:gap-7 4k:gap-12 w-full laptop:max-w-lg desktop:max-w-xl 4k:max-w-5xl">
              <div className="flex flex-col gap-1.5 2k:gap-2 4k:gap-4">
                <FloatingInput
                  name="emailjsServiceId"
                  label="Service ID"
                  defaultValue=""
                  autoComplete="off"
                />
                <p className="text-cream/40 text-[10px] tablet:text-xs 2k:text-base 4k:text-2xl pl-1">
                  Email Services (menu gauche) → cliquer sur votre service →
                  copier le Service ID
                </p>
              </div>
              <div className="flex flex-col gap-1.5 2k:gap-2 4k:gap-4 ">
                <FloatingInput
                  name="emailjsTemplateId"
                  label="Template ID"
                  defaultValue=""
                  autoComplete="off"
                />
                <p className="text-cream/40 text-[10px] tablet:text-xs 2k:text-base 4k:text-2xl pl-1">
                  Email Templates (menu gauche) → créer ou ouvrir un template →
                  Settings → copier le Template ID
                </p>
              </div>
              <div className="flex flex-col gap-1.5 2k:gap-2 4k:gap-4">
                <FloatingInput
                  name="emailjsPublicKey"
                  label="Public Key"
                  defaultValue=""
                  autoComplete="off"
                />
                <p className="text-cream/40 text-[10px] tablet:text-xs 2k:text-base 4k:text-2xl pl-1">
                  Account (menu gauche) → API Keys → copier la Public Key
                </p>
              </div>
            </div>

            {emailjs.status === "error" && (
              <p className="text-red-400 text-xs tablet:text-sm 4k:text-2xl">
                {emailjs.errorMessage}
              </p>
            )}

            <SubmitButton
              pending={emailjs.isPending}
              status={emailjs.status}
              label="Enregistrer"
            />
          </form>
        </div>
      </div>

      {/* Lien support */}
      <div className="mt-12 pt-8 border-t border-cream/10 flex justify-center">
        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-cream/40 hover:text-cream transition-colors text-[10px] tablet:text-xs 2k:text-sm uppercase tracking-widest"
        >
          <ExternalLink className="w-3 h-3" />
          Contacter le support
        </a>
      </div>
    </div>
  );
};

export default SettingsClient;
