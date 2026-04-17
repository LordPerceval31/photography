import PolaroidCard from "@/app/_components/PolaroïdeCard";
import { Service } from "../../../../lib/types";

const ServicesSection = ({ services }: { services: Service[] }) => {
  if (services.length === 0) return null;

  // -- LOGIQUE 100% FLUIDE ET RESPONSIVE --
  // On utilise calc() pour déduire exactement la taille de l'espacement (gap-8 = 2rem)

  // Par défaut (1 à 3 cartes, 5 cartes, 7 cartes...) :
  // - Mobile : 100% de la largeur
  // - Tablette : 50% de la largeur (moins la moitié du gap) -> 2 colonnes
  // - Laptop : 33.33% de la largeur (moins le gap) -> 3 colonnes
  let cardWidthClass =
    "w-full tablet:w-[calc(50%-1rem)] laptop:w-[calc(33.333%-1.33rem)]";

  // Règle d'or des 4 cartes :
  // On force le 2x2 centré même sur grand écran.
  if (services.length === 4) {
    // La carte garde sa taille de 50% sur laptop au lieu de passer à 33%
    cardWidthClass =
      "w-full tablet:w-[calc(50%-1rem)] laptop:w-[calc(50%-1rem)] laptop:max-w-[450px]";
  }

  return (
    // Les paddings (py, px) passent aussi en pourcentages (ou unités relatives)
    <section className="relative w-full py-[10vh] px-[5%] overflow-hidden">
      {/* Le conteneur prend toute la place, ce sont les cartes qui dictent la taille */}
      <div className="flex flex-wrap justify-center gap-8 mx-auto w-full max-w-400">
        {services.map((service, index) => (
          <PolaroidCard
            key={service.id || index}
            service={service}
            widthClass={cardWidthClass} // On envoie la classe de taille à la carte
          />
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
