import { describe, it, expect } from "vitest";
import { titleToSlug } from "@/app/lib/cloudinary";

describe("titleToSlug", () => {
  it("convertit les espaces en tirets", () => {
    expect(titleToSlug("mon portrait")).toBe("mon-portrait");
  });

  it("met tout en minuscules", () => {
    expect(titleToSlug("MonPortrait")).toBe("monportrait");
  });

  it("supprime les accents", () => {
    expect(titleToSlug("été pluvieux")).toBe("ete-pluvieux");
  });

  it("supprime les caractères spéciaux", () => {
    expect(titleToSlug("photo & vidéo!")).toBe("photo-video");
  });

  it("supprime les tirets en début et fin", () => {
    expect(titleToSlug("  portrait  ")).toBe("portrait");
  });

  it("convertit un slot camelCase (isCover → iscover)", () => {
    expect(titleToSlug("isCover")).toBe("iscover");
  });

  it("convertit isPortrait correctement", () => {
    expect(titleToSlug("isPortrait")).toBe("isportrait");
  });

  it("retourne une chaîne vide si l'entrée est vide", () => {
    expect(titleToSlug("")).toBe("");
  });

  it("gère les chiffres", () => {
    expect(titleToSlug("photo 2024")).toBe("photo-2024");
  });
});
