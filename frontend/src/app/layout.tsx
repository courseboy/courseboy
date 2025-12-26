import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrainForge - Learn at Your Own Pace",
  description:
    "Simple video lessons designed for seniors. Easy-to-follow courses on technology, hobbies, and health.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={lexend.className}>
        <Providers>
          <div className="relative flex min-h-screen w-full flex-col">
            <Navbar />
            <main className="flex-1 overflow-x-hidden">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
