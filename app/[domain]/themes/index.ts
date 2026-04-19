import { defaultTheme } from "./default";
import { argentic } from "./argentic";
import { sepia } from "./sepia";
import { evenement } from "./evenement";
import { nature } from "./nature";
import { voyage } from "./voyage";
import { portrait } from "./portrait";
import { street } from "./street";
import { cinema } from "./cinema";

export type Theme = {
  "--color-bg": string;
  "--color-primary": string;
  "--color-secondary": string;
  "--color-text": string;
  "--color-muted": string;
  "--font-heading": string;
  "--font-body": string;
};

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  argentic,
  sepia,
  evenement,
  nature,
  voyage,
  portrait,
  street,
  cinema,
};
