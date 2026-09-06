import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reachcraft",
  description: "LinkedIn writing workspace for operators and creators.",
  icons: {
    icon: "/brand/reachcraft-mark.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
