import type { Metadata } from "next";
import localFont from "next/font/local";
import "./i18n/config";
import "./globals.css";
import React from "react";

const poesten = localFont({ src: "./fonts/PoetsenOne-Regular.ttf" });

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
      <body className={poesten.className}>{children}</body>
    </html>
  );
}
