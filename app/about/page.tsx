import BioSection from "./BioSection";
import PictureAboutWrapper from "./PictureAboutWrapper";
import StorySection from "./StorySection";

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
