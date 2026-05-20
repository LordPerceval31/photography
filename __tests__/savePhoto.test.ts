import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockAuth = vi.fn();
const mockDeleteMany = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockCloudinaryConfig = vi.fn();
const mockDestroy = vi.fn();
const mockGetCloudinaryConfig = vi.fn();

vi.mock("@/auth", () => ({ auth: mockAuth }));

vi.mock("@/app/lib/prisma", () => ({
  default: {
    photo: {
      findFirst: mockFindFirst,
      deleteMany: mockDeleteMany,
      create: mockCreate,
    },
  },
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: mockCloudinaryConfig,
    uploader: { destroy: mockDestroy },
  },
}));

vi.mock("@/app/lib/cloudinary", () => ({
  getCloudinaryConfig: mockGetCloudinaryConfig,
}));

// Import APRÈS les mocks
const { savePhoto } = await import("@/app/(admin)/actions/savePhoto");

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("savePhoto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne une erreur si la session est expirée", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await savePhoto("https://img.jpg", "photographe/iscover", "isCover");
    expect(result.error).toBe("Session expirée.");
  });

  it("retourne une erreur si Cloudinary n'est pas configuré", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetCloudinaryConfig.mockRejectedValue(new Error("non configuré"));
    const result = await savePhoto("https://img.jpg", "photographe/iscover", "isCover");
    expect(result.error).toBe("Configure tes credentials Cloudinary dans les Paramètres.");
  });

  it("supprime l'ancienne photo Cloudinary si le publicId a changé", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetCloudinaryConfig.mockResolvedValue({ cloud_name: "test", api_key: "k", api_secret: "s" });
    mockCloudinaryConfig.mockReturnValue(undefined);
    // Ancienne photo avec un publicId différent
    mockFindFirst.mockResolvedValue({ publicId: "photographe/ancienne-cover" });
    mockDeleteMany.mockResolvedValue({ count: 1 });
    mockCreate.mockResolvedValue({ id: "photo-1" });

    await savePhoto("https://img.jpg", "photographe/iscover", "isCover");

    expect(mockDestroy).toHaveBeenCalledWith("photographe/ancienne-cover");
  });

  it("ne supprime PAS Cloudinary si le publicId est identique (déjà remplacé)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetCloudinaryConfig.mockResolvedValue({ cloud_name: "test", api_key: "k", api_secret: "s" });
    mockCloudinaryConfig.mockReturnValue(undefined);
    // Même publicId → Cloudinary a déjà été remplacé lors de l'upload
    mockFindFirst.mockResolvedValue({ publicId: "photographe/iscover" });
    mockDeleteMany.mockResolvedValue({ count: 1 });
    mockCreate.mockResolvedValue({ id: "photo-1" });

    await savePhoto("https://img.jpg", "photographe/iscover", "isCover");

    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it("retourne success:true quand tout se passe bien", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetCloudinaryConfig.mockResolvedValue({ cloud_name: "test", api_key: "k", api_secret: "s" });
    mockCloudinaryConfig.mockReturnValue(undefined);
    mockFindFirst.mockResolvedValue(null);
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreate.mockResolvedValue({ id: "photo-new" });

    const result = await savePhoto("https://img.jpg", "photographe/iscover", "isCover");

    expect(result).toEqual({ success: true });
  });

  it("retourne une erreur générique si Prisma échoue au create", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetCloudinaryConfig.mockResolvedValue({ cloud_name: "test", api_key: "k", api_secret: "s" });
    mockCloudinaryConfig.mockReturnValue(undefined);
    mockFindFirst.mockResolvedValue(null);
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await savePhoto("https://img.jpg", "photographe/iscover", "isCover");

    expect(result.error).toBe("Erreur lors de la sauvegarde de la photo.");
  });
});
