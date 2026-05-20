import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Connexion à  l'instance Redis Upstash
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Création du limiteur : 5 tentatives par tranche de 10 minutes
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const loginEmailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit:email",
});

// Plus restrictif : 3 tentatives par 15 minutes (anti-spam mail)
export const forgotPasswordRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit:forgot",
});

// Invitations galerie : 10 créations par heure (anti-spam email)
export const galleryInviteRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit:gallery-invite",
});

// Formulaire de contact landing : 3 envois par 30 minutes (anti-spam)
export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "30 m"),
  analytics: true,
  prefix: "@upstash/ratelimit:contact",
});
