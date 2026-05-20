"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const MentionsLegalesModal = ({ open, onClose }: Props) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    // Conteneur global : gère le fond ET le panneau ensemble en une seule transition
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
      onClick={onClose}
    >
      {/* Panneau : transition uniquement sur le translate pour l'effet de slide */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentions-modal-title"
        className={`relative glass-card rounded-2xl p-12 w-full max-w-4xl 2k:max-w-6xl 4k:max-w-600 max-h-[90vh] 4k:max-h-[85vh] overflow-y-auto scrollbar-thin transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-6"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-6 right-6 text-cream/40 hover:text-cream transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        <h2 id="mentions-modal-title" className="text-3xl font-bold text-cream mb-10">
          Mentions légales, Confidentialité, CGU & CGV
        </h2>

        <div className="space-y-8 text-base 2k:text-lg 4k:text-3xl text-cream/60 leading-relaxed">
          {/* --- PARTIE 1 : MENTIONS LEGALES --- */}
          <div className="mb-6 border-b border-cream/20 pb-2">
            <span className="uppercase tracking-widest text-xs font-bold text-cream/40">
              Partie 1 : Informations légales
            </span>
          </div>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              1. Éditeur du site
            </h3>
            <p className="mb-2">
              Le site Photolio est édité à titre non professionnel par{" "}
              <strong>Sylvain DE LUCA</strong> (agissant sous le nom commercial
              Levynix Studio).
              <br />
              <strong>Contact :</strong>{" "}
              <a
                href="mailto:levynix.studio@gmail.com"
                className="underline underline-offset-4 hover:text-cream transition-colors"
              >
                levynix.studio@gmail.com
              </a>
              <br />
              <strong>Site web :</strong>{" "}
              <a
                href="https://levynixstudio.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-cream transition-colors"
              >
                levynixstudio.netlify.app
              </a>
            </p>
            <p className="text-sm italic opacity-80">
              Conformément aux dispositions de l&apos;article 1er-1 de la loi n°
              2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie
              numérique, dans sa version en vigueur, l&apos;éditeur a choisi de
              conserver son anonymat. Ses coordonnées exactes ont été transmises
              à l&apos;hébergeur du site, qui est tenu au secret professionnel
              sauf réquisition judiciaire.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              2. Directeur de la publication
            </h3>
            <p>
              Conformément à l&apos;article 93-2 de la loi n° 82-652 du 29
              juillet 1982 sur la communication audiovisuelle, le Directeur de
              la publication est Sylvain DE LUCA.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              3. Hébergement et infrastructure technique
            </h3>
            <p className="mb-2">
              Conformément à la loi n° 2004-575 du 21 juin 2004 pour la
              confiance dans l&apos;économie numérique, le site est hébergé par
              la société <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133
              Walnut, CA 91789, États-Unis).
            </p>
            <p>
              Les données sont traitées par le biais des sous-traitants
              ultérieurs suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Base de données (Neon, Inc.) :</strong> Hébergée au
                Royaume-Uni (bénéficiant d&apos;une décision d&apos;adéquation
                de la Commission européenne).
              </li>
              <li>
                <strong>Fichiers médias (Cloudinary Ltd.) :</strong> Hébergés
                sur des serveurs situés au sein de l&apos;Union européenne.
              </li>
              <li>
                <strong>Performances et sécurité (Upstash, Inc.) :</strong>{" "}
                Données de transit éphémères pour le rate-limiting et les tâches
                planifiées.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              4. Propriété intellectuelle
            </h3>
            <p>
              Conformément aux dispositions de la loi n° 92-597 du 1er juillet
              1992 relative au code de la propriété intellectuelle (partie
              Législative), et notamment de son article L. 111-1, la structure
              générale du site, ainsi que les textes, graphismes et logos sont
              la propriété exclusive de l&apos;éditeur. Toute reproduction,
              totale ou partielle, est strictement interdite sans autorisation
              préalable.
              <br />
              <br />
              <strong>Cas des galeries privées :</strong> Les photographies
              mises en ligne par les utilisateurs (photographes) sur leurs
              galeries respectives restent leur propriété exclusive (ou celle de
              leurs clients respectifs). Photolio n&apos;acquiert aucun droit
              sur les contenus importés par ses membres.
            </p>
          </section>

          {/* --- PARTIE 2 : RGPD --- */}
          <div className="mt-12 mb-6 border-b border-cream/20 pb-2">
            <span className="uppercase tracking-widest text-xs font-bold text-cream/40">
              Partie 2 : Données personnelles (RGPD)
            </span>
          </div>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              5. Cadre légal et confidentialité
            </h3>
            <p>
              La présente politique est formulée conformément au Règlement (UE)
              2016/679 du Parlement européen et du Conseil du 27 avril 2016
              (RGPD) et à la loi n° 78-17 du 6 janvier 1978 relative à
              l&apos;informatique, aux fichiers et aux libertés dans sa version
              en vigueur. Elle régit la manière dont Photolio collecte, traite
              et protège les données de ses utilisateurs.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              6. Rôles et responsabilités (Art. 24 et 28 du RGPD)
            </h3>
            <p>
              La plateforme Photolio intervient sous deux qualifications
              juridiques distinctes :
              <br />
              <br />
              <strong>En tant que Responsable de traitement :</strong> Pour les
              données strictement nécessaires à la création et à la gestion du
              compte du Photographe (nom, prénom, adresse email).
              <br />
              <strong>En tant que Sous-traitant :</strong> Pour toutes les
              photographies (pouvant contenir des données biométriques ou des
              visages) et données afférentes téléversées par le Photographe dans
              ses galeries. Le Photographe demeure l&apos;unique Responsable de
              traitement vis-à-vis de ses propres clients et garantit avoir
              recueilli le consentement nécessaire (droit à l&apos;image).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              7. Sécurité des données (Art. 32 du RGPD)
            </h3>
            <p>
              Conformément à l&apos;obligation de sécurité et au principe de
              protection des données dès la conception (Privacy by Design),
              Photolio applique des mesures techniques et organisationnelles
              strictes :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Chiffrement des clés secrètes :</strong> Les secrets
                d&apos;API (notamment Cloudinary) fournis par le Photographe
                sont chiffrés en base de données via l&apos;algorithme{" "}
                <strong>AES-256-CBC</strong>. Les clés publiques destinées au
                client (comme celles d&apos;EmailJS) sont stockées de manière
                standard.
              </li>
              <li>
                <strong>Hachage des accès :</strong> Les mots de passe
                d&apos;accès aux comptes et aux galeries privées sont hachés de
                manière sécurisée (notamment via <strong>SHA-256</strong>) et ne
                sont jamais stockés en clair.
              </li>
              <li>
                <strong>Cloisonnement serveur :</strong> L&apos;application
                utilise une architecture basée sur des <em>Server Actions</em>{" "}
                empêchant l&apos;exposition des secrets d&apos;API côté client.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              8. Conservation et suppression des données
            </h3>
            <p>
              Les données sont conservées uniquement pour la durée nécessaire à
              la finalité de leur traitement :
              <br />
              <br />
              <strong>Galeries éphémères :</strong> Les galeries privées et les
              photographies qu&apos;elles contiennent sont automatiquement et
              définitivement supprimées de nos serveurs (via des tâches
              planifiées) dès l&apos;atteinte de leur date d&apos;expiration
              configurée par le Photographe.
              <br />
              <strong>Données de compte :</strong> Les données liées au compte
              du Photographe sont supprimées lors de la clôture de ce dernier.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              9. Cookies et traceurs
            </h3>
            <p>
              Afin de respecter la vie privée des utilisateurs, Photolio utilise
              la solution d&apos;analyse PostHog configurée de manière stricte
              (mode &quot;cookieless&quot; sans dépôt de traceurs sur le
              terminal et avec anonymisation des adresses IP). Les seuls cookies
              utilisés par l&apos;application sont des cookies techniques
              strictement nécessaires au maintien de la session sécurisée
              (NextAuth), dispensés du recueil de consentement de la CNIL.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              10. Exercice des droits (Art. 15 à 21 du RGPD)
            </h3>
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification,
              d&apos;effacement, de limitation du traitement et de portabilité
              de vos données. Pour exercer ces droits, veuillez nous contacter à
              l&apos;adresse :{" "}
              <a
                href="mailto:levynix.studio@gmail.com"
                className="underline underline-offset-4 hover:text-cream transition-colors"
              >
                levynix.studio@gmail.com
              </a>
              .
              <br />
              <br />
              <span className="text-sm italic opacity-80 mt-2 block">
                Avertissement aux clients finaux : Pour toute demande de
                suppression d&apos;une photographie vous représentant dans une
                galerie privée, vous devez adresser votre demande directement au
                Photographe (Responsable de traitement), qui dispose des outils
                nécessaires sur la plateforme pour procéder à l&apos;effacement
                immédiat.
              </span>
            </p>
          </section>

          {/* --- PARTIE 3 : CGU --- */}
          <div className="mt-12 mb-6 border-b border-cream/20 pb-2">
            <span className="uppercase tracking-widest text-xs font-bold text-cream/40">
              Partie 3 : Conditions Générales d&apos;Utilisation
            </span>
          </div>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              11. Objet et force obligatoire
            </h3>
            <p>
              Les présentes Conditions Générales régissent l&apos;utilisation du
              service SaaS Photolio par les utilisateurs (ci-après &quot;le
              Photographe&quot;). Conformément à l&apos;article 1119 du Code
              civil, la création d&apos;un compte sur Photolio et
              l&apos;utilisation du service impliquent l&apos;acceptation
              expresse et sans réserve des présentes conditions, qui tiennent
              lieu de loi entre les parties (Art. 1103 du Code civil).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              12. Droit à l&apos;image et Responsabilité
            </h3>
            <p>
              Le Photographe garantit être l&apos;auteur légal des contenus mis
              en ligne ou disposer des autorisations nécessaires. En application
              de l&apos;article 9 du Code civil (droit au respect de la vie
              privée), il s&apos;engage formellement à avoir recueilli le
              consentement exprès des personnes physiques figurant sur les
              photographies hébergées dans ses galeries, qu&apos;elles soient
              publiques ou privées.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              13. Statut d&apos;hébergeur et contenus illicites
            </h3>
            <p>
              Le Photographe s&apos;interdit d&apos;utiliser Photolio pour
              stocker ou diffuser des contenus illégaux, haineux ou portant
              atteinte aux droits de tiers.
              <br />
              Conformément à l&apos;article 6-I-2 de la loi n° 2004-575 du 21
              juin 2004 (LCEN), Photolio agit en stricte qualité
              d&apos;hébergeur et n&apos;exerce aucun contrôle a priori sur les
              galeries. La responsabilité de Photolio ne saurait être engagée du
              fait des contenus stockés. En cas de notification d&apos;un
              contenu illicite, Photolio se réserve le droit de retirer
              promptement ledit contenu ou d&apos;en rendre l&apos;accès
              impossible, et de suspendre le compte concerné. Le Photographe
              s&apos;engage à garantir Photolio contre toute réclamation ou
              condamnation liée aux contenus qu&apos;il a importés.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              14. Disponibilité du service et limitation de responsabilité
            </h3>
            <p>
              Photolio s&apos;efforce de maintenir un accès au service 24h/24,
              en s&apos;appuyant sur des infrastructures tierces. L&apos;accès
              au service est fourni selon une obligation de moyens.
              <br />
              Conformément aux articles 1218 (force majeure) et 1231-1 et
              suivants du Code civil, Photolio décline toute responsabilité en
              cas d&apos;indisponibilité du service, de pannes des prestataires
              tiers, ou de perte de données indépendantes de sa volonté.
              Photolio ne pourra en aucun cas être tenu responsable des dommages
              indirects, pertes d&apos;exploitation ou préjudices subis par le
              Photographe.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              15. Expiration, purge des données et fin de service
            </h3>
            <p>
              Le service propose un système de galeries privées éphémères. Une
              fois la date d&apos;expiration paramétrée atteinte, le système
              purge automatiquement et définitivement les photographies des
              serveurs.
              <br />
              En cas de suppression du compte par le Photographe, ou de
              manquement grave aux présentes CGU entraînant la résiliation du
              contrat, Photolio procédera à la désactivation des accès et à la
              suppression des fichiers stockés. Il incombe exclusivement au
              Photographe de sauvegarder ses propres fichiers originaux.
            </p>
          </section>

          {/* --- PARTIE 4 : CGV --- */}
          <div className="mt-12 mb-6 border-b border-cream/20 pb-2">
            <span className="uppercase tracking-widest text-xs font-bold text-cream/40">
              Partie 4 : Conditions Générales de Vente (CGV)
            </span>
          </div>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              16. Modalités d&apos;achat et Prix
            </h3>
            <p>
              L&apos;accès au service Photolio est facturé sous la forme
              d&apos;un achat unique. Le paiement s&apos;effectue en une seule
              fois, au tarif en vigueur affiché sur le site au moment de la
              commande (indiqué en euros, toutes taxes comprises).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              17. Absence de droit de rétractation
            </h3>
            <p>
              Conformément aux dispositions de l&apos;article L221-28 13° du
              Code de la consommation, le droit de rétractation ne peut être
              exercé pour les contrats de fourniture d&apos;un contenu numérique
              non fourni sur un support matériel dont l&apos;exécution a
              commencé après accord préalable exprès du consommateur et
              renoncement exprès à son droit de rétractation.
              <br />
              En procédant à l&apos;achat, le Photographe accepte que
              l&apos;accès à la plateforme soit immédiat et renonce expressément
              à son délai de rétractation de 14 jours. Aucun remboursement ne
              pourra être exigé après validation du paiement.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-cream mb-2">
              18. Durée de l&apos;accès et suppression de compte
            </h3>
            <p>
              L&apos;achat unique donne accès au service sans limite de durée
              prédéfinie, sous réserve du maintien en activité de
              l&apos;application Photolio. Le Photographe peut à tout moment
              demander la clôture et la suppression de son compte en contactant
              le support. Cette suppression entraîne l&apos;effacement définitif
              de l&apos;ensemble de ses données, sans qu&apos;aucun
              remboursement de l&apos;achat initial ne puisse être réclamé.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegalesModal;
