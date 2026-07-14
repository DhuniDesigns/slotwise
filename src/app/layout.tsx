import type { Metadata } from "next";
import Link from "next/link";
import { AppProvider } from "@/components/app-provider";
import { BrandMark } from "@/components/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Slotwise", template: "%s · Slotwise" },
  description: "Scheduling that respects your time.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Link className="skip-link" href="#main-content">Skip to main content</Link>
        <header className="topbar">
          <div className="shell topbar-inner">
            <Link className="brand" href="/"><BrandMark />Slotwise</Link>
            <nav className="nav" aria-label="Primary">
              <Link href="/book/maya">Booking page</Link>
              <Link href="/dashboard/calendar">Dashboard</Link>
              <Link className="button" href="/login">Sign in</Link>
            </nav>
          </div>
        </header>
        <div id="main-content">
          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}
