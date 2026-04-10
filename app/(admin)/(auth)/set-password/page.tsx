"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import zxcvbn from "zxcvbn";
import { setPassword } from "../../actions/setPassword";
import { FloatingInput } from "@/app/_components/FloatingInput";

export const ResetPassword = () => {
  const [fields, setFields] = useState({ password: "", confirmedPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]> | undefined
  >(undefined);
  const [globalError, setGlobalError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      signOut({ callbackUrl: "/login", redirect: true });
    }
  }, [isSuccess, countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setFieldErrors(undefined);
    setGlobalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    if (fields.password !== fields.confirmedPassword) {
      setGlobalError("Les mots de passe ne correspondent pas");
      return;
    }

    const formData = new FormData();
    formData.append("password", fields.password);

    startTransition(async () => {
      try {
        const data = await setPassword(formData);
        if (data?.error) {
          setFieldErrors(data.error as Record<string, string[]>);
        } else if (data?.errorMessage) {
          setGlobalError(data.errorMessage);
        } else if (data?.success) {
          setIsSuccess(true);
        }
      } catch {
        setGlobalError(
          "Une erreur inattendue est survenue. Veuillez réessayer.",
        );
      }
    });
  };

  return (
    <>
      {/* EN-TÊTE */}
      <div className="mb-8 tablet:mb-10 laptop:mb-12 desktop:mb-14 2k:mb-16 ultrawide:mb-20 4k:mb-32">
        <p className="text-[10px] tablet:text-xs laptop:text-sm desktop:text-base 2k:text-lg ultrawide:text-xl 4k:text-3xl uppercase tracking-[0.3em] text-blue font-medium mb-2 tablet:mb-3 4k:mb-8 cursor-default">
          Bienvenue
        </p>
        <h2 className="text-3xl tablet:text-5xl laptop:text-3xl desktop:text-5xl 2k:text-6xl ultrawide:text-6xl 4k:text-7xl font-bold text-cream leading-tight cursor-default">
          Veuillez saisir votre mot de passe
        </h2>
      </div>

      {isSuccess ? (
        /* VUE SUCCÈS */
        <div className="space-y-6 tablet:space-y-8 laptop:space-y-10 4k:space-y-20 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center gap-4 tablet:gap-6 4k:gap-12 p-6 tablet:p-8 laptop:p-10 4k:p-24 rounded-xl bg-blue/10 border border-blue/20 text-cream text-center">
            <div className="text-blue">
              <div className="laptop:hidden">
                <CheckCircle2 size={40} />
              </div>
              <div className="hidden laptop:block desktop:hidden">
                <CheckCircle2 size={48} />
              </div>
              <div className="hidden desktop:block 2k:hidden">
                <CheckCircle2 size={60} />
              </div>
              <div className="hidden 2k:block ultrawide:hidden">
                <CheckCircle2 size={80} />
              </div>
              <div className="hidden ultrawide:block 4k:hidden">
                <CheckCircle2 size={100} />
              </div>
              <div className="hidden 4k:block">
                <CheckCircle2 size={160} />
              </div>
            </div>
            <p className="text-base tablet:text-lg laptop:text-xl desktop:text-2xl 2k:text-4xl ultrawide:text-5xl 4k:text-5xl font-medium cursor-default">
              Mot de passe créé avec succès !
            </p>
          </div>
          <p className="text-cream/60 text-center text-xs tablet:text-sm laptop:text-base 2k:text-xl ultrawide:text-2xl 4k:text-3xl italic cursor-default">
            Vous allez à présent être redirigé vers la page
            d&apos;identification dans{" "}
            <span className="text-blue font-bold">{countdown}</span> seconde
            {countdown > 1 ? "s" : ""}...
          </p>
        </div>
      ) : (
        /* FORMULAIRE */
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 tablet:gap-8 laptop:gap-10 desktop:gap-12 2k:gap-14 ultrawide:gap-16 4k:gap-24"
        >
          <div className="space-y-2 tablet:space-y-4 4k:space-y-10">
            <FloatingInput
              id="password"
              name="password"
              label="Mot de passe"
              type="password"
              value={fields.password}
              onChange={handleChange}
              error={fieldErrors?.password?.[0]}
            />
            <PasswordStrengthMeter password={fields.password} />
          </div>

          <FloatingInput
            id="confirmedPassword"
            name="confirmedPassword"
            label="Confirmer le mot de passe"
            type="password"
            value={fields.confirmedPassword}
            onChange={handleChange}
            error={fieldErrors?.confirmedPassword?.[0]}
          />

          {/* LISTE D'ERREURS DÉTAILLÉES */}
          {fieldErrors?.password && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 tablet:p-5 laptop:p-6 2k:p-8 4k:p-16 space-y-2 tablet:space-y-3 4k:space-y-8 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-red-400">
                <div className="laptop:hidden">
                  <AlertTriangle size={20} />
                </div>
                <div className="hidden laptop:block 4k:hidden">
                  <AlertTriangle size={24} />
                </div>
                <div className="hidden 4k:block">
                  <AlertTriangle size={48} />
                </div>
                <p className="text-sm tablet:text-base 2k:text-xl 4k:text-2xl font-medium">
                  Le mot de passe doit :
                </p>
              </div>
              <ul className="list-disc list-inside pl-1 text-[10px] tablet:text-xs laptop:text-sm 2k:text-lg 4k:text-2xl text-red-300/90 space-y-1 tablet:space-y-1.5 4k:space-y-4 font-light">
                {fieldErrors.password.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {globalError && (
            <p className="mt-1 ml-1 text-xs tablet:text-sm 2k:text-xl 4k:text-2xl text-red-400 font-medium">
              {globalError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-2 w-full 
            py-4 tablet:py-5 laptop:py-5 desktop:py-6 2k:py-7 ultrawide:py-8 4k:py-14 
            text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-2xl ultrawide:text-2xl 4k:text-3xl 
            uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-4xl 
            overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:opacity-70"
          >
            <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
            <span className="relative flex items-center justify-center gap-3 desktop:gap-5 4k:gap-10 z-10">
              {isPending ? "Traitement..." : "Créer mon mot de passe"}
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
};

// ============================================================================
// COMPOSANTS INTERNES (Adaptés aux breakpoints)
// ============================================================================

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  if (!password) return null;

  const testResult = zxcvbn(password);
  const score = testResult.score;

  const createPassStrength = () => {
    switch (score) {
      case 0:
      case 1:
        return { label: "Faible", color: "bg-red-400", width: "w-1/4" };
      case 2:
        return { label: "Moyen", color: "bg-yellow-400", width: "w-2/4" };
      case 3:
        return { label: "Fort", color: "bg-blue", width: "w-3/4" };
      case 4:
        return { label: "Très Fort", color: "bg-green-400", width: "w-full" };
      default:
        return { label: "", color: "bg-transparent", width: "w-0" };
    }
  };

  const strength = createPassStrength();

  return (
    <div className="mt-2 flex flex-col gap-2 4k:gap-6 transition-all duration-300 animate-in fade-in">
      <div className="flex justify-between items-center text-[10px] tablet:text-xs laptop:text-sm 2k:text-lg 4k:text-3xl text-cream/70">
        <span>Force du mot de passe</span>
        <span className="font-medium">{strength.label}</span>
      </div>
      <div className="h-1 tablet:h-1.5 2k:h-2 4k:h-6 w-full bg-cream/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} ${strength.width} transition-all duration-500 ease-out`}
        />
      </div>
      {testResult.feedback.warning && score < 3 && (
        <p className="text-[9px] tablet:text-[10px] laptop:text-xs 2k:text-base 4k:text-2xl text-yellow-400/80 italic">
          Astuce : {testResult.feedback.warning}
        </p>
      )}
    </div>
  );
};

export default ResetPassword;
