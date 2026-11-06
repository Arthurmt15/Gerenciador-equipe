import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ritmo | Trabalho em movimento",
  description: "Organize projetos, tarefas e ideias em um só ritmo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={manrope.variable}
    >
      <body className="min-h-full"><Providers>{children}</Providers></body>
    </html>
  );
}
