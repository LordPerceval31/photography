<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the photographer portfolio site. Here's a summary of what was done:

- **`instrumentation-client.ts`** created at project root — initializes PostHog client-side using the Next.js 15.3+ recommended approach, with exception capture and EU region host.
- **`next.config.ts`** updated — added reverse proxy rewrites so PostHog requests go through `/ingest` (avoids ad-blockers, improves data quality).
- **`.env.local`** updated — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` set securely.
- **5 files instrumented** with `posthog.capture()` calls covering all major visitor interactions.

| Event | Description | File |
|---|---|---|
| `premium_gallery_opened` | Visitor clicks "Voir la collection" on the home page premium gallery | `app/[domain]/home/PremiumGallerySection.tsx` |
| `photo_opened_in_lightbox` | Visitor clicks a photo in the masonry gallery | `app/[domain]/gallery/background.tsx` |
| `lightbox_navigated` | Visitor navigates between photos in the lightbox (arrow, swipe, or keyboard) | `app/[domain]/_components/lightbox.tsx` |
| `lightbox_closed` | Visitor closes the lightbox (button or keyboard Escape) | `app/[domain]/_components/lightbox.tsx` |
| `contact_form_submitted` | Contact form successfully sent via EmailJS | `app/[domain]/services/ContactSection.tsx` |
| `contact_form_failed` | Contact form submission failed (EmailJS error, also captured as exception) | `app/[domain]/services/ContactSection.tsx` |
| `nav_link_clicked` | Visitor clicks a navigation link (home, about, gallery, services) | `app/[domain]/_components/navBar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/155476/dashboard/609781
- **Visitor engagement overview** (daily unique users across gallery, lightbox, contact): https://eu.posthog.com/project/155476/insights/URs7pBDK
- **Gallery engagement funnel** (photo opened → lightbox navigated): https://eu.posthog.com/project/155476/insights/sKcNlZYk
- **Contact form success vs failure**: https://eu.posthog.com/project/155476/insights/UqJXpHSW
- **Navigation clicks by destination**: https://eu.posthog.com/project/155476/insights/QndCm0QZ
- **Lightbox navigation method breakdown** (arrow / swipe / keyboard): https://eu.posthog.com/project/155476/insights/1Is8rj9k

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
