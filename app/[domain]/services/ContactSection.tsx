"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import posthog from "posthog-js";

type FormFields = {
  nom: string;
  email: string;
  telephone: string;
  message: string;
};

type FormErrors = Partial<FormFields>;

type ContactSectionProps = {
  hasNoCards?: boolean;
  emailjsServiceId: string | null;
  emailjsTemplateId: string | null;
  emailjsPublicKey: string | null;
};

const ContactSection = ({
  hasNoCards = false,
  emailjsServiceId,
  emailjsTemplateId,
  emailjsPublicKey,
}: ContactSectionProps) => {
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
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
      setFormState("error");
      return;
    }

    setFormState("submitting");

    try {
      await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        {
          from_name: fields.nom,
          from_email: fields.email,
          from_phone: fields.telephone,
          message: fields.message,
        },
        emailjsPublicKey,
      );

      setFields({ nom: "", email: "", telephone: "", message: "" });
      setFormState("success");
      posthog.capture("contact_form_submitted", {
        has_phone: !!fields.telephone.trim(),
      });

      setCooldown(true);
      setTimeout(() => {
        setCooldown(false);
        setFormState("idle");
      }, 60000);
    } catch (error) {
      console.error("Erreur EmailJS :", error);
      setFormState("error");
      posthog.captureException(error);
      posthog.capture("contact_form_failed");
      setTimeout(() => setFormState("idle"), 5000);
    }
  };

  const glassCard =
    "backdrop-blur-[20px] border border-cream/20 bg-cream/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]";

  const glassInput =
    "backdrop-blur-[20px] border border-cream/20 bg-cream/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]";

  return (
    <section
      className={`relative flex items-center justify-center w-full px-6 tablet:px-16 z-10 laptop:min-h-screen ${
        hasNoCards ? "min-h-screen py-24 laptop:py-0" : "pb-24 laptop:pb-0"
      }`}
    >
      {/* -- Carte formulaire : h-[60vh] sur desktop pour le rendre plus compact -- */}
      <div
        className={`${glassCard} relative z-20 w-full max-w-lg tablet:max-w-xl laptop:max-w-none laptop:w-[80vh] laptop:h-[80vh] desktop:w-[60vh] desktop:h-[60vh] rounded-2xl p-8 tablet:p-12 laptop:p-[5vh] desktop:p-[3.5vh] flex flex-col`}
      >
        {/* Titre */}
        <div className="mb-10 tablet:mb-12 laptop:mb-[2vh] laptop:h-[10vh] desktop:mb-[1.5vh] desktop:h-[7.5vh]">
          <p className="text-xs tablet:text-sm laptop:text-[1.5vh] desktop:text-[1.1vh] uppercase tracking-[0.3em] text-blue font-medium mb-2 laptop:mb-[1vh] desktop:mb-[0.75vh]">
            Un projet ?
          </p>
          <h2 className="text-3xl tablet:text-4xl laptop:text-[4vh] desktop:text-[3vh] font-bold text-cream leading-tight">
            Travaillons ensemble
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 tablet:gap-8 laptop:gap-[2vh] desktop:gap-[1.5vh] grow laptop:justify-between"
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
            className="group relative mt-2 laptop:mt-0 w-full py-4 tablet:py-5 laptop:py-0 laptop:h-[8vh] desktop:h-[6vh] text-sm tablet:text-base laptop:text-[1.8vh] desktop:text-[1.3vh] uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(44,44,44,0.25)] disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
            <span className="relative flex items-center justify-center gap-3 laptop:gap-[1vh] desktop:gap-[0.75vh]">
              {formState === "idle" && (
                <>
                  Envoyer le message{" "}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
              {formState === "submitting" && "Envoi en cours..."}
              {formState === "success" && "✦ Message envoyé"}
              {formState === "error" && "Échec — réessayez"}
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
  <div className="relative laptop:h-[7vh] desktop:h-[5vh]">
    <input
      id={id}
      name={name}
      type={type}
      placeholder=" "
      value={value}
      onChange={onChange}
      className={`
        peer w-full h-full px-4 pt-6 pb-2 tablet:px-5 tablet:pt-7 tablet:pb-3
        laptop:px-[2vh] laptop:pt-[3vh] laptop:pb-[1vh]
        desktop:px-[1.5vh] desktop:pt-[2.2vh] desktop:pb-[0.8vh]
        rounded-xl text-cream text-xl laptop:text-[2vh] desktop:text-[1.5vh]
        outline-none transition-all duration-200
        focus:border-blue focus:shadow-[0_0_0_1px_#558b8b]
        ${glassInput}
        ${error ? "border-red-400" : ""}
      `}
    />
    <label
      htmlFor={id}
      className={`
        floating-label
        absolute left-4 top-4 tablet:left-5 tablet:top-5
        laptop:left-[2vh] laptop:top-[2.3vh]
        desktop:left-[1.5vh] desktop:top-[1.7vh]
        text-cream/50 text-xl laptop:text-[2vh] desktop:text-[1.5vh]
        transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-[2.1vh] peer-placeholder-shown:text-sm
        tablet:peer-placeholder-shown:top-[1.9vh] tablet:peer-placeholder-shown:text-[1.2vh]
        laptop:peer-placeholder-shown:top-[2vh] laptop:peer-placeholder-shown:text-[2vh]
        desktop:peer-placeholder-shown:top-[1.4vh] desktop:peer-placeholder-shown:text-[1.5vh]
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue
        laptop:peer-focus:top-[0.8vh] laptop:peer-focus:text-[1.2vh]
        desktop:peer-focus:top-[0.6vh] desktop:peer-focus:text-[0.9vh]
        peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-cream/60
        laptop:peer-not-placeholder-shown:top-[0.8vh] laptop:peer-not-placeholder-shown:text-[1.2vh]
        desktop:peer-not-placeholder-shown:top-[0.6vh] desktop:peer-not-placeholder-shown:text-[0.9vh]
      `}
    >
      {label}
    </label>
    {error && (
      <p className="absolute -bottom-5 laptop:-bottom-[2vh] desktop:-bottom-[1.5vh] left-1 laptop:left-[1vh] desktop:left-[0.8vh] text-xs laptop:text-[1.2vh] desktop:text-[0.9vh] text-red-400">
        {error}
      </p>
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
  <div className="relative laptop:h-[15vh] desktop:h-[11vh]">
    <textarea
      id={id}
      name={name}
      placeholder=" "
      value={value}
      onChange={onChange}
      className={`
        peer w-full h-full px-4 pt-6 pb-2 tablet:px-5 tablet:pt-7 tablet:pb-3
        laptop:px-[2vh] laptop:pt-[3vh] laptop:pb-[1vh]
        desktop:px-[1.5vh] desktop:pt-[2.2vh] desktop:pb-[0.8vh]
        rounded-xl text-cream text-xl laptop:text-[2vh] desktop:text-[1.5vh]
        outline-none transition-all duration-200 resize-none
        focus:border-blue focus:shadow-[0_0_0_1px_#558b8b]
        ${glassInput}
        ${error ? "border-red-400" : ""}
      `}
    />
    <label
      htmlFor={id}
      className={`
        floating-label
        absolute left-4 top-4 tablet:left-5 tablet:top-5
        laptop:left-[2vh] laptop:top-[2.3vh]
        desktop:left-[1.5vh] desktop:top-[1.7vh]
        text-cream/50 text-xl laptop:text-[2vh] desktop:text-[1.5vh]
        transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
        laptop:peer-placeholder-shown:top-[2.3vh] laptop:peer-placeholder-shown:text-[2vh]
        desktop:peer-placeholder-shown:top-[1.7vh] desktop:peer-placeholder-shown:text-[1.5vh]
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue
        laptop:peer-focus:top-[0.8vh] laptop:peer-focus:text-[1.2vh]
        desktop:peer-focus:top-[0.6vh] desktop:peer-focus:text-[0.9vh]
        peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-cream/60
        laptop:peer-not-placeholder-shown:top-[0.8vh] laptop:peer-not-placeholder-shown:text-[1.2vh]
        desktop:peer-not-placeholder-shown:top-[0.6vh] desktop:peer-not-placeholder-shown:text-[0.9vh]
      `}
    >
      {label}
    </label>
    {error && (
      <p className="absolute -bottom-5 laptop:-bottom-[2vh] desktop:-bottom-[1.5vh] left-1 laptop:left-[1vh] desktop:left-[0.8vh] text-xs laptop:text-[1.2vh] desktop:text-[0.9vh] text-red-400">
        {error}
      </p>
    )}
  </div>
);

export default ContactSection;
