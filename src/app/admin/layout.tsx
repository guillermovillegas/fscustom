import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | QR Appointments",
  description: "Manage appointments and generate QR codes",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/50">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              &larr; Back to Home
            </Link>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-sm font-semibold tracking-tight">Admin</span>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
