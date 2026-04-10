"use client";

import { useActionState } from "react";
import {
  sendContactEmail,
  type ContactFormState,
} from "@/app/actions/contact";

const initialState: ContactFormState = { success: false };

// Styles partagés pour les inputs glassmorphism de la landing
const inputClass =
  "w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-[#558b8b]/60 transition-colors";

export function LandingContactForm() {
  const [state, formAction, isPending] = useActionState(
    sendContactEmail,
    initialState
  );

  if (state.success) {
    return (
      <div className="text-center py-12">
        <div className="text-[#558b8b] text-4xl mb-4">✓</div>
        <p className="text-white/80 text-lg font-medium">Message envoyé !</p>
        <p className="text-white/40 text-sm mt-2">
          Je reviens vers vous sous 24h.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {/* Ligne Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Prénom / Nom"
          required
          className={inputClass}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className={inputClass}
        />
      </div>

      {/* Sujet */}
      <input
        type="text"
        name="subject"
        placeholder="Sujet"
        required
        className={inputClass}
      />

      {/* Message */}
      <textarea
        name="message"
        placeholder="Message..."
        required
        rows={5}
        className={`${inputClass} resize-none`}
      />

      {/* Erreur */}
      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-white/90 text-[#080808] rounded-xl font-bold text-sm tracking-tight hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Envoi en cours..." : "Envoyer →"}
      </button>
    </form>
  );
}
