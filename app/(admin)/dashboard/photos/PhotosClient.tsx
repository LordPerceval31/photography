"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Trash2,
  FolderSymlink,
  CopyPlus,
  Pencil,
  Filter,
  ChevronDown,
  ArrowRight,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import {
  addPhotoToGallery,
  copyPhotos,
  deletePhotos,
  movePhotos,
  renamePhoto,
} from "../../actions/photos";
import { getUploadSignature } from "../../actions/getUploadSignature";
import { optimizeCloudinaryUrl } from "@/app/lib/cloudinary-url";

interface Photo {
  id: string;
  url: string;
  title: string | null;
  galleryId: string | null;
  createdAt: Date | string;
}

interface Gallery {
  id: string;
  name: string;
}

type ActionType = "rename" | "move" | "copy" | "delete" | null;

const PHOTOS_PER_PAGE = 20;

const PhotosClient = ({
  photos = [],
  galleries = [],
}: {
  photos?: Photo[];
  galleries?: Gallery[];
}) => {
  const router = useRouter();

  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos);

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterGallery, setFilterGallery] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [renameValue, setRenameValue] = useState("");
  const [targetGalleryId, setTargetGalleryId] = useState("");
  const [isTargetGalleryOpen, setIsTargetGalleryOpen] = useState(false);

  const [isPending, setIsPending] = useState(false);

  // Panneau "Ajouter une photo à une galerie"
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addGalleryId, setAddGalleryId] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [isAddGalleryOpen, setIsAddGalleryOpen] = useState(false);
  const [isAddPending, setIsAddPending] = useState(false);
  const [addError, setAddError] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Remise à zéro de la page si on change le filtre ou le tri
  useEffect(() => {
    setCurrentPage(1);
  }, [filterGallery, sortBy]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      if (newSelection.length === 0) setActiveAction(null);
      if (newSelection.length > 1 && activeAction === "rename")
        setActiveAction(null);
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setActiveAction(null);
    setRenameValue("");
    setTargetGalleryId("");
    setIsTargetGalleryOpen(false);
  };

  const isSelectionMode = selectedIds.length > 0;

  const handleRename = async () => {
    if (!renameValue || selectedIds.length !== 1) return;
    setIsPending(true);
    try {
      await renamePhoto(selectedIds[0], renameValue);
      setLocalPhotos((prev) =>
        prev.map((p) =>
          p.id === selectedIds[0] ? { ...p, title: renameValue } : p,
        ),
      );
      clearSelection();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsPending(true);
    try {
      await deletePhotos(selectedIds);
      setLocalPhotos((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      clearSelection();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleMove = async () => {
    if (!targetGalleryId || selectedIds.length === 0) return;
    setIsPending(true);
    try {
      await movePhotos(selectedIds, targetGalleryId);
      setLocalPhotos((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id) ? { ...p, galleryId: targetGalleryId } : p,
        ),
      );
      clearSelection();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = async () => {
    if (!targetGalleryId || selectedIds.length === 0) return;
    setIsPending(true);
    try {
      await copyPhotos(selectedIds, targetGalleryId);
      clearSelection();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const sourceGalleryName = useMemo(() => {
    if (selectedIds.length === 0) return "";
    const selectedPhotos = localPhotos.filter((p) =>
      selectedIds.includes(p.id),
    );
    if (selectedPhotos.length === 0) return "";
    const firstGalId = selectedPhotos[0].galleryId;
    const allSame = selectedPhotos.every((p) => p.galleryId === firstGalId);
    if (!allSame) return "Galeries multiples";
    if (!firstGalId) return "Toutes les photos";

    const gal = galleries.find((g) => g.id === firstGalId);
    return gal ? gal.name : "Inconnue";
  }, [selectedIds, localPhotos, galleries]);

  const displayedPhotos = useMemo(() => {
    let result = [...localPhotos];

    if (filterGallery !== "all") {
      result = result.filter((photo) => photo.galleryId === filterGallery);
    }

    result.sort((a, b) => {
      if (sortBy === "date-desc")
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      if (sortBy === "date-asc")
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      if (sortBy === "gal-asc") {
        const galA = galleries.find((g) => g.id === a.galleryId)?.name || "Z";
        const galB = galleries.find((g) => g.id === b.galleryId)?.name || "Z";
        return galA.localeCompare(galB);
      }
      if (sortBy === "gal-desc") {
        const galA = galleries.find((g) => g.id === a.galleryId)?.name || "A";
        const galB = galleries.find((g) => g.id === b.galleryId)?.name || "A";
        return galB.localeCompare(galA);
      }
      return 0;
    });

    return result;
  }, [localPhotos, galleries, filterGallery, sortBy]);

  // Calcul pour la pagination
  const totalPages = Math.max(
    1,
    Math.ceil(displayedPhotos.length / PHOTOS_PER_PAGE),
  );

  // Si on supprime des photos de la dernière page et qu'elle devient vide, on recule
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedPhotos = displayedPhotos.slice(
    (currentPage - 1) * PHOTOS_PER_PAGE,
    currentPage * PHOTOS_PER_PAGE,
  );

  const getSortLabel = () => {
    if (sortBy === "date-desc") return "Plus récentes en premier";
    if (sortBy === "date-asc") return "Plus anciennes en premier";
    if (sortBy === "gal-asc") return "Nom de galerie (A-Z)";
    if (sortBy === "gal-desc") return "Nom de galerie (Z-A)";
    return "Trier par...";
  };

  const getGalleryLabel = () => {
    if (filterGallery === "all") return "Toutes les galeries";
    const found = galleries.find((g) => g.id === filterGallery);
    return found ? `Galerie : ${found.name}` : "Toutes les galeries";
  };

  const getTargetGalleryLabel = () => {
    if (!targetGalleryId) return "Destination...";
    const found = galleries.find((g) => g.id === targetGalleryId);
    return found ? found.name : "Destination...";
  };

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setAddFile(file);
    setAddPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleAddPhoto = async () => {
    if (!addFile || !addGalleryId) return;
    setIsAddPending(true);
    setAddError("");
    try {
      const sig = await getUploadSignature();
      if (sig.error || !sig.signature) {
        setAddError(sig.error ?? "Impossible de signer l'upload.");
        return;
      }

      const formData = new FormData();
      formData.append("file", addFile);
      formData.append("api_key", sig.apiKey!);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", "photographe");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!res.ok) throw new Error("Échec de l'upload vers Cloudinary.");

      const json = await res.json();
      const result = await addPhotoToGallery(
        addGalleryId,
        json.secure_url,
        json.public_id,
        addTitle,
      );

      if (result.error) {
        setAddError(result.error);
        return;
      }

      // Réinitialisation du panneau
      setAddFile(null);
      setAddPreview(null);
      setAddTitle("");
      setAddGalleryId("");
      setIsAddOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsAddPending(false);
    }
  };

  const handleActionClick = (action: ActionType) => {
    if (activeAction === action) {
      setActiveAction(null);
    } else {
      setActiveAction(action);
      setIsTargetGalleryOpen(false);
      if (action === "rename" && selectedIds.length === 1) {
        const photo = localPhotos.find((p) => p.id === selectedIds[0]);
        setRenameValue(photo?.title || "");
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 pb-20">
      <div className="w-full flex justify-start pl-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-cream/50 hover:text-cream transition-colors w-max"
        >
          <ArrowLeft className="w-3 h-3 tablet:w-4 tablet:h-4 laptop:w-5 laptop:h-4 desktop:w-4 desktop:h-5 2k:w-6 2k:h-6 ultrawide:w-8 ultrawide:h-8 4k:w-10 4k:h-10 transition-transform group-hover:-translate-x-1" />
          <span className="uppercase tracking-widest text-[8px] tablet:text-[10px] laptop:text-xs desktop:text-sm 2k:text-lg ultrawide:text-xl 4k:text-3xl font-medium cursor-pointer">
            Retour au dashboard
          </span>
        </Link>
      </div>

      <h1
        className="font-bold text-cream tracking-wide text-center cursor-default laptop:self-center
        w-[90%] tablet:w-[80%] laptop:w-[70%]
        text-xl tablet:text-2xl laptop:text-2xl desktop:text-3xl 2k:text-4xl ultrawide:text-4xl 4k:text-7xl
         laptop:mb-6 desktop:mb-8 2k:mb-12 ultrawide:mb-14 4k:mb-20"
      >
        Toutes les photos
      </h1>

      <div className="w-[90%] self-center relative z-50">
        <div className="flex flex-col p-4 rounded-xl glass-premium transition-all duration-300">
          <div className="flex flex-col laptop:flex-row gap-6 w-full items-center">
            {/* SECTION GAUCHE : FILTRES */}
            <div className="w-full laptop:w-[45%] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-cream/50 mb-1">
                <Filter className="w-3 h-3" />
                <span className="text-[10px] desktop:text-xs 2k:text-sm ultrawide:text-sm 4k:text-xl uppercase tracking-widest font-medium">
                  Trier & Filtrer les photos
                </span>
              </div>

              <div className="flex flex-col tablet:flex-row gap-3 w-full">
                {/* 1er Menu : Tri */}
                <div className="w-full flex flex-col relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsGalleryOpen(false);
                    }}
                    className={`w-full flex items-center justify-between glass-input text-cream/80 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl p-3 outline-none transition-all duration-300 ${
                      isSortOpen ? "rounded-t-lg rounded-b-none" : "rounded-lg"
                    }`}
                  >
                    <span className="truncate">{getSortLabel()}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isSortOpen ? "rotate-180 text-cream" : "text-cream/50"}`}
                    />
                  </button>

                  {isSortOpen && (
                    <div className="absolute z-50 top-full left-0 w-full glass-card rounded-t-none rounded-b-lg overflow-hidden">
                      <button
                        type="button"
                        className="w-full text-left p-3 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl text-cream/80 hover:text-cream hover:bg-black/75 transition-all duration-200"
                        onClick={() => {
                          setSortBy("date-desc");
                          setIsSortOpen(false);
                        }}
                      >
                        Plus récentes en premier
                      </button>
                      <button
                        type="button"
                        className="w-full text-left p-3 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl text-cream/80 hover:text-cream hover:bg-black/75 transition-all duration-200"
                        onClick={() => {
                          setSortBy("date-asc");
                          setIsSortOpen(false);
                        }}
                      >
                        Plus anciennes en premier
                      </button>
                      {filterGallery === "all" && (
                        <>
                          <button
                            type="button"
                            className="w-full text-left p-3 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl text-cream/80 hover:text-cream hover:bg-black/75 transition-all duration-200"
                            onClick={() => {
                              setSortBy("gal-asc");
                              setIsSortOpen(false);
                            }}
                          >
                            Nom de galerie (A-Z)
                          </button>
                          <button
                            type="button"
                            className="w-full text-left p-3 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl text-cream/80 hover:text-cream hover:bg-black/75 transition-all duration-200"
                            onClick={() => {
                              setSortBy("gal-desc");
                              setIsSortOpen(false);
                            }}
                          >
                            Nom de galerie (Z-A)
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 2ème Menu : Galeries */}
                <div className="w-full flex flex-col relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsGalleryOpen(!isGalleryOpen);
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between glass-input text-cream/80 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl p-3 outline-none transition-all duration-300 ${
                      isGalleryOpen
                        ? "rounded-t-lg rounded-b-none"
                        : "rounded-lg"
                    }`}
                  >
                    <span className="truncate">{getGalleryLabel()}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isGalleryOpen ? "rotate-180 text-cream" : "text-cream/50"}`}
                    />
                  </button>

                  {isGalleryOpen && (
                    <div className="absolute z-50 top-full left-0 w-full glass-card rounded-t-none rounded-b-lg max-h-60 overflow-y-auto no-scrollbar">
                      <button
                        type="button"
                        className="w-full text-left p-3 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl text-cream/80 hover:text-cream hover:bg-black/75 transition-all duration-200"
                        onClick={() => {
                          setFilterGallery("all");
                          setIsGalleryOpen(false);
                          clearSelection();
                        }}
                      >
                        Toutes les galeries
                      </button>
                      {galleries.map((gal) => (
                        <button
                          key={gal.id}
                          type="button"
                          className="w-full text-left p-3 text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-3xl text-cream/80 hover:text-cream hover:bg-black/75 truncate transition-all duration-200"
                          onClick={() => {
                            setFilterGallery(gal.id);
                            setIsGalleryOpen(false);
                            clearSelection();
                          }}
                        >
                          {gal.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION DROITE : BOUTONS D'ACTION */}
            <div
              className={`w-full laptop:w-[55%] flex flex-col gap-3 ${!isSelectionMode ? "hidden laptop:flex" : "flex mt-4 pt-4 laptop:mt-0 laptop:pt-0"}`}
            >
              <div className="flex items-center justify-center laptop:justify-start mb-1 h-4">
                <span
                  className={`text-[10px] desktop:text-xs 2k:text-sm ultrawide:text-sm 4k:text-xl font-semibold uppercase tracking-widest transition-colors ${isSelectionMode ? "text-cream" : "text-cream/30"}`}
                >
                  {selectedIds.length} photo(s)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  disabled={selectedIds.length !== 1 || isPending}
                  onClick={() => handleActionClick("rename")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed glass-card ${activeAction === "rename" ? "text-cream" : "text-cream/80"}`}
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-[8px] desktop:text-[10px] 2k:text-xs ultrawide:text-xs 4k:text-lg uppercase tracking-wider">
                    Renommer
                  </span>
                </button>
                <button
                  disabled={selectedIds.length === 0 || isPending}
                  onClick={() => handleActionClick("move")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed glass-card ${activeAction === "move" ? "text-cream" : "text-cream/80"}`}
                >
                  <FolderSymlink className="w-4 h-4" />
                  <span className="text-[8px] desktop:text-[10px] 2k:text-xs ultrawide:text-xs 4k:text-lg uppercase tracking-wider">
                    Déplacer
                  </span>
                </button>
                <button
                  disabled={selectedIds.length === 0 || isPending}
                  onClick={() => handleActionClick("copy")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed glass-card ${activeAction === "copy" ? "text-cream" : "text-cream/80"}`}
                >
                  <CopyPlus className="w-4 h-4" />
                  <span className="text-[8px] desktop:text-[10px] 2k:text-xs ultrawide:text-xs 4k:text-lg uppercase tracking-wider">
                    Copier
                  </span>
                </button>
                <button
                  disabled={selectedIds.length === 0 || isPending}
                  onClick={() => handleActionClick("delete")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed glass-card ${activeAction === "delete" ? "text-red-400" : "text-red-400/80"}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[8px] desktop:text-[10px] 2k:text-xs ultrawide:text-xs 4k:text-lg uppercase tracking-wider">
                    Suppr.
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ZONE D'ACTION ACTIVE (Inputs, confirms...) */}
          {activeAction && isSelectionMode && (
            <div className="mt-4 pt-4 animate-in slide-in-from-top-1 fade-in duration-200 w-full">
              {activeAction === "rename" && (
                <div className="flex items-center gap-2 w-full laptop:w-[55%] laptop:ml-auto">
                  <div className="relative w-full">
                    <input
                      type="text"
                      id="floating_rename"
                      className="block px-3 pb-2.5 pt-4 w-full text-[12px] desktop:text-xs 2k:text-xl ultrawide:text-xl 4k:text-2xl text-cream glass-input rounded-lg appearance-none focus:outline-none focus:ring-0 peer transition-colors disabled:opacity-50"
                      placeholder=" "
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      disabled={isPending}
                    />
                    <label
                      htmlFor="floating_rename"
                      className="absolute text-[12px] desktop:text-xs 2k:text-sm ultrawide:text-sm 4k:text-lg text-cream/50 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left px-2 peer-focus:px-2 peer-focus:text-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 uppercase tracking-widest"
                    >
                      Nouveau nom
                    </label>
                  </div>
                  <button
                    disabled={isPending || !renameValue}
                    onClick={handleRename}
                    className="glass-card text-blue px-4 py-3 rounded-lg text-[12px] desktop:text-xs 2k:text-sm ultrawide:text-sm 4k:text-lg font-semibold uppercase tracking-widest transition-colors disabled:opacity-30 shrink-0"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Valider"
                    )}
                  </button>
                </div>
              )}

              {(activeAction === "move" || activeAction === "copy") && (
                <div className="flex flex-col gap-3 w-full laptop:w-[55%] laptop:ml-auto">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 glass-card rounded-lg px-3 py-2 flex justify-between items-center opacity-70 gap-2">
                      <span className="text-[8px] uppercase tracking-widest text-cream/40 shrink-0">
                        Source
                      </span>
                      <span className="text-[10px] text-cream truncate text-right">
                        {sourceGalleryName}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-cream/30 shrink-0" />

                    <div className="flex-1 relative">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          setIsTargetGalleryOpen(!isTargetGalleryOpen)
                        }
                        className={`w-full flex items-center justify-between glass-input text-cream/80 text-[10px] p-3 outline-none transition-all duration-300 disabled:opacity-50 ${
                          isTargetGalleryOpen
                            ? "rounded-t-lg rounded-b-none"
                            : "rounded-lg"
                        }`}
                      >
                        <span className="truncate">
                          {getTargetGalleryLabel()}
                        </span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-300 shrink-0 ${isTargetGalleryOpen ? "rotate-180 text-cream" : "text-cream/50"}`}
                        />
                      </button>

                      {isTargetGalleryOpen && (
                        <div className="absolute z-50 top-full left-0 w-full glass-card rounded-t-none rounded-b-lg max-h-40 overflow-y-auto no-scrollbar">
                          {galleries.map((gal) => (
                            <button
                              key={gal.id}
                              type="button"
                              className="w-full text-left p-3 text-[10px] text-cream/80 hover:text-cream truncate transition-colors"
                              onClick={() => {
                                setTargetGalleryId(gal.id);
                                setIsTargetGalleryOpen(false);
                              }}
                            >
                              {gal.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isPending || !targetGalleryId}
                    onClick={activeAction === "move" ? handleMove : handleCopy}
                    className="flex justify-center items-center w-full glass-card text-blue px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest disabled:opacity-30 transition-colors"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : activeAction === "move" ? (
                      "Confirmer le déplacement"
                    ) : (
                      "Confirmer la copie"
                    )}
                  </button>
                </div>
              )}

              {activeAction === "delete" && (
                <div className="flex flex-col gap-3 glass-card p-3 rounded-lg w-full laptop:w-[55%] laptop:ml-auto">
                  <span className="text-red-400 text-xs text-center">
                    Supprimer définitivement {selectedIds.length} photo(s) ?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => setActiveAction(null)}
                      className="flex-1 glass-card text-cream/70 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      disabled={isPending}
                      onClick={handleDelete}
                      className="flex justify-center items-center flex-1 glass-card text-red-400 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
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

      {/* PANNEAU AJOUT PHOTO À UNE GALERIE */}
      <div className="w-[90%] self-center">
        <button
          type="button"
          onClick={() => { setIsAddOpen((v) => !v); setAddError(""); }}
          className="flex items-center gap-2 text-cream/60 hover:text-cream transition-colors text-[10px] uppercase tracking-widest font-medium"
        >
          <ImagePlus className="w-4 h-4" />
          Ajouter une photo à une galerie
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isAddOpen ? "rotate-180" : ""}`} />
        </button>

        {isAddOpen && (
          <div className="mt-4 p-4 rounded-xl glass-premium flex flex-col gap-4 animate-in slide-in-from-top-1 fade-in duration-200">
            {/* Sélection du fichier */}
            <input
              ref={addInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAddFileChange}
            />

            <div className="flex flex-col tablet:flex-row gap-4 items-start">
              {/* Aperçu / zone de clic */}
              <button
                type="button"
                onClick={() => addInputRef.current?.click()}
                className="shrink-0 w-24 h-24 rounded-lg border border-dashed border-cream/20 hover:border-cream/40 transition-colors overflow-hidden flex items-center justify-center text-cream/30 hover:text-cream/60"
              >
                {addPreview ? (
                  <img src={addPreview} alt="aperçu" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-6 h-6" />
                )}
              </button>

              <div className="flex flex-col gap-3 flex-1 w-full">
                {/* Titre (optionnel) */}
                <input
                  type="text"
                  placeholder="Titre (optionnel)"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-cream/10 focus:border-blue outline-none text-cream/80 placeholder:text-cream/20 py-1 text-xs transition-colors"
                />

                {/* Sélection de la galerie */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAddGalleryOpen((v) => !v)}
                    className={`w-full flex items-center justify-between glass-input text-cream/80 text-xs p-3 outline-none transition-all duration-300 ${isAddGalleryOpen ? "rounded-t-lg rounded-b-none" : "rounded-lg"}`}
                  >
                    <span className="truncate">
                      {addGalleryId
                        ? (galleries.find((g) => g.id === addGalleryId)?.name ?? "Galerie...")
                        : "Choisir une galerie..."}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 shrink-0 ${isAddGalleryOpen ? "rotate-180 text-cream" : "text-cream/50"}`} />
                  </button>

                  {isAddGalleryOpen && (
                    <div className="absolute z-50 top-full left-0 w-full glass-card rounded-t-none rounded-b-lg max-h-40 overflow-y-auto no-scrollbar">
                      {galleries.map((gal) => (
                        <button
                          key={gal.id}
                          type="button"
                          className="w-full text-left p-3 text-xs text-cream/80 hover:text-cream hover:bg-black/40 truncate transition-colors"
                          onClick={() => { setAddGalleryId(gal.id); setIsAddGalleryOpen(false); }}
                        >
                          {gal.name}
                        </button>
                      ))}
                      {galleries.length === 0 && (
                        <p className="p-3 text-xs text-cream/30">Aucune galerie disponible.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {addError && (
              <p className="text-red-400 text-xs">{addError}</p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setIsAddOpen(false); setAddFile(null); setAddPreview(null); setAddTitle(""); setAddGalleryId(""); setAddError(""); }}
                className="flex items-center gap-1 glass-card text-cream/50 hover:text-cream px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-colors"
              >
                <X className="w-3 h-3" /> Annuler
              </button>
              <button
                type="button"
                disabled={!addFile || !addGalleryId || isAddPending}
                onClick={handleAddPhoto}
                className="flex items-center gap-1 glass-card text-blue px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-semibold disabled:opacity-30 transition-colors"
              >
                {isAddPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Ajouter"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GRILLE MASONRY */}
      <div className="w-[90%] tablet:w-[90%] self-center columns-2 tablet:columns-3 desktop:columns-4 gap-4 relative z-0">
        {paginatedPhotos.map((photo) => {
          const isSelected = selectedIds.includes(photo.id);

          return (
            <div
              key={photo.id}
              onClick={() => toggleSelection(photo.id)}
              className="relative group cursor-pointer overflow-hidden glass-card mb-4 break-inside-avoid inline-block w-full"
            >
              <img
                src={optimizeCloudinaryUrl(photo.url, 500)}
                alt={photo.title || "Photo"}
                loading="lazy"
                decoding="async"
                className={`w-full h-auto block transition-transform duration-300 ${
                  isSelected ? "opacity-60 scale-95" : "opacity-100"
                }`}
              />

              {(isSelectionMode || isSelected) && (
                <div className="absolute top-2 left-2">
                  <div
                    className={`w-6 h-6 flex items-center justify-center border transition-all ${
                      isSelected
                        ? "bg-cream border-cream text-dark"
                        : "bg-black/40 border-cream/40 text-transparent"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                    />
                  </div>
                </div>
              )}

              {isSelected && photo.title && (
                <div className="absolute bottom-2 right-2 glass-card px-2 py-1 rounded text-[9px] font-medium text-cream uppercase tracking-wider truncate max-w-[85%] pointer-events-none">
                  {photo.title}
                </div>
              )}

              {!isSelectionMode && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </div>
          );
        })}

        {displayedPhotos.length === 0 && (
          <div className="text-center text-cream/50 text-xs py-10 w-full">
            Aucune photo ne correspond à ce filtre.
          </div>
        )}
      </div>

      {/* CONTRÔLES DE PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-4 w-full">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg glass-card text-cream/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs uppercase tracking-widest font-semibold"
          >
            Précédent
          </button>

          <span className="text-cream/50 text-xs tracking-widest font-medium">
            PAGE {currentPage} SUR {totalPages}
          </span>

          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg glass-card text-cream/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs uppercase tracking-widest font-semibold"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotosClient;
