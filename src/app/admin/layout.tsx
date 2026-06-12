import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap"
});

export const metadata: Metadata = {
  title: { template: "%s | LTS Admin", default: "LTS Admin" },
  robots: { index: false, follow: false }
};

export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-mist-100">{children}</body>
    </html>
  );
}
