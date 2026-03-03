import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { AppointmentCalendar } from "@/components/admin/appointment-calendar";
import type { Appointment } from "@/lib/types/database";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchAppointments(): Promise<{
  data: Appointment[] | null;
  error: string | null;
  unconfigured: boolean;
}> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { data: null, error: null, unconfigured: true };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true });

    if (error) {
      return { data: null, error: error.message, unconfigured: false };
    }

    return {
      data: data as Appointment[],
      error: null,
      unconfigured: false,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch appointments";
    return { data: null, error: message, unconfigured: false };
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminCalendarPage() {
  const { data: appointments, error, unconfigured } = await fetchAppointments();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <CalendarDays className="size-7 text-primary" />
            Appointment Calendar
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage appointments by date.
          </p>
        </div>
      </div>

      {/* Error / Unconfigured States */}
      {unconfigured && (
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
              in your environment to view appointments.
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">
              Failed to load appointments: {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      {!unconfigured && !error && (
        <AppointmentCalendar appointments={appointments ?? []} />
      )}
    </div>
  );
}
