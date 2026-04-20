export type Capabilities = {
  services: boolean;
  shareGalleries: boolean;
  aboutPhotos: boolean;
  vitrineFields: {
    heroSubtitle: boolean;
    bioTitle: boolean;
    story: boolean;
    darkQuote: boolean;
  };
};

const PREMIUM: Capabilities = {
  services: true,
  shareGalleries: true,
  aboutPhotos: true,
  vitrineFields: {
    heroSubtitle: true,
    bioTitle: true,
    story: true,
    darkQuote: true,
  },
};

const THREE_PAGES: Capabilities = {
  services: false,
  shareGalleries: false,
  aboutPhotos: false,
  vitrineFields: {
    heroSubtitle: false,
    bioTitle: true,
    story: true,
    darkQuote: false,
  },
};

const TWO_PAGES: Capabilities = {
  services: false,
  shareGalleries: false,
  aboutPhotos: false,
  vitrineFields: {
    heroSubtitle: false,
    bioTitle: false,
    story: false,
    darkQuote: false,
  },
};

const ONE_PAGE: Capabilities = {
  services: false,
  shareGalleries: false,
  aboutPhotos: false,
  vitrineFields: {
    heroSubtitle: false,
    bioTitle: false,
    story: false,
    darkQuote: false,
  },
};

export function getCapabilities(slug: string | undefined | null): Capabilities {
  switch (slug) {
    case "premium":
      return PREMIUM;
    case "three-pages":
      return THREE_PAGES;
    case "two-pages":
      return TWO_PAGES;
    case "one-page":
      return ONE_PAGE;
    default:
      return PREMIUM;
  }
}
