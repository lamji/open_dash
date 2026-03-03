import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenDash — AI-Powered Admin",
  description: "An open-source AI-powered admin dashboard. Build your admin with natural language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
