import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Admin | FS Custom Flooring",
  description: "Manage appointments and generate QR codes",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  } catch {
    // Auth check failed -- middleware will handle redirects.
  }

  // Unauthenticated: render without sidebar (login page)
  if (!userEmail) {
    return (
      <div className="min-h-screen bg-muted/50">
        {children}
      </div>
    );
  }

  // Authenticated: render with sidebar
  return (
    <SidebarProvider>
      <AdminSidebar email={userEmail} />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <span className="text-sm font-medium">FS Custom Flooring</span>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
