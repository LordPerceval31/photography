"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import Image from "next/image";

type FormFields = {
  nom: string;
  email: string;
  telephone: string;
  message: string;
};

type FormErrors = Partial<FormFields>;

const ContactSection = () => {
  const [fields, setFields] = useState<FormFields>({
    nom: "",
    email: "",
    telephone: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [cooldown, setCooldown] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fields.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!fields.email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      newErrors.email = "L'email n'est pas valide.";
    }
    if (!fields.message.trim()) newErrors.message = "Le message est requis.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || cooldown) return;

    setFormState("submitting");

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          nom: fields.nom,
          email: fields.email,
          telephone: fields.telephone,
          message: fields.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );

      setFields({ nom: "", email: "", telephone: "", message: "" });
      setFormState("success");

      setCooldown(true);
      setTimeout(() => {
        setCooldown(false);
        setFormState("idle");
      }, 60000);
    } catch (error) {
      console.error("Erreur EmailJS :", error);
      setFormState("error");
      setTimeout(() => setFormState("idle"), 5000);
    }
  };

  const glassCard =
    "backdrop-blur-[20px] border border-cream/20 bg-cream/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]";

  const glassInput =
    "backdrop-blur-[20px] border border-cream/20 bg-cream/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]";

  return (
    <section
      data-theme="dark"
      className="relative flex items-center justify-center h-screen bg-cream px-6 tablet:px-16 py-24 overflow-hidden"
    >
      <Image
        src="/contactImage.webp"
        alt="image de contact par default"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-[5]"></div>

      {/* -- Blobs décoratifs pour la profondeur glassmorphism -- */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/20 blur-[80px] 4k:blur-[160px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 tablet:w-96 tablet:h-96 4k:w-175 4k:h-175 rounded-full bg-blue/15 blur-[100px] 4k:blur-[180px] pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 4k:w-90 4k:h-90 rounded-full bg-cream/5 blur-[60px] 4k:blur-[130px] pointer-events-none z-10" />

      {/* -- Carte formulaire -- */}
      <div
        className={`${glassCard} relative z-20 w-full max-w-lg tablet:max-w-xl laptop:max-w-2xl 2k:max-w-3xl 4k:max-w-6xl rounded-2xl p-8 tablet:p-12 2k:p-16 4k:p-24`}
      >
        {/* Titre */}
        <div className="mb-10 2k:mb-14 4k:mb-30">
          <p className="text-xs uppercase tracking-[0.3em] text-blue font-medium mb-2 2k:text-base 4k:text-3xl">
            Un projet ?
          </p>
          <h2 className="text-3xl tablet:text-4xl 2k:text-5xl 4k:text-8xl font-bold text-cream leading-tight">
            Travaillons ensemble
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 2k:gap-8 4k:gap-16"
        >
          <FloatingField
            id="nom"
            name="nom"
            label="Nom complet"
            type="text"
            value={fields.nom}
            error={errors.nom}
            onChange={handleChange}
            glassInput={glassInput}
          />

          <FloatingField
            id="email"
            name="email"
            label="Adresse email"
            type="email"
            value={fields.email}
            error={errors.email}
            onChange={handleChange}
            glassInput={glassInput}
          />

          <FloatingField
            id="telephone"
            name="telephone"
            label="Téléphone (optionnel)"
            type="tel"
            value={fields.telephone}
            error={errors.telephone}
            onChange={handleChange}
            glassInput={glassInput}
          />

          <FloatingTextarea
            id="message"
            name="message"
            label="Votre message"
            value={fields.message}
            error={errors.message}
            onChange={handleChange}
            glassInput={glassInput}
          />

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={
              formState === "submitting" || formState === "success" || cooldown
            }
            className="group relative mt-2 w-full py-4 2k:py-5 4k:py-12 text-sm 2k:text-base 4k:text-3xl uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(44,44,44,0.25)] disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
            <span className="relative flex items-center justify-center gap-3">
              {formState === "idle" && (
                <>
                  Envoyer le message{" "}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
              {formState === "submitting" && "Envoi en cours..."}
              {formState === "success" && "✦ Message envoyé avec succès"}
              {formState === "error" && "Échec de l'envoi — réessayez"}
            </span>
          </button>
        </form>
      </div>
    </section>
  );
};

// --- Composant interne : champ input avec label flottant ---
type FieldProps = {
  id: string;
  name: string;
  label: string;
  type: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  glassInput: string;
};

const FloatingField = ({
  id,
  name,
  label,
  type,
  value,
  error,
  onChange,
  glassInput,
}: FieldProps) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={type}
      placeholder=" "
      value={value}
      onChange={onChange}
      className={`
        peer w-full px-4 pt-6 pb-2 2k:px-5 2k:pt-7 2k:pb-3 4k:px-12 4k:pt-14 4k:pb-6
        rounded-xl text-cream text-xl 2k:text-xl 4k:text-5xl
        outline-none transition-all duration-200
        focus:border-blue focus:shadow-[0_0_0_1px_#558b8b]
        ${glassInput}
        ${error ? "border-red-400" : ""}
      `}
    />
    <label
      htmlFor={id}
      className="
        floating-label
        absolute left-4 2k:left-5 4k:left-10 top-4 2k:top-5 4k:top-9
        text-cream/50 text-xl 2k:text-xl 4k:text-4xl
        transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm 4k:peer-placeholder-shown:text-3xl peer-placeholder-shown:text-cream/50
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue
        peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-cream/60
      "
    >
      {label}
    </label>
    {error && (
      <p className="mt-1 ml-1 text-xs 4k:text-xl text-red-400">{error}</p>
    )}
  </div>
);

// --- Composant interne : textarea avec label flottant ---
type TextareaProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  glassInput: string;
};

const FloatingTextarea = ({
  id,
  name,
  label,
  value,
  error,
  onChange,
  glassInput,
}: TextareaProps) => (
  <div className="relative">
    <textarea
      id={id}
      name={name}
      placeholder=" "
      value={value}
      onChange={onChange}
      rows={5}
      className={`
        peer w-full px-4 pt-6 pb-2 2k:px-5 2k:pt-7 2k:pb-3 4k:px-8 4k:pt-10 4k:pb-4
        rounded-xl text-cream text-xl 2k:text-xl 4k:text-4xl
        outline-none transition-all duration-200 resize-none
        focus:border-blue focus:shadow-[0_0_0_1px_#558b8b]
        ${glassInput}
        ${error ? "border-red-400" : ""}
      `}
    />
    <label
      htmlFor={id}
      className="
        floating-label
        absolute left-4 2k:left-5 4k:left-8 top-4 2k:top-5 4k:top-6
        text-cream/50 text-xl 2k:text-xl 4k:text-2xl
        transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm 4k:peer-placeholder-shown:text-3xl peer-placeholder-shown:text-cream/50
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue
        peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-cream/60
      "
    >
      {label}
    </label>
    {error && (
      <p className="mt-1 ml-1 text-xs 4k:text-xl text-red-400">{error}</p>
    )}
  </div>
);

export default ContactSection;
