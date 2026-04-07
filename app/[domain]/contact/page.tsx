import ContactSection from "./ContactSection";

export const revalidate = 3600;

const ContactPage = () => {
  return (
    <main className="h-screen w-full bg-cream relative">
      <ContactSection />
    </main>
  );
};

export default ContactPage;
