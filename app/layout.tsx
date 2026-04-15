import type { Metadata } from "next";
import AppDialogProvider from "@/components/AppDialogProvider";
import { Geist, Geist_Mono } from "next/font/google";
import AppToaster from "@/components/AppToaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personalized AI",
  description: "Website e-learning karya Mochamad Alifi Arzahta dari Universitas Pancasakti Tegal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <AppDialogProvider>
          {children}
          <AppToaster />
        </AppDialogProvider>
      </body>
    </html>
  );
}
