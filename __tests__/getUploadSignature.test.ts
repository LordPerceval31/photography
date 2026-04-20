import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockAuth = vi.fn();
const mockFindFirst = vi.fn();
const mockGetCloudinaryConfig = vi.fn();
const mockApiSignRequest = vi.fn().mockReturnValue("fake-signature");

vi.mock("@/auth", () => ({ auth: mockAuth }));

vi.mock("@/app/lib/prisma", () => ({
  default: {
    photo: { findFirst: mockFindFirst },
  },
}));

vi.mock("@/app/lib/cloudinary", () => ({
  CLOUDINARY_FOLDER: "photographe",
  titleToSlug: (t: string) =>
    t.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  getCloudinaryConfig: mockGetCloudinaryConfig,
}));

vi.mock("cloudinary", () => ({
  v2: {
    utils: { api_sign_request: mockApiSignRequest },
  },
}));

const { getUploadSignature } = await import(
  "@/app/(admin)/actions/getUploadSignature"
);

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("getUploadSignature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiSignRequest.mockReturnValue("fake-signature");
  });

  it("retourne une erreur si la session est expirée", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await getUploadSignature("mon-titre");
    expect(result.error).toBe("Session expirée.");
  });

  it("retourne une erreur si le titre est vide", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const result = await getUploadSignature("   ");
    expect(result.error).toBe("Le titre est requis.");
  });

  it("retourne une erreur si Cloudinary n'est pas configuré", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(null);
    mockGetCloudinaryConfig.mockRejectedValue(new Error("non configuré"));
    const result = await getUploadSignature("mon-titre");
    expect(result.error).toBe(
      "Configure tes credentials Cloudinary dans les Paramètres."
    );
  });

  it("bloque si un doublon existe et allowReplace=false (défaut)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue({ id: "photo-existante" });
    const result = await getUploadSignature("mon-titre");
    expect(result.error).toBe("Une photo avec ce nom existe déjà.");
  });

  it("autorise le doublon si allowReplace=true", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetCloudinaryConfig.mockResolvedValue({
      cloud_name: "demo",
      api_key: "key",
      api_secret: "secret",
    });
    const result = await getUploadSignature("isCover", true);
    expect(result.error).toBeUndefined();
    expect(result.signature).toBe("fake-signature");
  });

  it("retourne signature, timestamp, cloudName, apiKey et publicId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValue(null);
    mockGetCloudinaryConfig.mockResolvedValue({
      cloud_name: "mon-cloud",
      api_key: "ma-cle",
      api_secret: "mon-secret",
    });
    const result = await getUploadSignature("portrait");
    expect(result.signature).toBe("fake-signature");
    expect(result.cloudName).toBe("mon-cloud");
    expect(result.apiKey).toBe("ma-cle");
    expect(result.publicId).toBe("photographe/portrait");
    expect(typeof result.timestamp).toBe("number");
  });
});
