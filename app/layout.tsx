import type { Metadata, Viewport } from "next";
import "./globals.css";
import { asset } from "./basePath";

const socialImage = "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://unsorted.ai"),
  title: "Unsorted AI | The First and Last 100 Yards",
  description:
    "The physical access layer for last-mile delivery. A wheel-legged robot for the curbs, stairs, and doors that keep buildings out of a sidewalk robot's reach.",
  icons: {
    icon: asset("/logo/unsorted-logo-crop.png"),
  },
  openGraph: {
    title: "Unsorted AI | The First and Last 100 Yards",
    description:
      "Unsorted owns the first and last 100 yards of every delivery.",
    type: "website",
    images: [{ url: socialImage, width: 1744, height: 914, alt: "Unsorted AI delivery robot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unsorted AI | The First and Last 100 Yards",
    description:
      "Unsorted owns the first and last 100 yards of every delivery.",
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
