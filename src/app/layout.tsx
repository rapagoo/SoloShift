import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SoloShift",
  description: "A structured solo-work dashboard with light company roleplay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
