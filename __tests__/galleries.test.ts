import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetAuthenticatedUser = vi.fn();
const mockGalleryFindUnique = vi.fn();
const mockGalleryUpdate = vi.fn();
const mockGalleryUpdateMany = vi.fn();
const mockGalleryDelete = vi.fn();
const mockPhotoFindMany = vi.fn();
const mockPhotoDeleteMany = vi.fn();
const mockDeleteCloudinaryPhotos = vi.fn();
const mockGetCloudinaryConfig = vi.fn().mockResolvedValue({});
const mockSendShareEmail = vi.fn();

vi.mock("@/app/lib/auth-guard", () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("cloudinary", () => ({ v2: { config: vi.fn() } }));

vi.mock("@/app/lib/prisma", () => ({
  default: {
    gallery: {
      findUnique: mockGalleryFindUnique,
      update: mockGalleryUpdate,
      updateMany: mockGalleryUpdateMany,
      delete: mockGalleryDelete,
    },
    photo: {
      findMany: mockPhotoFindMany,
      deleteMany: mockPhotoDeleteMany,
    },
  },
}));

vi.mock("@/app/lib/cloudinary", () => ({
  getCloudinaryConfig: mockGetCloudinaryConfig,
  deleteCloudinaryPhotos: mockDeleteCloudinaryPhotos,
}));

vi.mock("@/app/lib/mail", () => ({
  sendGalleryShareEmail: mockSendShareEmail,
}));

vi.mock("@/app/lib/validators", () => ({
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
}));

const { deleteGallery, updateGallery, setFeaturedGallery, shareGallery } =
  await import("@/app/(admin)/actions/galleries");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("deleteGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
    const result = await deleteGallery("gal-1");
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne une erreur si la galerie est introuvable", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGetCloudinaryConfig.mockResolvedValue({});
    mockGalleryFindUnique.mockResolvedValue(null);
    const result = await deleteGallery("gal-inexistante");
    expect(result.error).toBe("Galerie introuvable");
  });

  it("ne supprime pas les photos partagées avec d'autres galeries", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGetCloudinaryConfig.mockResolvedValue({});
    mockGalleryFindUnique.mockResolvedValue({
      id: "gal-1",
      photos: [{ photoId: "photo-1" }],
    });
    // photo-1 est dans 2 galeries → pas exclusive
    mockPhotoFindMany.mockResolvedValue([
      { id: "photo-1", publicId: "photographe/photo-1", _count: { galleries: 2 } },
    ]);
    mockGalleryDelete.mockResolvedValue({});

    await deleteGallery("gal-1");

    expect(mockDeleteCloudinaryPhotos).toHaveBeenCalledWith([]);
    expect(mockPhotoDeleteMany).not.toHaveBeenCalled();
  });

  it("supprime les photos exclusives de Cloudinary et de la base", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGetCloudinaryConfig.mockResolvedValue({});
    mockGalleryFindUnique.mockResolvedValue({
      id: "gal-1",
      photos: [{ photoId: "photo-1" }],
    });
    // photo-1 est dans 1 seule galerie → exclusive
    mockPhotoFindMany.mockResolvedValue([
      { id: "photo-1", publicId: "photographe/photo-1", _count: { galleries: 1 } },
    ]);
    mockDeleteCloudinaryPhotos.mockResolvedValue(undefined);
    mockPhotoDeleteMany.mockResolvedValue({ count: 1 });
    mockGalleryDelete.mockResolvedValue({});

    await deleteGallery("gal-1");

    expect(mockDeleteCloudinaryPhotos).toHaveBeenCalledWith([
      { id: "photo-1", publicId: "photographe/photo-1", _count: { galleries: 1 } },
    ]);
    expect(mockPhotoDeleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["photo-1"] } },
    });
  });

  it("retourne success:true quand tout se passe bien", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGetCloudinaryConfig.mockResolvedValue({});
    mockGalleryFindUnique.mockResolvedValue({ id: "gal-1", photos: [] });
    mockPhotoFindMany.mockResolvedValue([]);
    mockDeleteCloudinaryPhotos.mockResolvedValue(undefined);
    mockGalleryDelete.mockResolvedValue({});

    const result = await deleteGallery("gal-1");
    expect(result).toEqual({ success: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("updateGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
    const result = await updateGallery("gal-1", { name: "Nom", description: "" });
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne une erreur si le nom est vide", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    const result = await updateGallery("gal-1", { name: "   ", description: "" });
    expect(result.error).toBe("Le nom est requis");
  });

  it("retourne success:true quand la mise à jour réussit", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryUpdate.mockResolvedValue({});

    const result = await updateGallery("gal-1", { name: "Nouveau nom", description: "desc" });
    expect(result).toEqual({ success: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("setFeaturedGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
    const result = await setFeaturedGallery("gal-1");
    expect(result.error).toBe("Non autorisé");
  });

  it("retire isPremium de toutes les galeries avant de mettre en avant", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryUpdateMany.mockResolvedValue({});
    mockGalleryUpdate.mockResolvedValue({});

    await setFeaturedGallery("gal-1");

    expect(mockGalleryUpdateMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      data: { isPremium: false },
    });
  });

  it("met isPremium:true uniquement sur la galerie ciblée", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryUpdateMany.mockResolvedValue({});
    mockGalleryUpdate.mockResolvedValue({});

    await setFeaturedGallery("gal-1");

    expect(mockGalleryUpdate).toHaveBeenCalledWith({
      where: { id: "gal-1", userId: "user-1" },
      data: { isPremium: true },
    });
  });

  it("retourne success:true quand tout se passe bien", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryUpdateMany.mockResolvedValue({});
    mockGalleryUpdate.mockResolvedValue({});

    const result = await setFeaturedGallery("gal-1");
    expect(result).toEqual({ success: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("shareGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
    const result = await shareGallery("gal-1", "test@example.com");
    expect(result.error).toBe("Non autorisé");
  });

  it("retourne une erreur si l'email est invalide", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    const result = await shareGallery("gal-1", "pas-un-email");
    expect(result.error).toBe("Email invalide");
  });

  it("retourne une erreur si la galerie est introuvable", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryFindUnique.mockResolvedValue(null);
    const result = await shareGallery("gal-inexistante", "test@example.com");
    expect(result.error).toBe("Galerie introuvable");
  });

  it("retourne success:true après l'envoi de l'email", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryFindUnique.mockResolvedValue({ token: "tok-abc", name: "Ma galerie" });
    mockSendShareEmail.mockResolvedValue(undefined);

    const result = await shareGallery("gal-1", "client@example.com");
    expect(result).toEqual({ success: true });
  });
});
