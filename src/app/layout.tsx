import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Fuente display del sitio público (headings). El admin conserva Geist:
// la variable se expone globalmente, pero solo la consume `.public-site`.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Compañía Mundial de Comercio S.A.S.",
    template: "%s | Compañía Mundial de Comercio S.A.S.",
  },
  description:
    "Producción y distribución de margarinas, mantequillas y aceites en Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${fraunces.variable} antialiased`}>{children}</body>
    </html>
  );
}
