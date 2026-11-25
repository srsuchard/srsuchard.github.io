import type { Metadata } from "next";
import "./globals.css";

// Placeholder shell (Task 2). Fonts, header, footer and metadata arrive in Tasks 4–5.
export const metadata: Metadata = {
  title: "Samuel Suchard",
  description: "Portfolio of Samuel Suchard. Site in progress.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
