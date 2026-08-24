import type { Metadata } from "next";
import { Saira } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Loaded as the full variable font (wght + wdth) so .font-expanded can reproduce Figma's "Saira SemiExpanded".
const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "ENTAJ — Raw Materials That Power Industries",
  description:
    "Entaj delivers premium raw materials backed by 12+ years of sourcing expertise, global supply networks, and uncompromising quality standards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${saira.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
