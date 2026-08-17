import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autodeclaração de Diversidade | Premier Logistics",
  description:
    "Formulário seguro, confidencial e 100% anônimo de autodeclaração de diversidade da Premier Logistics Gestão Empresarial.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#0B2545" />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
