import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Test dei Colori della Personalità",
  description:
    "Test pubblico dei colori della personalità con risultati e PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
