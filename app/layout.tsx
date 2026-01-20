import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Geist əvəzinə standart Inter şriftini yükləyirik
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "İmtahan Platforması",
  description: "Tələbələr üçün imtahan hazırlıq sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      {/* Şrifti body-yə tətbiq edirik */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
