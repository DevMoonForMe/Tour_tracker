import type { Metadata } from "next";
import "./globals.css";
import ClientAppWrapper from "./ClientAppWrapper";

export const metadata: Metadata = {
  title: "Tour Split Tracker",
  description: "Track trip expenses effortlessly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientAppWrapper>
          {children}
        </ClientAppWrapper>
      </body>
    </html>
  );
}
