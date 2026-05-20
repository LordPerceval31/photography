import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAuth = vi.fn();
const mockGalleryFindUnique = vi.fn();
const mockPhotoCreate = vi.fn();
const mockPhotoFindMany = vi.fn();
const mockPhotoFindUnique = vi.fn();
const mockPhotoFindFirst = vi.fn();
const mockPhotoUpdate = vi.fn();
const mockPhotoDeleteMany = vi.fn();
const mockGalleryPhotoCreate = vi.fn();
const mockGalleryPhotoUpdateMany = vi.fn();
const mockGalleryPhotoDeleteMany = vi.fn();
const mockGalleryPhotoCreateMany = vi.fn();
const mockDeleteCloudinaryPhotos = vi.fn();
const mockGetCloudinaryConfig = vi.fn().mockResolvedValue({});
const mockCloudinaryConfig = vi.fn();
const mockCloudinaryRename = vi.fn();

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/app/lib/prisma", () => ({
  default: {
    gallery: { findUnique: mockGalleryFindUnique },
    photo: {
      create: mockPhotoCreate,
      findMany: mockPhotoFindMany,
      findUnique: mockPhotoFindUnique,
      findFirst: mockPhotoFindFirst,
      update: mockPhotoUpdate,
      deleteMany: mockPhotoDeleteMany,
    },
    galleryPhoto: {
      create: mockGalleryPhotoCreate,
      updateMany: mockGalleryPhotoUpdateMany,
      deleteMany: mockGalleryPhotoDeleteMany,
      createMany: mockGalleryPhotoCreateMany,
    },
  },
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: mockCloudinaryConfig,
    uploader: { rename: mockCloudinaryRename },
  },
}));

vi.mock("@/app/lib/cloudinary", () => ({
  CLOUDINARY_FOLDER: "photographe",
  titleToSlug: (t: string) =>
    t
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  getCloudinaryConfig: mockGetCloudinaryConfig,
  deleteCloudinaryPhotos: mockDeleteCloudinaryPhotos,
  generateUniquePublicId: vi.fn(),
}));

const {
  addPhotosToGallery,
  addPhotoToGallery,
  deletePhotos,
  movePhotos,
  renamePhoto,
} = await import("@/app/(admin)/actions/photos");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("addPhotosToGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await addPhotosToGallery("gal-1", []);
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne une erreur si la galerie est introuvable", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue(null);
    const result = await addPhotosToGallery("gal-inexistante", []);
    expect(result.error).toBe("Galerie introuvable");
  });

  it("ne reset pas les couvertures si aucune photo n'est marquée couverture", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-1" });
    mockPhotoCreate.mockResolvedValue({ id: "photo-1" });
    mockGalleryPhotoCreate.mockResolvedValue({});

    await addPhotosToGallery("gal-1", [
      { url: "https://img.jpg", publicId: "photographe/img", title: "img", isGalleryCover: false },
    ]);

    expect(mockGalleryPhotoUpdateMany).not.toHaveBeenCalled();
  });

  it("reset les couvertures existantes si une photo est marquée isGalleryCover", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-1" });
    mockGalleryPhotoUpdateMany.mockResolvedValue({});
    mockPhotoCreate.mockResolvedValue({ id: "photo-1" });
    mockGalleryPhotoCreate.mockResolvedValue({});

    await addPhotosToGallery("gal-1", [
      { url: "https://img.jpg", publicId: "photographe/img", title: "img", isGalleryCover: true },
    ]);

    expect(mockGalleryPhotoUpdateMany).toHaveBeenCalledWith({
      where: { galleryId: "gal-1" },
      data: { isGalleryCover: false },
    });
  });

  it("crée un Photo et un GalleryPhoto pour chaque photo", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-1" });
    mockPhotoCreate
      .mockResolvedValueOnce({ id: "photo-1" })
      .mockResolvedValueOnce({ id: "photo-2" });
    mockGalleryPhotoCreate.mockResolvedValue({});

    await addPhotosToGallery("gal-1", [
      { url: "https://a.jpg", publicId: "photographe/a", title: "a", isGalleryCover: false },
      { url: "https://b.jpg", publicId: "photographe/b", title: "b", isGalleryCover: false },
    ]);

    expect(mockPhotoCreate).toHaveBeenCalledTimes(2);
    expect(mockGalleryPhotoCreate).toHaveBeenCalledTimes(2);
  });

  it("retourne success:true quand tout se passe bien", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-1" });
    mockPhotoCreate.mockResolvedValue({ id: "photo-1" });
    mockGalleryPhotoCreate.mockResolvedValue({});

    const result = await addPhotosToGallery("gal-1", [
      { url: "https://img.jpg", publicId: "photographe/img", title: "img", isGalleryCover: false },
    ]);

    expect(result).toEqual({ success: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("addPhotoToGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await addPhotoToGallery("gal-1", "https://img.jpg", "photographe/img", "titre");
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne une erreur si la galerie est introuvable", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue(null);
    const result = await addPhotoToGallery("gal-inexistante", "https://img.jpg", "photographe/img", "titre");
    expect(result.error).toBe("Galerie introuvable");
  });

  it("retourne success:true quand tout se passe bien", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-1" });
    mockPhotoCreate.mockResolvedValue({ id: "photo-1" });
    mockGalleryPhotoCreate.mockResolvedValue({});

    const result = await addPhotoToGallery("gal-1", "https://img.jpg", "photographe/img", "titre");
    expect(result).toEqual({ success: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("deletePhotos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await deletePhotos(["photo-1"]);
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne success:true immédiatement si aucune photo trouvée en base", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPhotoFindMany.mockResolvedValue([]);

    const result = await deletePhotos(["id-inexistant"]);

    expect(result).toEqual({ success: true });
    expect(mockDeleteCloudinaryPhotos).not.toHaveBeenCalled();
    expect(mockPhotoDeleteMany).not.toHaveBeenCalled();
  });

  it("supprime les photos de Cloudinary et de la base", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetCloudinaryConfig.mockResolvedValue({});
    mockPhotoFindMany.mockResolvedValue([
      { id: "photo-1", publicId: "photographe/photo-1" },
    ]);
    mockDeleteCloudinaryPhotos.mockResolvedValue(undefined);
    mockPhotoDeleteMany.mockResolvedValue({ count: 1 });

    const result = await deletePhotos(["photo-1"]);

    expect(mockDeleteCloudinaryPhotos).toHaveBeenCalledOnce();
    expect(mockPhotoDeleteMany).toHaveBeenCalledOnce();
    expect(result).toEqual({ success: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("movePhotos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await movePhotos(["photo-1"], "gal-cible");
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne une erreur si la galerie cible est introuvable", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue(null);
    const result = await movePhotos(["photo-1"], "gal-inexistante");
    expect(result.error).toBe("Galerie introuvable");
  });

  it("supprime les anciens liens et crée les nouveaux", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-cible" });
    mockPhotoFindMany.mockResolvedValue([{ id: "photo-1" }, { id: "photo-2" }]);
    mockGalleryPhotoDeleteMany.mockResolvedValue({});
    mockGalleryPhotoCreateMany.mockResolvedValue({});

    await movePhotos(["photo-1", "photo-2"], "gal-cible");

    expect(mockGalleryPhotoDeleteMany).toHaveBeenCalledWith({
      where: { photoId: { in: ["photo-1", "photo-2"] } },
    });
    expect(mockGalleryPhotoCreateMany).toHaveBeenCalledWith({
      data: [
        { galleryId: "gal-cible", photoId: "photo-1" },
        { galleryId: "gal-cible", photoId: "photo-2" },
      ],
    });
  });

  it("retourne success:true quand tout se passe bien", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-cible" });
    mockPhotoFindMany.mockResolvedValue([{ id: "photo-1" }]);
    mockGalleryPhotoDeleteMany.mockResolvedValue({});
    mockGalleryPhotoCreateMany.mockResolvedValue({});

    const result = await movePhotos(["photo-1"], "gal-cible");
    expect(result).toEqual({ success: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("renamePhoto", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await renamePhoto("photo-1", "nouveau-titre");
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne une erreur si le titre produit un slug vide", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const result = await renamePhoto("photo-1", "---!!!---");
    expect(result.error).toBe("Titre invalide.");
  });

  it("retourne une erreur si la photo est introuvable", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPhotoFindUnique.mockResolvedValue(null);
    const result = await renamePhoto("photo-inexistante", "nouveau-titre");
    expect(result.error).toBe("Photo introuvable.");
  });

  it("retourne une erreur si une photo avec ce nom existe déjà", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPhotoFindUnique.mockResolvedValue({ publicId: "photographe/ancien" });
    mockPhotoFindFirst.mockResolvedValue({ id: "photo-autre" });
    const result = await renamePhoto("photo-1", "doublon");
    expect(result.error).toBe("Une photo avec ce nom existe déjà.");
  });

  it("retourne success:true quand le renommage réussit", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPhotoFindUnique.mockResolvedValue({ publicId: "photographe/ancien" });
    mockPhotoFindFirst.mockResolvedValue(null);
    mockGetCloudinaryConfig.mockResolvedValue({});
    mockCloudinaryRename.mockResolvedValue({ secure_url: "https://new.jpg" });
    mockPhotoUpdate.mockResolvedValue({});

    const result = await renamePhoto("photo-1", "nouveau-titre");
    expect(result).toEqual({ success: true });
  });
});
