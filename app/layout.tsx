import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lucan",
  description: "LinkedIn writing workspace for operators and creators.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
