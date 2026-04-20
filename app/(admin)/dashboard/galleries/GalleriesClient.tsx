"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Pencil,
  Star,
  Trash2,
  Share2,
  Loader2,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";
import {
  deleteGallery,
  setFeaturedGallery,
  shareGallery,
  updateGallery,
} from "../../actions/galleries";
import { FloatingInput } from "@/app/_components/FloatingInput";
import { FloatingTextarea } from "@/app/_components/FloatingTextarea";
import { optimizeCloudinaryUrl } from "@/app/lib/cloudinary-url";

type Gallery = {
  id: string;
  name: string;
  description: string;
  token: string;
  isPremium: boolean;
  coverUrl: string | null;
};

type ActionType = "rename" | "delete" | "share" | null;

export default function GalleriesClient({
  galleries: initial,
  canShare,
}: {
  galleries: Gallery[];
  canShare: boolean;
}) {
  const [galleries, setGalleries] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [isPending, startTransition] = useTransition();

  // Champs renommage
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");

  // Champ partage
  const [emailValue, setEmailValue] = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [shareError, setShareError] = useState("");

  const selected = galleries.find((g) => g.id === selectedId) ?? null;

  const selectGallery = (gallery: Gallery) => {
    if (selectedId === gallery.id) {
      clearSelection();
      return;
    }
    setSelectedId(gallery.id);
    setActiveAction(null);
    setNameValue(gallery.name);
    setDescValue(gallery.description);
  };

  const clearSelection = () => {
    setSelectedId(null);
    setActiveAction(null);
    setNameValue("");
    setDescValue("");
  };

  const handleActionClick = (action: ActionType) => {
    setActiveAction((prev) => (prev === action ? null : action));
    if (action === "rename" && selected) {
      setNameValue(selected.name);
      setDescValue(selected.description);
    }
    if (action === "share") {
      setEmailValue("");
      setShareStatus("idle");
      setShareError("");
    }
  };

  const handleRename = () => {
    if (!selectedId || !nameValue.trim()) return;
    startTransition(async () => {
      await updateGallery(selectedId, {
        name: nameValue,
        description: descValue,
      });
      setGalleries((prev) =>
        prev.map((g) =>
          g.id === selectedId
            ? { ...g, name: nameValue.trim(), description: descValue.trim() }
            : g,
        ),
      );
      clearSelection();
    });
  };

  const handleSetFeatured = (galleryId: string) => {
    startTransition(async () => {
      await setFeaturedGallery(galleryId);
      setGalleries((prev) =>
        prev.map((g) => ({ ...g, isPremium: g.id === galleryId })),
      );
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await deleteGallery(selectedId);
      if (result.error) {
        alert(result.error); // temporaire pour voir les erreurs
        return;
      }
      setGalleries((prev) => prev.filter((g) => g.id !== selectedId));
      clearSelection();
    });
  };

  const handleShare = () => {
    if (!selectedId || !emailValue.trim()) return;
    startTransition(async () => {
      const result = await shareGallery(selectedId, emailValue.trim());
      if (result.success) {
        setShareStatus("success");
        setEmailValue("");
        setTimeout(() => setShareStatus("idle"), 3000);
      } else {
        setShareStatus("error");
        setShareError(result.error ?? "Erreur inconnue");
        setTimeout(() => {
          setShareStatus("idle");
          setShareError("");
        }, 3000);
      }
    });
  };

  const isSelectionMode = selectedId !== null;

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-20">
      {/* BARRE D'ACTIONS */}
      <div className="w-[90%] self-center relative z-50">
        <div className="flex flex-col p-4 rounded-xl glass-premium transition-all duration-300">
          <div className="flex flex-col laptop:flex-row gap-6 w-full items-center">
            {/* GAUCHE : indication */}
            <div className="w-full laptop:w-[45%] flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest font-medium text-cream/50">
                Galeries
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-widest transition-colors ${isSelectionMode ? "text-cream" : "text-cream/30"}`}
              >
                {isSelectionMode
                  ? `« ${selected?.name} » sélectionnée`
                  : "Clique sur une galerie pour la sélectionner"}
              </span>
            </div>

            {/* DROITE : boutons d'action */}
            <div
              className={`w-full laptop:w-[55%] flex flex-col gap-3 ${!isSelectionMode ? "hidden laptop:flex opacity-30 pointer-events-none" : "flex"}`}
            >
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={!isSelectionMode || isPending}
                  onClick={() => handleActionClick("rename")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${activeAction === "rename" ? "bg-cream/10 border-cream/30 text-cream" : "border-cream/10 bg-dark/60 text-cream/80 hover:bg-dark"}`}
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-[8px] uppercase tracking-wider">
                    Renommer
                  </span>
                </button>

                <button
                  disabled={!isSelectionMode || isPending}
                  onClick={() => handleActionClick("share")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${activeAction === "share" ? "bg-cream/10 border-cream/30 text-cream" : "border-cream/10 bg-dark/60 text-cream/80 hover:bg-dark"}`}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[8px] uppercase tracking-wider">
                    Partager
                  </span>
                </button>

                <button
                  disabled={!isSelectionMode || isPending}
                  onClick={() => handleActionClick("delete")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${activeAction === "delete" ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-red-500/10 bg-red-500/5 text-red-400/80 hover:bg-red-500/10"}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[8px] uppercase tracking-wider">
                    Supprimer
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ZONE D'ACTION ACTIVE */}
          {activeAction && isSelectionMode && (
            <div className="mt-4 pt-4 border-t border-cream/10 animate-in slide-in-from-top-1 fade-in duration-200">
              {activeAction === "rename" && (
                <div className="flex flex-col gap-3 w-full laptop:w-[55%] laptop:ml-auto">
                  {/* Champ nom via ton composant */}
                  <FloatingInput
                    id="rename_name"
                    label="Nom de la galerie"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    disabled={isPending}
                  />

                  {/* Champ description via ton composant */}
                  <FloatingTextarea
                    id="rename_desc"
                    label="Description"
                    rows={2}
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    disabled={isPending}
                  />

                  <button
                    disabled={isPending || !nameValue.trim()}
                    onClick={handleRename}
                    className="flex justify-center items-center bg-blue/20 text-blue border border-blue/30 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-blue/30 transition-colors disabled:opacity-30"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Valider"
                    )}
                  </button>
                </div>
              )}

              {activeAction === "share" && !canShare && (
                <div className="flex flex-col items-center gap-3 w-full laptop:w-[55%] laptop:ml-auto py-4">
                  <Lock className="w-6 h-6 text-cream/30" />
                  <p className="text-cream/60 text-xs text-center leading-relaxed">
                    Le partage de galeries est réservé au template Premium.
                  </p>
                  <a
                    href="/dashboard/templates"
                    className="text-[10px] uppercase tracking-widest text-cream/50 hover:text-cream border border-cream/20 hover:border-cream/40 px-4 py-2 rounded-lg transition-all"
                  >
                    Voir mes templates →
                  </a>
                </div>
              )}

              {activeAction === "share" && canShare && (
                <div className="flex flex-col gap-3 w-full laptop:w-[55%] laptop:ml-auto">
                  <FloatingInput
                    type="email"
                    id="share_email"
                    label="Adresse email du destinataire"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    disabled={isPending || shareStatus === "success"}
                    onKeyDown={(e) => e.key === "Enter" && handleShare()}
                  />

                  <button
                    disabled={
                      isPending ||
                      !emailValue.trim() ||
                      shareStatus === "success"
                    }
                    onClick={handleShare}
                    className="flex justify-center items-center gap-2 bg-blue/20 text-blue border border-blue/30 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-blue/30 transition-colors disabled:opacity-30"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : shareStatus === "success" ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" /> Email
                        envoyé !
                      </>
                    ) : shareStatus === "error" ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />{" "}
                        {shareError}
                      </>
                    ) : (
                      "Envoyer l'invitation"
                    )}
                  </button>
                </div>
              )}

              {activeAction === "delete" && (
                <div className="flex flex-col gap-3 bg-red-500/5 p-3 rounded-lg border border-red-500/10 w-full laptop:w-[55%] laptop:ml-auto">
                  <span className="text-red-400 text-xs text-center">
                    Supprimer « {selected?.name} » et toutes ses photos
                    exclusives ?
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => setActiveAction(null)}
                      className="flex-1 border border-cream/10 text-cream/70 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      disabled={isPending}
                      onClick={handleDelete}
                      className="flex flex-1 justify-center items-center bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Confirmer"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GRILLE DES GALERIES */}
      <div className="w-[90%] self-center grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 relative z-0">
        {galleries.map((gallery) => {
          const isSelected = selectedId === gallery.id;
          return (
            <div
              key={gallery.id}
              onClick={() => selectGallery(gallery)}
              className={`flex flex-col gap-3 group cursor-pointer transition-all duration-200 ${isSelected ? "scale-[0.98]" : ""}`}
            >
              {/* IMAGE 16/9 */}
              <div
                className={`relative w-full aspect-video overflow-hidden rounded-xl bg-dark/20 border transition-all duration-200 ${isSelected ? "border-cream/50 ring-2 ring-cream/20" : "border-cream/5"}`}
              >
                {isSelected && (
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-cream flex items-center justify-center rounded-sm">
                    <Check className="w-4 h-4 text-dark" />
                  </div>
                )}

                {/* Étoile mise en avant — haut droite */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // ne pas sélectionner la galerie
                    if (!gallery.isPremium) handleSetFeatured(gallery.id);
                  }}
                  className={`absolute top-2 right-2 z-10 transition-colors ${gallery.isPremium ? "cursor-default text-yellow-400" : "text-cream/40 hover:text-yellow-400"}`}
                >
                  <Star
                    className="w-5 h-5"
                    fill={gallery.isPremium ? "currentColor" : "none"}
                  />
                </button>
                {gallery.coverUrl ? (
                  <img
                    src={optimizeCloudinaryUrl(gallery.coverUrl, 600)}
                    alt={`Couverture de ${gallery.name}`}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? "opacity-70" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cream/30 text-[10px] uppercase tracking-widest">
                    Aucune couverture
                  </div>
                )}
              </div>

              {/* TEXTES */}
              <div className="flex flex-col px-1">
                <h2
                  className={`font-semibold text-base laptop:text-lg tracking-wide truncate transition-colors ${isSelected ? "text-cream" : "text-cream/80"}`}
                >
                  {gallery.name}
                </h2>
                <p className="text-cream/60 text-xs leading-relaxed line-clamp-2 mt-1">
                  {gallery.description || "Aucune description"}
                </p>
              </div>
            </div>
          );
        })}

        {galleries.length === 0 && (
          <div className="col-span-full text-center text-cream/50 text-xs py-10">
            Aucune galerie pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
