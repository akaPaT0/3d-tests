import type { Metadata } from "next";
import "./globals.css";
import GlobalMenu from "@/components/GlobalMenu";

export const metadata: Metadata = {
  title: "Patrick Moreau — Wedding & Events Photography",
  description:
    "Capturing timeless wedding and event moments with cinematic artistry. Based in Warsaw, available worldwide.",
  keywords: ["wedding photography", "events photographer", "cinematic", "Warsaw", "Three.js", "WebGL"],
  openGraph: {
    title: "Patrick Moreau — Wedding & Events Photography",
    description: "Capturing timeless wedding and event moments with cinematic artistry.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <GlobalMenu />
      </body>
    </html>
  );
}
