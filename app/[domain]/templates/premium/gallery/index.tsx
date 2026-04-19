import BackgroundWrapper from "./BackgroundWrapper";
import NavBar from "@/app/_components/navBar";

interface Props {
  userId: string;
}

// Contenu visuel de la page gallery — template Premium
// L'aiguilleur (app/[domain]/gallery/page.tsx) injecte userId
const PremiumGallery = ({ userId }: Props) => {
  return (
    <main className="min-h-screen w-full bg-dark relative">
      <NavBar />
      <BackgroundWrapper userId={userId} />
    </main>
  );
};

export default PremiumGallery;
