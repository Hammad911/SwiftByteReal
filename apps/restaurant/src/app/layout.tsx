import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Lora, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", style: ["normal", "italic"], weight: ["400","600","700","800"] });
const dmMono   = DM_Mono({ subsets: ["latin"], variable: "--font-dm-mono", weight: ["300","400","500"] });
const lora     = Lora({ subsets: ["latin"], variable: "--font-lora", style: ["normal","italic"], weight: ["400","500","600","700"] });
const bebas    = Bebas_Neue({ subsets: ["latin"], variable: "--font-bebas", weight: ["400"] });

export const metadata: Metadata = {
  title: "SwiftByte — Restaurant Dashboard",
  description: "Manage your restaurant, orders, menu, and analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmMono.variable} ${lora.variable} ${bebas.variable}`}>
      <body style={{ backgroundColor: "#0D0B08", color: "#F5ECD7" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
