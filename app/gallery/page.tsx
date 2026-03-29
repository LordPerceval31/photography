import BackgroundWrapper from "./BackgroundWrapper";

export const revalidate = 3600;

const GalleryPage = () => {
  return (
    <main className="min-h-screen w-full bg-dark relative">
      <BackgroundWrapper />
    </main>
  );
};

export default GalleryPage;
