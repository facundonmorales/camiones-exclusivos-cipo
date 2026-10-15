import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SITE } from "@/lib/config";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Camiones Exclusivos — Venta de camiones usados y 0 km en Cipolletti",
    template: "%s | Camiones Exclusivos",
  },
  description:
    "Compra y venta de camiones usados y 0 km en Cipolletti, Río Negro. Financiación, permutas y entrega inmediata para Neuquén, Vaca Muerta y todo el Alto Valle.",
  keywords: [
    "camiones usados",
    "camiones 0 km",
    "venta de camiones Cipolletti",
    "camiones Neuquén",
    "Alto Valle",
    "Vaca Muerta",
    "permuta camiones",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE.nombre,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${inter.variable}`}>
      <body className="bg-white font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
