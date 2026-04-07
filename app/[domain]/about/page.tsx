import BioSection from "./BioSection";
import PictureAboutWrapper from "./PictureAboutWrapper";
import StorySection from "./StorySection";

export const revalidate = 3600;

const AboutPage = () => {
  return (
    <main className="relative w-full bg-cream">
      <BioSection />
      <StorySection />
      <PictureAboutWrapper />
    </main>
  );
};

export default AboutPage;
