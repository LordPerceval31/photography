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
      <Image
        src="/polaroïde.webp"
        alt="Cadre polaroïd"
        fill
        className="object-cover z-0"
        sizes="(max-width: 640px) 100vw, (max-width: 1366px) 50vw, 33vw"
      />

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

      <div className="absolute top-[76%] left-[5%] right-[5%] z-20 pointer-events-none flex flex-col justify-start">
        <div className="flex justify-between items-baseline mb-[1cqi] shrink-0">
          <h3
            className={`${caveat.className} text-[7.5cqi] leading-none font-bold text-(--color-ink) pr-[2cqi] truncate`}
          >
            {service.title}
          </h3>

          {service.price && (
            <p
              className={`${caveat.className} text-[7.5cqi] leading-none font-bold text-(--color-secondary) shrink-0`}
            >
              {service.price}
            </p>
          )}
        </div>

        <p
          className={`${caveat.className} w-full whitespace-normal wrap-break-word text-[5.5cqi] leading-tight font-medium text-(--color-ink) opacity-70 line-clamp-2`}
        >
          {service.description}
        </p>
      </div>
    </div>
  );
};

export default PolaroidCard;
