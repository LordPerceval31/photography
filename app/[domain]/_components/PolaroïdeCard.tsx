import Image from "next/image";
import { caveat } from "../lib/fonts";
import { Service } from "../lib/types";

const PolaroidCard = ({
  service,
  widthClass,
}: {
  service: Service;
  widthClass: string;
}) => {
  return (
    <div
      className={`relative aspect-square shadow-xl shrink-0 @container ${widthClass}`}
    >
      {/* L'IMAGE DE FOND */}
      <Image
        src="/polaroïde.webp"
        alt="Cadre polaroïd"
        fill
        className="object-cover z-0"
        sizes="(max-width: 640px) 100vw, (max-width: 1366px) 50vw, 33vw"
      />

      {/* L'IMAGE DE LA BDD */}
      {service.photoUrl && (
        <div className="absolute top-[7.5%] left-[4%] right-[4%] bottom-[25.5%] z-10 overflow-hidden">
          <Image
            src={service.photoUrl}
            alt={service.title || "Image des services"}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* LE CONTENEUR DE TEXTE */}
      <div className="absolute top-[76%] left-[5%] right-[5%] z-20 pointer-events-none flex flex-col justify-start">
        {/* Ligne du haut : Titre à gauche, Prix à droite */}
        <div className="flex justify-between items-baseline mb-[1cqi] shrink-0">
          <h3
            className={`${caveat.className} text-[7.5cqi] leading-none font-bold text-dark pr-[2cqi] truncate`}
          >
            {service.title}
          </h3>

          {service.price && (
            <p
              className={`${caveat.className} text-[7.5cqi] leading-none font-bold text-blue shrink-0`}
            >
              {service.price}
            </p>
          )}
        </div>

        {/* Ligne du bas : La description */}
        <p
          className={`${caveat.className} w-full whitespace-normal wrap-break-word text-[5.5cqi] leading-tight font-medium text-dark/70 line-clamp-2`}
        >
          {service.description}
        </p>
      </div>
    </div>
  );
};

export default PolaroidCard;
