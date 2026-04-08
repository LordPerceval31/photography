"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Ce composant ne rend rien visuellement.
// Il enregistre le domaine du photographe comme "super propriété" PostHog :
// toutes les pages vues et tous les événements suivants incluront automatiquement
// { photographer_domain: "jean.photolio.fr" }
const PostHogDomainTracker = ({ domain }: { domain: string }) => {
  useEffect(() => {
    posthog.register({ photographer_domain: domain });
  }, [domain]);

  return null;
};

export default PostHogDomainTracker;
