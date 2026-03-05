import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenDash — AI-Powered Admin",
  description: "An open-source AI-powered admin dashboard. Build your admin with natural language.",
  openGraph: {
    title: "OpenDash — AI-Powered Admin",
    description: "An open-source AI-powered admin dashboard. Build your admin with natural language.",
    images: [
      {
        url: "/open-dash.png",
        width: 1200,
        height: 630,
        alt: "OpenDash - Build Admin Dashboards with AI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenDash — AI-Powered Admin",
    description: "An open-source AI-powered admin dashboard. Build your admin with natural language.",
    images: ["/open-dash.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/favicon.ico" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/icons/apple-touch-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/icons/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
