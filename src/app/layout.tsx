import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoScore — Should You Automate That Process?",
  description:
    "A leadership-ready assessment tool. Input a workflow, get a verdict, ROI, payback period, risks, and a rollout roadmap in 5 minutes. Free, no signup, PDF export.",
  keywords: [
    "automation assessment",
    "ROI calculator",
    "process automation",
    "business case",
    "leadership tool",
    "automation decision",
  ],
  authors: [{ name: "AutoScore" }],
  openGraph: {
    title: "AutoScore — Should You Automate That Process?",
    description:
      "A leadership-ready assessment tool for automation decisions. Verdict, ROI, payback, risks, and roadmap in 5 minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoScore — Should You Automate That Process?",
    description:
      "A leadership-ready assessment tool for automation decisions. Verdict, ROI, payback, risks, and roadmap in 5 minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
