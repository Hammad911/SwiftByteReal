import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Lora, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import GrainOverlay from "@/components/fx/GrainOverlay";
import CustomCursor from "@/components/fx/CustomCursor";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "SwiftByte — Food that moves you.",
    template: "%s · SwiftByte",
  },
  description:
    "Premium food delivery from the city's finest kitchens. Real ingredients. Real fast. Real-time tracking, exclusive deals, and 200+ restaurants at your fingertips.",
  keywords: ["food delivery", "premium dining", "ramen", "biryani", "burgers", "SwiftByte"],
  openGraph: {
    title: "SwiftByte — Food that moves you.",
    description: "From the city's finest kitchens to your doorstep.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmMono.variable} ${lora.variable} ${bebas.variable}`}
    >
      <body className="bg-night text-cream font-lora antialiased selection:bg-gold/30 selection:text-cream">
        <GrainOverlay />
        <CustomCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
