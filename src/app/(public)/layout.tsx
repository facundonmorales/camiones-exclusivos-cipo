import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { WhatsAppFlotante } from "@/components/public/WhatsAppFlotante";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[100] rounded-lg bg-brand px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">{children}</main>
      <Footer />
      <WhatsAppFlotante />
    </>
  );
}
