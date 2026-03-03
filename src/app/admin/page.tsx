import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import {
  getAppointmentStats,
  getQrScanStats,
  getRecentActivity,
} from "@/lib/actions/analytics";

export default async function AdminPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Supabase is not configured. Set{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              in your environment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [appointments, qrScans, recentActivity] = await Promise.all([
    getAppointmentStats(),
    getQrScanStats(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of appointments, QR code activity, and recent events.
        </p>
      </div>

      <DashboardStats
        appointments={appointments}
        qrScans={qrScans}
        recentActivity={recentActivity}
      />
    </div>
  );
}
