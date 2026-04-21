"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { updateVitrineTexts, VitrineData } from "../../actions/updateVitrine";
import { FloatingInput } from "@/app/_components/FloatingInput";
import { FloatingTextarea } from "@/app/_components/FloatingTextarea";
import { Capabilities } from "@/app/lib/capabilities";

type Props = {
  initialData: VitrineData | null;
  vitrineFields: Capabilities["vitrineFields"];
};

const VitrineClient = ({ initialData, vitrineFields }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rowWidth = "w-[90%] tablet:w-[80%] laptop:w-full";
  const rightMargin = "laptop:mr-[0%] desktop:mr-[0%] 2k:mr-[3%] 4k:mr-[0%]";
  const sectionSpacing =
    "gap-10 laptop:gap-12 desktop:gap-14 2k:gap-16 4k:gap-24";
  const separatorPadding = "pt-10 laptop:pt-12 desktop:pt-14 2k:pt-16 4k:pt-24";

  // Cleanup du timer si le composant se démonte avant les 3 secondes
  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(
      formData.entries(),
    ) as unknown as VitrineData;

    startTransition(async () => {
      const result = await updateVitrineTexts(data);
      setStatus(result.success ? "success" : "error");

      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setStatus("idle"), 3000);
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* HEADER FIXE */}
      <div className="flex flex-col shrink-0 gap-1 tablet:gap-2 desktop:gap-4 4k:gap-8 mb-8 tablet:mb-12 laptop:mb-10 px-4 tablet:px-6 laptop:px-0 w-full">
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
          Configuration des textes de la vitrine
        </h1>
      </div>

      {/* CONTENU DÉFILANT */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col items-center laptop:items-stretch w-full gap-0 pb-20 overflow-y-auto no-scrollbar cursor-default"
      >
        <div
          className={`flex flex-col laptop:flex-row w-full ${rowWidth} laptop:items-start px-4 tablet:px-8 laptop:px-0`}
        >
          {/* COLONNE GAUCHE */}
          <div
            className={`flex flex-col flex-1 ${sectionSpacing} laptop:pr-10 desktop:pr-14 2k:pr-20`}
          >
            {/* Section Hero */}
            <div className={`flex flex-col ${sectionSpacing}`}>
              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                Textes d&apos;accueil : Le nom et la phrase qui définissent
                votre univers dès l&apos;arrivée.
              </p>
              <div className="flex flex-col gap-4 w-full">
                {vitrineFields.heroSubtitle && (
                  <FloatingInput
                    name="heroSubtitle"
                    label="Sous-titre"
                    defaultValue={initialData?.heroSubtitle ?? ""}
                  />
                )}
                <FloatingInput
                  name="heroName"
                  label="Nom affiché"
                  defaultValue={initialData?.heroName ?? ""}
                />
                <FloatingInput
                  name="heroTagline"
                  label="Phrase d'accroche"
                  defaultValue={initialData?.heroTagline ?? ""}
                />
              </div>
            </div>

            {/* Section Bio */}
            <div
              className={`flex flex-col ${sectionSpacing} border-t border-cream/10 ${separatorPadding}`}
            >
              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                Présentation : Un titre fort et deux paragraphes pour vous
                raconter dans la page About.
              </p>
              <div className="flex flex-col gap-4 w-full">
                {vitrineFields.bioTitle && (
                  <FloatingInput
                    name="bioTitle"
                    label="Titre Bio"
                    className="font-caveat"
                    defaultValue={initialData?.bioTitle ?? ""}
                  />
                )}
                <FloatingTextarea
                  name="bioParagraph1"
                  label="Paragraphe 1"
                  rows={4}
                  defaultValue={initialData?.bioParagraph1 ?? ""}
                />
                <FloatingTextarea
                  name="bioParagraph2"
                  label="Paragraphe 2"
                  rows={4}
                  defaultValue={initialData?.bioParagraph2 ?? ""}
                />
              </div>
            </div>
          </div>

          {/* SÉPARATEUR */}
          <div className="w-full h-px my-10 laptop:my-0 laptop:w-px laptop:h-auto laptop:self-stretch bg-cream/10 shrink-0" />

          {/* COLONNE DROITE */}
          <div
            className={`flex flex-col flex-1 ${sectionSpacing} laptop:pl-10 desktop:pl-14 2k:pl-20`}
          >
            {/* Section Story */}
            {vitrineFields.story && (
              <div className={`flex flex-col ${sectionSpacing}`}>
                <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                  Récit : Deux blocs de texte pour approfondir votre parcours et
                  votre passion.
                </p>
                <div className="flex flex-col gap-4 w-full">
                  <FloatingTextarea
                    name="storyParagraph1"
                    label="Premier bloc d'histoire"
                    rows={6}
                    defaultValue={initialData?.storyParagraph1 ?? ""}
                  />
                  <FloatingTextarea
                    name="storyParagraph2"
                    label="Second bloc d'histoire"
                    rows={6}
                    defaultValue={initialData?.storyParagraph2 ?? ""}
                  />
                </div>
              </div>
            )}

            {/* Section Citation */}
            {vitrineFields.darkQuote && (
              <div
                className={`flex flex-col ${sectionSpacing} border-t border-cream/10 ${separatorPadding}`}
              >
                <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                  Mise en avant : Une citation qui résonne avec votre vision de
                  la photographie.
                </p>
                <div className="flex flex-col gap-4 w-full">
                  <FloatingTextarea
                    name="darkQuote"
                    label="La Citation"
                    rows={3}
                    defaultValue={initialData?.darkQuote ?? ""}
                  />
                  <FloatingInput
                    name="darkQuoteAuthor"
                    label="Auteur"
                    defaultValue={initialData?.darkQuoteAuthor ?? ""}
                  />
                </div>
              </div>
            )}

            {/* Section SEO */}
            <div
              className={`flex flex-col ${sectionSpacing} border-t border-cream/10 ${separatorPadding}`}
            >
              <p className="italic font-light text-cream/60 text-sm tablet:text-base laptop:text-[14px] desktop:text-base 2k:text-xl 4k:text-4xl leading-relaxed">
                Référencement (SEO) : Ces textes n&apos;apparaissent pas sur le
                site, mais sont affichés par Google et lors du partage de votre
                lien.
              </p>
              <div className="flex flex-col gap-4 w-full">
                <FloatingInput
                  name="seoTitle"
                  label="Titre SEO (ex: Jeanne Doe | Photographe)"
                  defaultValue={initialData?.seoTitle ?? ""}
                />
                {/* Nouveau champ Localité */}
                <FloatingInput
                  name="seoLocation"
                  label="Ville ou Région (ex: Lyon, Annecy, Rhône-Alpes)"
                  defaultValue={initialData?.seoLocation ?? ""}
                />
                <FloatingTextarea
                  name="seoDescription"
                  label="Description courte..."
                  rows={3}
                  defaultValue={initialData?.seoDescription ?? ""}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOUTON SUBMIT */}
        <button
          type="submit"
          disabled={isPending}
          className={`group relative mt-16 w-[90%] tablet:w-[60%] laptop:w-max laptop:px-10 desktop:px-14 2k:px-18 4k:px-30 laptop:self-end ${rightMargin} flex items-center justify-center py-4 tablet:py-5 laptop:py-6 desktop:py-7 2k:py-9 4k:py-12 text-[9px] tablet:text-[12px] laptop:text-[11px] desktop:text-xs 2k:text-base 4k:text-2xl uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] disabled:opacity-70 cursor-pointer whitespace-nowrap`}
        >
          <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
          <span className="relative z-10 flex items-center justify-center gap-3 desktop:gap-5 4k:gap-10 leading-none">
            {isPending ? (
              "Sauvegarde..."
            ) : status === "success" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Modifications enregistrées
              </>
            ) : status === "error" ? (
              <>
                <XCircle className="w-4 h-4" />
                Erreur — réessaie
              </>
            ) : (
              <>
                Enregistrer les modifications
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
};

export default VitrineClient;
