import type { Metadata } from "next";
import "../globals.css";

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
    <html lang="de">
      <body className="bg-mist-100">{children}</body>
    </html>
  );
}
