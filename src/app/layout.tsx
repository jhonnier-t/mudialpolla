import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polla Mundialista 2026",
  description: "Portal de administración y pronósticos de la polla mundialista",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
