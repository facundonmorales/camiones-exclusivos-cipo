import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel | Camiones Exclusivos" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 3500 }} />
    </>
  );
}
