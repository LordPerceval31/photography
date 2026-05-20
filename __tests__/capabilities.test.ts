import { describe, it, expect } from "vitest";
import { getCapabilities } from "@/app/lib/capabilities";

describe("getCapabilities", () => {
  // ─── premium ───────────────────────────────────────────────────────────────

  it("premium : toutes les fonctionnalités sont activées", () => {
    const cap = getCapabilities("premium");
    expect(cap.services).toBe(true);
    expect(cap.shareGalleries).toBe(true);
    expect(cap.aboutPhotos).toBe(true);
  });

  it("premium : tous les champs vitrine sont activés", () => {
    const cap = getCapabilities("premium");
    expect(cap.vitrineFields.heroSubtitle).toBe(true);
    expect(cap.vitrineFields.bioTitle).toBe(true);
    expect(cap.vitrineFields.story).toBe(true);
    expect(cap.vitrineFields.darkQuote).toBe(true);
  });

  // ─── three-pages ───────────────────────────────────────────────────────────

  it("three-pages : services et partage désactivés", () => {
    const cap = getCapabilities("three-pages");
    expect(cap.services).toBe(false);
    expect(cap.shareGalleries).toBe(false);
  });

  it("three-pages : bioTitle et story activés, heroSubtitle et darkQuote non", () => {
    const cap = getCapabilities("three-pages");
    expect(cap.vitrineFields.bioTitle).toBe(true);
    expect(cap.vitrineFields.story).toBe(true);
    expect(cap.vitrineFields.heroSubtitle).toBe(false);
    expect(cap.vitrineFields.darkQuote).toBe(false);
  });

  // ─── two-pages ─────────────────────────────────────────────────────────────

  it("two-pages : toutes les fonctionnalités désactivées", () => {
    const cap = getCapabilities("two-pages");
    expect(cap.services).toBe(false);
    expect(cap.shareGalleries).toBe(false);
    expect(cap.aboutPhotos).toBe(false);
  });

  it("two-pages : tous les champs vitrine désactivés", () => {
    const cap = getCapabilities("two-pages");
    expect(cap.vitrineFields.heroSubtitle).toBe(false);
    expect(cap.vitrineFields.bioTitle).toBe(false);
    expect(cap.vitrineFields.story).toBe(false);
    expect(cap.vitrineFields.darkQuote).toBe(false);
  });

  // ─── one-page ──────────────────────────────────────────────────────────────

  it("one-page : toutes les fonctionnalités désactivées", () => {
    const cap = getCapabilities("one-page");
    expect(cap.services).toBe(false);
    expect(cap.shareGalleries).toBe(false);
    expect(cap.aboutPhotos).toBe(false);
  });

  it("one-page : tous les champs vitrine désactivés", () => {
    const cap = getCapabilities("one-page");
    expect(cap.vitrineFields.heroSubtitle).toBe(false);
    expect(cap.vitrineFields.bioTitle).toBe(false);
    expect(cap.vitrineFields.story).toBe(false);
    expect(cap.vitrineFields.darkQuote).toBe(false);
  });

  // ─── fallback ──────────────────────────────────────────────────────────────

  it("slug inconnu retourne les capabilities premium (fallback)", () => {
    const cap = getCapabilities("template-inexistant");
    expect(cap.services).toBe(true);
    expect(cap.shareGalleries).toBe(true);
    expect(cap.aboutPhotos).toBe(true);
  });

  it("slug undefined retourne les capabilities premium (fallback)", () => {
    const cap = getCapabilities(undefined);
    expect(cap.services).toBe(true);
    expect(cap.aboutPhotos).toBe(true);
  });

  it("slug null retourne les capabilities premium (fallback)", () => {
    const cap = getCapabilities(null);
    expect(cap.services).toBe(true);
    expect(cap.aboutPhotos).toBe(true);
  });
});
