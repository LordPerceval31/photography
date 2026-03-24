import { caveat } from "../lib/fonts";

const StorySection = () => {
  return (
    <section
      data-theme="light"
      className="flex flex-col laptop:flex-row items-start laptop:items-center justify-between min-h-screen bg-gray-50 px-8 tablet:px-16 laptop:px-24 py-24 gap-12 laptop:gap-16 text-dark"
    >
      {/* 1/3 : Le Titre */}
      <div className="w-full laptop:w-1/3 flex flex-col justify-start laptop:self-start">
        <h2
          className={`${caveat.className} text-5xl tablet:text-6xl ultrawide:text-8xl 4k:text-9xl 4k:mt-40 4k:ml-40 font-bold mt-0 ultrawide:mt-30 ultrawide:ml-30`}
        >
          Story
        </h2>
        <div className="w-40 ultrawide:w-72 4k:w-100 tablet:w-50 h-0.5 bg-blue mt-2 ultrawide:ml-30 4k:ml-40"></div>
      </div>

      {/* 1/3 : Premier paragraphe */}
      <div className="w-full laptop:w-1/3 flex justify-start tablet:justify-center">
        <div className="w-full max-w-sm desktop:max-w-md 2k:max-w-lg ultrawide:max-w-2xl 4k:max-w-4xl text-justify">
          <p className="desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-4xl leading-relaxed">
            Tout a commencé avec un vieil appareil argentique trouvé dans le
            grenier familial. Avant même de maîtriser la technique ou de
            comprendre l&apos;art de l&apos;exposition, j&apos;étais fasciné par
            le pouvoir de cette petite boîte noire : figer le temps. Mon
            parcours n&apos;était pourtant pas tracé pour l&apos;image.
            J&apos;ai d&apos;abord exploré d&apos;autres voies avant de réaliser
            que les mots me manquaient souvent, et que ma seule véritable façon
            de raconter le monde était à travers un viseur. C&apos;est cette
            urgence de retenir une émotion avant qu&apos;elle ne s&apos;évapore
            qui m&apos;a poussé à faire de cette obsession mon métier.
          </p>
        </div>
      </div>

      {/* 1/3 : Deuxième paragraphe */}
      <div className="w-full laptop:w-1/3 flex justify-start tablet:justify-center 4k:mr-40">
        <div className="w-full max-w-sm desktop:max-w-md 2k:max-w-lg ultrawide:max-w-2xl 4k:max-w-4xl text-justify">
          <p className="desktop:text-lg 2k:text-2xl ultrawide:text-3xl 4k:text-4xl leading-relaxed">
            Aujourd&apos;hui, mon approche est intimement liée à cette quête
            d&apos;authenticité. Je fuis la perfection plastique des studios
            aseptisés pour traquer la vérité : un éclat de rire spontané, la
            mélancolie d&apos;une lumière de fin de journée, ou la force
            d&apos;un regard silencieux. Chaque séance est une immersion dans
            l&apos;intimité de mes sujets. Mon but n&apos;est pas de simplement
            documenter une scène de manière clinique, mais d&apos;en extraire la
            poésie viscérale. Je veux que dans vingt ans, en regardant ces
            clichés, l&apos;odeur et le frisson de l&apos;instant vous
            reviennent intacts.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
