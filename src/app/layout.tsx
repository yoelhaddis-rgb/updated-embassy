import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import EmergencyBanner from "@/components/EmergencyBanner";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Eritrese Ambassade Den Haag | Ambassade van de Staat Eritrea",
  description:
    "Officiële website van de Eritrese Ambassade in Den Haag, Nederland. Consulaire diensten, visumaanvragen, afspraken en informatie over Eritrea.",
  openGraph: {
    title: "Eritrese Ambassade Den Haag",
    description: "Officiële website van de Eritrese Ambassade in Den Haag, Nederland.",
    type: "website",
    locale: "nl_NL",
  },
};

async function getBannerData() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ["banner_active", "banner_text", "banner_type"] } },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return {
      active: map.banner_active === "true",
      text: map.banner_text ?? "",
      type: (map.banner_type ?? "warning") as "warning" | "info" | "closed",
    };
  } catch {
    return { active: false, text: "", type: "warning" as const };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const banner = await getBannerData();

  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Sans+Ethiopic:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-ivory text-charcoal">
        <Providers>
          {/* Flag bar at very top */}
          <div className="flag-bar-thick">
            <div /><div /><div />
          </div>
          {banner.active && banner.text && (
            <EmergencyBanner text={banner.text} type={banner.type} />
          )}
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
