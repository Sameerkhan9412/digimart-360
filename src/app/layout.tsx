import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "src/components/ui/Toast";

export const metadata: Metadata = {
  title: "DIGIMART360 | Your Gateway to Global Trade | B2B Marketplace",
  description: "DIGIMART360 is the premium next-generation B2B marketplace connecting verified manufacturers, exporters, and suppliers with global buyers. Get best prices, search products, and scale your trade.",
  metadataBase: new URL("https://digimart360.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DIGIMART360 | B2B Marketplace Platform",
    description: "Connect with verified global suppliers, request pricing quotes, and access advanced CRM toolings.",
    url: "https://digimart360.com",
    siteName: "DIGIMART360",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
