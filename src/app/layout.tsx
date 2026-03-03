import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FS Custom Flooring | Design + Build | Des Moines, IA",
  description:
    "FS Custom Flooring — Design + Build. Kitchen remodel, bathroom remodel, backsplash, tile, hardwood, showers & LVP. Schedule your free walkthrough in Des Moines, IA.",
  openGraph: {
    title: "FS Custom Flooring",
    description:
      "Design + Build. Kitchen & bathroom remodeling, custom tile, hardwood, showers & LVP in Des Moines, IA.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
