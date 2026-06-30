import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import TopNav from "@/components/nav/TopNav";
import Footer from "@/components/ui/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Samay TV",
  description: "Browse and stream movies & TV shows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-bg text-text-primary min-h-screen antialiased selection:bg-white/20 selection:text-white">
        <Providers>
          <TopNav />
          {/* pb-40 ensures hover-expanded cards near the bottom never overlap the footer */}
          <div className="pb-40">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
