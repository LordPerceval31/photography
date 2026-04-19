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

const FULL: Capabilities = {
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

export function getCapabilities(slug: string | undefined | null): Capabilities {
  switch (slug) {
    case "one-page":
      return ONE_PAGE;
    default:
      return FULL;
  }
}
