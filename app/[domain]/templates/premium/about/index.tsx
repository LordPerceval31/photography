import BioSection from "./BioSection";
import StorySection from "./StorySection";
import PictureAboutWrapper from "./PictureAboutWrapper";

interface Props {
  userId: string;
}

// Contenu visuel de la page about — template Premium
// L'aiguilleur (app/[domain]/about/page.tsx) injecte userId
const PremiumAbout = ({ userId }: Props) => {
  return (
    <main className="relative w-full bg-cream">
      <BioSection userId={userId} />
      <StorySection userId={userId} />
      <PictureAboutWrapper userId={userId} />
    </main>
  );
};

export default PremiumAbout;
