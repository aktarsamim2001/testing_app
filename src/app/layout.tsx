import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import "@/index.css";

export const metadata = {
  title: "PartnerScale - Scale Your SaaS Through Strategic Partnerships",
  description: "Grow your SaaS business through targeted blogger outreach, LinkedIn influencer marketing, and YouTube campaigns. Data-driven partnership strategies that scale.",
  authors: [{ name: "PartnerScale" }],
  openGraph: {
    title: "PartnerScale - Scale Your SaaS Through Strategic Partnerships",
    description: "Grow your SaaS business through targeted blogger outreach, LinkedIn influencer marketing, and YouTube campaigns.",
    type: "website",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@PartnerScale",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
