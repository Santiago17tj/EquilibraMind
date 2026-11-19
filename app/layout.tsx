import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EquilibraMind | Tu bienestar también merece espacio",
  description: "Descubre EquilibraMind, un prototipo educativo de bienestar emocional, prevención del agotamiento laboral y programas para empresas.",
  keywords: ["bienestar psicológico", "burnout", "salud mental laboral", "EquilibraMind", "Bucaramanga"],
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
