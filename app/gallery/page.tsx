import BackgroundWrapper from "./BackgroundWrapper";

const GalleryPage = () => {
  return (
    // ICI : min-h-screen au lieu de h-screen, et SURTOUT PAS de overflow-hidden !
    <main className="min-h-screen w-full bg-dark relative">
      <BackgroundWrapper />
    </main>
  );
};

export default GalleryPage;
