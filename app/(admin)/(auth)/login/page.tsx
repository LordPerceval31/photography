"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "../../actions/auth";
import { FloatingInput } from "@/app/_components/FloatingInput";

export const LoginPage = () => {
  const [fields, setFields] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData();
    formData.append("email", fields.email);
    formData.append("password", fields.password);

    startTransition(async () => {
      const data = await login(formData);
      if (data?.error) {
        setError(data.error);
      }
    });
  };

  return (
    <>
      {/* EN-TÊTE : Mobile First -> Desktop -> 2K/4K */}
      <div className="mb-8 tablet:mb-10 2k:mb-14 4k:mb-24">
        <p className="text-[10px] tablet:text-xs 2k:text-base 4k:text-3xl uppercase tracking-[0.3em] text-blue font-medium mb-2 cursor-default">
          Bienvenue
        </p>
        <h2 className="text-2xl tablet:text-4xl 2k:text-5xl 4k:text-7xl font-bold text-cream leading-tight cursor-default">
          Accédez à votre espace
        </h2>
      </div>

      {/* FORMULAIRE : Gaps progressifs */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 tablet:gap-6 2k:gap-8 4k:gap-16"
      >
        <div className="flex flex-col gap-4 tablet:gap-6 2k:gap-8 4k:gap-14">
          <FloatingInput
            id="email"
            name="email"
            label="Adresse email"
            type="email"
            value={fields.email}
            onChange={handleChange}
          />

          <FloatingInput
            id="password"
            name="password"
            label="Mot de passe"
            type="password"
            value={fields.password}
            onChange={handleChange}
          />
        </div>

        {/* LIEN MOT DE PASSE OUBLIÉ */}
        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-[10px] tablet:text-xs 2k:text-base 4k:text-3xl text-cream/60 hover:text-blue transition-colors duration-200 cursor-default"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* ERREUR */}
        {error && (
          <p className="mt-1 ml-1 text-xs tablet:text-sm 4k:text-2xl text-red-400 font-medium cursor-default">
            {error}
          </p>
        )}

        {/* BOUTON DE CONNEXION */}
        <button
          type="submit"
          disabled={isPending}
          className="group relative mt-2 w-full py-4 tablet:py-5 2k:py-6 4k:py-14 text-xs tablet:text-sm 2k:text-lg 4k:text-4xl uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {/* Effet de hover (Blue Slide) */}
          <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />

          <span className="relative flex items-center justify-center gap-3 z-10">
            {isPending ? (
              "Connexion..."
            ) : (
              <>
                Se connecter
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
};

export default LoginPage;
