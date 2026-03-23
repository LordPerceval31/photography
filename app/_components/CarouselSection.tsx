"use client";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

type CarouselItem = {
  id: string;
  url: string;
  galleryName: string;
};

const CarouselSection = ({ items }: { items: CarouselItem[] }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({ speed: 1, stopOnInteraction: false }),
  ]);

  const displayItems =
    items.length > 0 && items.length < 6
      ? [...items, ...items, ...items, ...items].slice(0, 8)
      : items;

  if (!items || items.length === 0) return null;

  return (
    <section
      data-theme="light"
      className="w-full h-screen bg-cream overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <div ref={emblaRef} className="h-full px-6 tablet:px-12">
        <div className="flex -ml-6 tablet:-ml-12 h-full items-center">
          {displayItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex-[0_0_100%] tablet:flex-[0_0_75%] laptop:flex-[0_0_28%] ultrawide:flex-[0_0_25%] 4k:flex-[0_0_25%] pl-6 tablet:pl-12
                         odd:-translate-y-8 tablet:odd:-translate-y-12 laptop:odd:-translate-y-16 ultrawide:odd:-translate-y-24 4k:odd:-translate-y-32
                         even:translate-y-8 tablet:even:translate-y-12 laptop:even:translate-y-16 ultrawide:even:translate-y-24 4k:even:translate-y-32"
            >
              <Link
                href={`/gallery/${item.id}`}
                className="group block relative w-full h-[65vh] laptop:h-[60vh] ultrawide:h-auto ultrawide:aspect-3/2 4k:h-[70vh] 4k:aspect-auto"
              >
                <div className="relative h-full w-full overflow-hidden bg-gray-200 rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105">
                  <Image
                    src={item.url}
                    alt={item.galleryName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                <div className="mt-4 flex justify-between items-center px-1">
                  <span
                    className="text-xs uppercase tracking-widest text-gray-500 font-medium 
                   tablet:text-sm 
                   laptop:text-xs 
                   desktop:text-sm 
                   2k:text-base 
                   4k:text-2xl"
                  >
                    {" "}
                    {item.galleryName}
                  </span>

                  <span className="text-gray-400 text-lg 4k:text-2xl transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;
