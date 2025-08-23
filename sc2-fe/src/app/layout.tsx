import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";


export const metadata: Metadata = {
  title: "VaniSetu",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} antialiased`}>{children}</body>
    </html>
  );
}
