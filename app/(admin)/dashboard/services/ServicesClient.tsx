"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Pencil, Trash2, X, ImageIcon, Loader2 } from "lucide-react";
import { getUploadSignature } from "../../actions/getUploadSignature";
import {
  createService,
  deleteService,
  updateService,
} from "../../actions/services";
import { FloatingInput } from "@/app/_components/FloatingInput";
import { FloatingTextarea } from "@/app/_components/FloatingTextarea";

type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  photoUrl: string | null;
  photoPublicId: string | null;
  order: number;
};

type UploadStatus = "idle" | "signing" | "uploading" | "saving";

const UPLOAD_LABELS: Record<UploadStatus, string> = {
  idle: "",
  signing: "Préparation...",
  uploading: "Upload...",
  saving: "Sauvegarde...",
};

export default function ServicesClient({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const [services, setServices] = useState(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<{
    url: string;
    publicId: string;
  } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditingService(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setPhotoPreview(null);
    setPendingPhoto(null);
    setFormError(null);
    setUploadError(null);
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description);
    setPrice(service.price);
    setPhotoPreview(service.photoUrl);
    setPendingPhoto(null);
    setFormError(null);
    setUploadError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingService(null);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setUploadError(null);
    setPendingPhoto(null);

    try {
      setUploadStatus("signing");
      const sig = await getUploadSignature(title);
      if (sig.error || !sig.signature) {
        setUploadError(sig.error ?? "Erreur de signature");
        setPhotoPreview(editingService?.photoUrl ?? null);
        return;
      }

      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey!);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", "photographe");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        setUploadError("Échec de l'upload. Réessaie.");
        setPhotoPreview(editingService?.photoUrl ?? null);
        return;
      }

      const data = await response.json();
      setPendingPhoto({ url: data.secure_url, publicId: data.public_id });
    } finally {
      setUploadStatus("idle");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const photoUrl =
        pendingPhoto?.url ?? editingService?.photoUrl ?? undefined;
      const photoPublicId =
        pendingPhoto?.publicId ?? editingService?.photoPublicId ?? undefined;
      const oldPhotoPublicId =
        pendingPhoto && editingService?.photoPublicId
          ? editingService.photoPublicId
          : undefined;

      if (editingService) {
        const result = await updateService(editingService.id, {
          title,
          description,
          price,
          photoUrl,
          photoPublicId,
          oldPhotoPublicId,
        });

        if (result.error) {
          setFormError(result.error);
          return;
        }

        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id
              ? {
                  ...s,
                  title,
                  description,
                  price,
                  photoUrl: photoUrl ?? null,
                  photoPublicId: photoPublicId ?? null,
                }
              : s,
          ),
        );
      } else {
        const result = await createService({
          title,
          description,
          price,
          photoUrl,
          photoPublicId,
        });

        if (result.error) {
          setFormError(result.error);
          return;
        }

        if (result.serviceId) {
          setServices((prev) => [
            ...prev,
            {
              id: result.serviceId!,
              title,
              description,
              price,
              photoUrl: photoUrl ?? null,
              photoPublicId: photoPublicId ?? null,
              order: prev.length,
            },
          ]);
        }
      }

      closeModal();
    });
  };

  const handleDelete = (serviceId: string) => {
    startTransition(async () => {
      const result = await deleteService(serviceId);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    });
  };

  const isUploading = uploadStatus !== "idle";

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 tablet:px-6 laptop:px-0 pb-20 desktop:pb-28 2k:pb-36 4k:pb-48">
      {/* ÉTAT VIDE + BOUTON groupés pour l'espacement */}
      <div className="flex flex-col items-center gap-8 desktop:gap-10 2k:gap-14 4k:gap-20">
        {services.length === 0 && (
          <p className="text-cream/40 italic text-center mt-10 tablet:mt-12 desktop:mt-16 2k:mt-20 4k:mt-32 text-sm tablet:text-base desktop:text-lg 2k:text-2xl 4k:text-4xl cursor-default">
            Aucun service pour l&apos;instant. Clique sur &quot;+&quot; pour en
            ajouter un.
          </p>
        )}

        {/* GRILLE */}
        {services.length > 0 && (
          <div className="w-full grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-4 desktop:gap-6 2k:gap-8 4k:gap-12">
            {services.map((service) => (
              <div
                key={service.id}
                className="glass-card rounded-xl border border-cream/20 overflow-hidden flex flex-col"
              >
                {/* Photo */}
                {service.photoUrl ? (
                  <div className="relative h-40 desktop:h-48 2k:h-60 4k:h-80 w-full">
                    <img
                      src={service.photoUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 desktop:h-48 2k:h-60 4k:h-80 w-full flex items-center justify-center bg-white/5 border-b border-cream/10">
                    <ImageIcon className="w-8 h-8 desktop:w-10 desktop:h-10 2k:w-14 2k:h-14 4k:w-20 4k:h-20 text-cream/20" />
                  </div>
                )}

                {/* Contenu */}
                <div className="flex flex-col gap-2 2k:gap-3 4k:gap-5 p-4 desktop:p-5 2k:p-6 4k:p-10 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-cream font-semibold text-sm desktop:text-base 2k:text-xl 4k:text-3xl leading-snug cursor-default">
                      {service.title}
                    </h3>
                    <span className="text-cream/70 font-medium whitespace-nowrap text-xs desktop:text-sm 2k:text-base 4k:text-2xl cursor-default">
                      {service.price}
                    </span>
                  </div>
                  <p className="text-cream/50 leading-relaxed flex-1 text-xs desktop:text-sm 2k:text-base 4k:text-xl cursor-default">
                    {service.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 2k:mt-4 2k:pt-4 4k:mt-6 4k:pt-6 border-t border-cream/10">
                    <button
                      onClick={() => openEdit(service)}
                      className="flex items-center gap-1.5 2k:gap-2 4k:gap-3 text-cream/50 hover:text-cream transition-colors cursor-pointer text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest"
                    >
                      <Pencil className="w-3 h-3 2k:w-4 2k:h-4 4k:w-6 4k:h-6" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 2k:gap-2 4k:gap-3 text-red-400/60 hover:text-red-400 transition-colors ml-auto cursor-pointer disabled:opacity-40 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3 2k:w-4 2k:h-4 4k:w-6 4k:h-6" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOUTON AJOUTER */}
        <button
          onClick={openCreate}
          className="group flex items-center gap-3 2k:gap-4 4k:gap-6 px-8 py-4 desktop:px-10 desktop:py-5 2k:px-14 2k:py-6 4k:px-20 4k:py-8 glass-card rounded-xl border border-cream/20 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        >
          <Plus className="w-4 h-4 2k:w-5 2k:h-5 4k:w-8 4k:h-8 text-cream/60 group-hover:text-cream transition-colors" />
          <span className="text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest text-cream/60 group-hover:text-cream transition-colors">
            Ajouter un service
          </span>
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 2k:p-8 4k:p-12">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Boîte */}
          <div className="relative w-full max-w-lg desktop:max-w-xl 2k:max-w-2xl 4k:max-w-4xl glass-premium rounded-2xl 4k:rounded-3xl border border-cream/20 p-6 desktop:p-8 2k:p-10 4k:p-16 flex flex-col gap-5 2k:gap-6 4k:gap-10 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header modal */}
            <div className="flex items-center justify-between">
              <h2 className="text-cream font-bold text-base desktop:text-lg 2k:text-2xl 4k:text-4xl tracking-wide">
                {editingService ? "Modifier le service" : "Nouveau service"}
              </h2>
              <button
                onClick={closeModal}
                className="text-cream/40 hover:text-cream transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 2k:w-7 2k:h-7 4k:w-10 4k:h-10" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 2k:gap-5 4k:gap-8"
            >
              <div className="relative">
                <FloatingInput
                  name="title"
                  label="Titre de la prestation"
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setTitle(e.target.value);
                    }
                  }}
                />
                <span
                  className={`absolute bottom-3 right-4 text-[10px] desktop:text-xs 2k:text-sm 4k:text-lg pointer-events-none transition-colors ${
                    title.length >= 20
                      ? "text-red-400 font-bold"
                      : "text-cream/40"
                  }`}
                >
                  {title.length}/20
                </span>
              </div>
              <FloatingInput
                name="price"
                label='Prix (ex : "150 €" ou "Sur devis")'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <div className="relative">
                <FloatingTextarea
                  name="description"
                  label="Description"
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    // On bloque la mise à jour si ça dépasse 90
                    if (e.target.value.length <= 90) {
                      setDescription(e.target.value);
                    }
                  }}
                />
                <span
                  className={`absolute bottom-3 right-4 text-[10px] desktop:text-xs 2k:text-sm 4k:text-lg pointer-events-none transition-colors ${
                    description.length >= 90
                      ? "text-red-400 font-bold"
                      : "text-cream/40"
                  }`}
                >
                  {description.length}/90
                </span>
              </div>

              {/* Zone photo */}
              <div className="flex flex-col gap-2 2k:gap-3 4k:gap-5">
                <p className="text-cream/40 text-[10px] desktop:text-xs 2k:text-sm 4k:text-xl uppercase tracking-widest">
                  Photo illustrative (optionnelle)
                </p>
                <div
                  className="relative h-36 desktop:h-44 2k:h-56 4k:h-80 w-full glass-card rounded-xl border border-cream/20 overflow-hidden flex items-center justify-center cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />

                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 2k:w-12 2k:h-12 4k:w-16 4k:h-16 text-cream/20 group-hover:text-cream/40 transition-colors" />
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="flex items-center gap-2 4k:gap-4 text-cream uppercase tracking-widest text-xs 2k:text-sm 4k:text-xl">
                        <Loader2 className="w-4 h-4 2k:w-6 2k:h-6 4k:w-8 4k:h-8 animate-spin" />
                        {UPLOAD_LABELS[uploadStatus]}
                      </span>
                    </div>
                  )}

                  {!isUploading && photoPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
                      <Plus className="w-6 h-6 2k:w-8 2k:h-8 4k:w-12 4k:h-12 text-white opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                  )}
                </div>
                {uploadError && (
                  <p className="text-red-400 text-[10px] desktop:text-xs 2k:text-sm 4k:text-lg">
                    {uploadError}
                  </p>
                )}
              </div>

              {formError && (
                <p className="text-red-400 text-xs 2k:text-sm 4k:text-xl text-center">
                  {formError}
                </p>
              )}

              {/* Bouton submit */}
              <button
                type="submit"
                disabled={isPending || isUploading}
                className="group relative mt-2 w-full py-4 desktop:py-5 2k:py-6 4k:py-10 flex items-center justify-center text-[10px] desktop:text-xs 2k:text-sm 4k:text-2xl uppercase tracking-[0.25em] font-semibold text-cream bg-dark rounded-xl 4k:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <span className="absolute inset-0 bg-blue translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
                <span className="relative z-10">
                  {isPending
                    ? "Sauvegarde..."
                    : editingService
                      ? "Enregistrer les modifications"
                      : "Créer le service"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
