"use client";

import { useActionState } from "react";
import Image from "next/image";
import { sendContactEmail, type ContactFormState } from "@/app/actions/contact";

export default function SupportPage() {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(sendContactEmail, { success: false });

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-[#0a0a0a] px-6 tablet:px-16 overflow-hidden">
      {/* Fond */}
      <Image
        src="/contactImage.webp"
        alt="image de fond"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Blobs décoratifs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 tablet:w-96 tablet:h-96 rounded-full bg-blue/20 blur-[80px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 tablet:w-96 tablet:h-96 rounded-full bg-blue/15 blur-[100px] pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-cream/5 blur-[60px] pointer-events-none z-10" />

      {/* Fenêtre glass */}
      <div className="glass-card relative z-20 w-full max-w-lg tablet:max-w-xl laptop:max-w-2xl 2k:max-w-3xl rounded-2xl p-8 tablet:p-12 2k:p-16">
        <div className="mb-8 tablet:mb-10">
          <p className="text-[10px] tablet:text-xs uppercase tracking-[0.3em] text-blue font-medium mb-2">
            Besoin d&apos;aide ?
          </p>
          <h2 className="text-2xl tablet:text-4xl font-bold text-cream leading-tight">
            Contacter le support
          </h2>
        </div>

        <form action={formAction} className="flex flex-col gap-5 tablet:gap-6">
          {/* Champ phone caché — requis par l'action */}
          <input type="hidden" name="phone" value="" />

          <input
            name="name"
            type="text"
            placeholder="Votre nom"
            required
            className="glass-input w-full p-4 rounded-xl text-sm text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
          />
          <input
            name="email"
            type="email"
            placeholder="Votre email"
            required
            className="glass-input w-full p-4 rounded-xl text-sm text-cream placeholder:text-cream/30 outline-none focus:border-blue transition-colors"
          />
          <textarea
            name="message"
            placeholder="Décrivez votre problème..."
            required
            className="glass-input w-full p-4 rounded-xl text-sm text-cream placeholder:text-cream/30 min-h-40 resize-none outline-none focus:border-blue transition-colors"
          />

          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-2 w-full py-4 tablet:py-5 text-xs tablet:text-sm uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:opacity-50 cursor-pointer"
          >
            <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
            <span className="relative z-10">
              {isPending ? "Envoi..." : "Envoyer →"}
            </span>
          </button>

          {state.error && (
            <p className="text-red-400 text-sm text-center">{state.error}</p>
          )}
          {state.success && (
            <p className="text-green-400 text-sm text-center font-bold">
              Message envoyé ! On vous répond rapidement.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
