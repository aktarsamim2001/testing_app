import { Providers } from "@/components/Providers";
import "@/index.css";

export const metadata = {
  title: "Auth - PartnerScale",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
