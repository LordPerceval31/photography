"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import type { ThemeFonts } from "@/app/[domain]/themes/fonts";

type Props = {
  emailjsServiceId: string | null;
  emailjsTemplateId: string | null;
  emailjsPublicKey: string | null;
  fonts: ThemeFonts;
};

type Fields = { nom: string; email: string; message: string };
type Errors = Partial<Fields>;

const ContactForm = ({
  emailjsServiceId,
  emailjsTemplateId,
  emailjsPublicKey,
  fonts,
}: Props) => {
  const [fields, setFields] = useState<Fields>({
    nom: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const validate = (): boolean => {
    const e: Errors = {};
    if (!fields.nom.trim()) e.nom = "Requis";
    if (!fields.email.trim()) e.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      e.email = "Email invalide";
    if (!fields.message.trim()) e.message = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFields((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof Errors])
      setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || status === "sending") return;
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        fields,
        emailjsPublicKey,
      );
      setStatus("sent");
      setFields({ nom: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <p
        className="text-lg tablet:text-lg laptop:text-xl desktop:text-2xl 2k:text-3xl 4k:text-4xl tracking-widest uppercase opacity-60"
        style={{ fontFamily: fonts.body }}
      >
        Message envoyé —
      </p>
    );
  }

  const inputClass =
    "w-full bg-transparent border-b border-(--color-muted)/40 py-3 text-(--color-text) placeholder:text-(--color-muted)/50 focus:outline-none focus:border-(--color-primary) transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      style={{ fontFamily: fonts.body }}
    >
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
        <div className="text-md tablet:text-lg laptop:text-lg desktop:text-xl 2k:text-2xl 4k:text-4xl">
          <input
            name="nom"
            placeholder="Nom"
            value={fields.nom}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.nom && (
            <p className="mt-1 text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-2xl ultrawide:text-2xl 4k:text-4xl text-(--color-secondary) opacity-80">
              {errors.nom}
            </p>
          )}
        </div>
        <div className="text-md tablet:text-lg laptop:text-lg desktop:text-xl 2k:text-2xl 4k:text-4xl">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={fields.email}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.email && (
            <p className="mt-1 text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-2xl ultrawide:text-2xl 4k:text-4xl text-(--color-secondary) opacity-80">
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div className="text-md tablet:text-lg laptop:text-lg desktop:text-xl 2k:text-2xl 4k:text-4xl">
        <textarea
          name="message"
          placeholder="Message"
          rows={4}
          value={fields.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
        {errors.message && (
          <p className="mt-1 text-xs tablet:text-sm laptop:text-base desktop:text-lg 2k:text-2xl ultrawide:text-2xl 4k:text-4xl text-(--color-secondary) opacity-80">
            {errors.message}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-8 py-3 border border-(--color-primary) text-(--color-primary) text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl tracking-widest uppercase hover:bg-(--color-primary) hover:text-(--color-bg) transition-all duration-300 disabled:opacity-40 cursor-pointer"
        >
          {status === "sending" ? "Envoi…" : "Envoyer"}
        </button>
        {status === "error" && (
          <p className="text-sm text-(--color-secondary) opacity-80">
            Erreur — vérifiez la config EmailJS
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
