import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./i18n/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scuffle Heroes",
  description: "A Brawl Stars copy/fan game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
