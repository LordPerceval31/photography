"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { configureTemplate } from "@/app/(admin)/actions/templates";

const TEMPLATES_WITH_THEMES = ["one-page", "two-pages", "three-pages", "premium"];

const THEMES = [
  { slug: "default", name: "Classique" },
  { slug: "argentic", name: "Argentique" },
  { slug: "sepia", name: "Sépia" },
  { slug: "evenement", name: "Évènement" },
  { slug: "nature", name: "Nature" },
  { slug: "voyage", name: "Voyage" },
  { slug: "portrait", name: "Portrait" },
  { slug: "street", name: "Street" },
  { slug: "cinema", name: "Cinéma" },
  { slug: "premium", name: "Premium" },
] as const;

const PREMIUM_THEMES = new Set(["premium"]);

const getThemesForTemplate = (templateSlug: string) =>
  THEMES.filter((t) => templateSlug === "premium" || !PREMIUM_THEMES.has(t.slug));

type Template = {
  id: string;
  slug: string;
  name: string;
  price: number;
  previewUrl: string | null;
  isPurchased: boolean;
  isActive: boolean;
};

type Props = {
  templates: Template[];
  currentThemeSlug: string;
};

const TemplatesClient = ({ templates, currentThemeSlug }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [themes, setThemes] = useState<Record<string, string>>(
    () => Object.fromEntries(templates.map((t) => [t.id, currentThemeSlug]))
  );

  const handleActivate = (templateId: string) => {
    setActivatingId(templateId);
    startTransition(async () => {
      await configureTemplate(templateId, themes[templateId]);
      router.push("/dashboard");
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col shrink-0 gap-1 tablet:gap-2 mb-8 tablet:mb-12 px-4 tablet:px-6 laptop:px-0">
        <h1 className="font-bold text-cream tracking-wide text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl 2k:text-4xl 4k:text-6xl">
          Mes gabarits
        </h1>
        <p className="text-cream/50 text-sm tablet:text-base desktop:text-lg 2k:text-xl 4k:text-3xl">
          Choisissez le design de votre vitrine parmi vos gabarits achetés.
        </p>
      </div>

      {/* Liste de templates */}
      <div className="flex flex-col gap-3 tablet:gap-4 desktop:gap-5 2k:gap-6 4k:gap-10 px-4 tablet:px-6 laptop:px-0">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`flex items-center justify-between p-4 tablet:p-5 desktop:p-6 2k:p-8 4k:p-14 rounded-xl border transition-all ${
              template.isActive
                ? "border-blue shadow-[0_0_24px_0_rgba(59,130,246,0.15)] bg-blue/5"
                : "border-cream/10 bg-cream/5"
            }`}
          >
            {/* Nom + statut */}
            <div className="flex items-center gap-3 tablet:gap-4 2k:gap-6 4k:gap-10">
              <span className="font-semibold text-cream text-sm tablet:text-base desktop:text-lg 2k:text-xl 4k:text-3xl">
                {template.name}
              </span>
              {template.isActive && (
                <span className="flex items-center gap-1 tablet:gap-1.5 4k:gap-3 text-blue text-xs tablet:text-sm 2k:text-base 4k:text-2xl font-medium">
                  <CheckCircle className="w-3 h-3 tablet:w-4 tablet:h-4 2k:w-5 2k:h-5 4k:w-8 4k:h-8" />
                  Actif
                </span>
              )}
            </div>

            {/* Sélecteur de thème + bouton */}
            {template.isPurchased && (
              <div className="flex items-center gap-2 tablet:gap-3">
                {TEMPLATES_WITH_THEMES.includes(template.slug) && (
                  <div className="relative">
                    <select
                      value={themes[template.id]}
                      onChange={(e) =>
                        setThemes((prev) => ({ ...prev, [template.id]: e.target.value }))
                      }
                      disabled={isPending}
                      className="appearance-none bg-cream/10 text-cream text-[10px] tablet:text-xs desktop:text-xs 2k:text-sm 4k:text-2xl
            pl-3 pr-8 py-2 tablet:pl-4 tablet:pr-10 tablet:py-3 rounded-lg border border-cream/20
            focus:outline-none focus:border-cream/40
            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {getThemesForTemplate(template.slug).map((theme) => (
                        <option
                          key={theme.slug}
                          value={theme.slug}
                          className="bg-[#1a1a1a] text-cream"
                        >
                          {theme.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-cream/50 text-[10px] tablet:text-xs desktop:text-xs 2k:text-sm 4k:text-2xl">
                      ▾
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleActivate(template.id)}
                  disabled={isPending && activatingId === template.id}
                  className="px-4 py-2 tablet:px-6 tablet:py-3 desktop:px-8 2k:px-10 2k:py-4 4k:px-16 4k:py-6
        text-[10px] tablet:text-xs desktop:text-xs 2k:text-sm 4k:text-xl
        uppercase tracking-widest font-semibold rounded-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        bg-cream/10 text-cream hover:bg-cream/20"
                >
                  {isPending && activatingId === template.id
                    ? "Activation..."
                    : "Configurer"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesClient;
