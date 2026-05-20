import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetAuthenticatedUser = vi.fn();
const mockGalleryCreate = vi.fn();
const mockPhotoCreate = vi.fn();
const mockGalleryPhotoCreate = vi.fn();
const mockGalleryGuestCreate = vi.fn();
const mockSecretPasswordCreate = vi.fn();
const mockRateLimit = vi.fn();
const mockSendInviteEmail = vi.fn();
const mockQstashPublish = vi.fn();

vi.mock("@/app/lib/auth-guard", () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/app/lib/prisma", () => ({
  default: {
    gallery: { create: mockGalleryCreate },
    photo: { create: mockPhotoCreate },
    galleryPhoto: { create: mockGalleryPhotoCreate },
    galleryGuest: { create: mockGalleryGuestCreate },
    secretPassword: { create: mockSecretPasswordCreate },
  },
}));

vi.mock("@/app/lib/ratelimit", () => ({
  galleryInviteRateLimit: { limit: mockRateLimit },
}));

vi.mock("@/app/lib/mail", () => ({
  sendGalleryInviteEmail: mockSendInviteEmail,
}));

vi.mock("@/app/lib/validators", () => ({
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
}));

vi.mock("@upstash/qstash", () => ({
  Client: vi.fn(function (this: { publishJSON: typeof mockQstashPublish }) {
    this.publishJSON = mockQstashPublish;
  }),
}));

const { createGallery } = await import("@/app/(admin)/actions/createGallery");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseInput = {
  name: "Ma galerie",
  description: "Une description",
  isPremium: false,
  isPrivate: false,
  expiresIn: "1d" as const,
  emails: [],
  photos: [],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si la session est expirée", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
    const result = await createGallery(baseInput);
    expect(result.error).toBe("Session expirée.");
  });

  it("retourne une erreur si le nom est vide", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    const result = await createGallery({ ...baseInput, name: "   " });
    expect(result.error).toBe("Le titre est requis.");
  });

  it("retourne une erreur si la liste d'emails dépasse 50", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockRateLimit.mockResolvedValue({ success: true });
    const tooManyEmails = Array.from({ length: 51 }, (_, i) => `user${i}@test.com`);
    const result = await createGallery({
      ...baseInput,
      isPrivate: true,
      emails: tooManyEmails,
    });
    expect(result.error).toBe("Maximum 50 destinataires par galerie.");
  });

  it("retourne une erreur si un email est invalide", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockRateLimit.mockResolvedValue({ success: true });
    const result = await createGallery({
      ...baseInput,
      isPrivate: true,
      emails: ["valide@test.com", "pas-un-email"],
    });
    expect(result.error).toBe("Email invalide : pas-un-email");
  });

  it("retourne une erreur si le rate limit est atteint pour les galeries privées", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockRateLimit.mockResolvedValue({ success: false });
    const result = await createGallery({ ...baseInput, isPrivate: true });
    expect(result.error).toBe("Trop de galeries créées. Réessaie dans une heure.");
  });

  it("galerie publique : crée la galerie avec expiresAt null", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryCreate.mockResolvedValue({ id: "gal-1", token: "tok-abc" });

    await createGallery({ ...baseInput, isPrivate: false });

    expect(mockGalleryCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ expiresAt: null }) }),
    );
  });

  it("galerie privée : crée la galerie avec une date d'expiration dans le futur", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockRateLimit.mockResolvedValue({ success: true });
    mockGalleryCreate.mockResolvedValue({ id: "gal-1", token: "tok-abc" });
    mockQstashPublish.mockResolvedValue({});

    const before = Date.now();
    await createGallery({ ...baseInput, isPrivate: true, expiresIn: "7d" });
    const after = Date.now();

    const callArg = mockGalleryCreate.mock.calls[0][0] as {
      data: { expiresAt: Date };
    };
    const expiresAt = callArg.data.expiresAt.getTime();

    expect(expiresAt).toBeGreaterThan(before + 6 * 24 * 60 * 60 * 1000);
    expect(expiresAt).toBeLessThanOrEqual(after + 7 * 24 * 60 * 60 * 1000);
  });

  it("retourne success:true et le galleryId sur succès", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryCreate.mockResolvedValue({ id: "gal-42", token: "tok-xyz" });

    const result = await createGallery(baseInput);

    expect(result).toEqual({ success: true, galleryId: "gal-42" });
  });

  it("crée les photos et les liens GalleryPhoto pour chaque photo fournie", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    mockGalleryCreate.mockResolvedValue({ id: "gal-1", token: "tok-abc" });
    mockPhotoCreate
      .mockResolvedValueOnce({ id: "photo-1" })
      .mockResolvedValueOnce({ id: "photo-2" });
    mockGalleryPhotoCreate.mockResolvedValue({});

    await createGallery({
      ...baseInput,
      photos: [
        { url: "https://a.jpg", publicId: "photographe/a", title: "a", isGalleryCover: true },
        { url: "https://b.jpg", publicId: "photographe/b", title: "b", isGalleryCover: false },
      ],
    });

    expect(mockPhotoCreate).toHaveBeenCalledTimes(2);
    expect(mockGalleryPhotoCreate).toHaveBeenCalledTimes(2);
  });
});
