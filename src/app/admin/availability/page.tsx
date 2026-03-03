import type { Metadata } from "next";
import { CalendarSync, Link2 } from "lucide-react";

import type { TimeSlot } from "@/lib/types/database";
import { AvailabilityManager } from "@/components/admin/availability-manager";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Manage Availability | Admin | QR Appointments",
  description: "Configure weekly time slot availability for appointments",
};

async function fetchTimeSlots(): Promise<{
  data: TimeSlot[] | null;
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
      .from("time_slots")
      .select("*")
      .order("day_of_week")
      .order("start_time");

    if (error) {
      return { data: null, error: error.message, unconfigured: false };
    }

    return {
      data: data as TimeSlot[],
      error: null,
      unconfigured: false,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch time slots";
    return { data: null, error: message, unconfigured: false };
  }
}

export default async function AvailabilityPage() {
  const { data: timeSlots, error, unconfigured } = await fetchTimeSlots();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Manage Availability
          </h1>
          <p className="text-muted-foreground">
            Configure which time slots are available for customer bookings each
            week.
          </p>
        </div>
      </div>

      {/* Calendar Sync — Coming Soon */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="opacity-60 pointer-events-none">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CalendarSync className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Import Calendar
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Coming Soon
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Sync availability from Google Calendar or Outlook
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="opacity-60 pointer-events-none">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Link2 className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Export / Subscribe
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Coming Soon
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Share a calendar link for your availability
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Unconfigured state */}
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
              in your environment to manage availability.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">
              Failed to load time slots: {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      {!unconfigured && !error && (
        <AvailabilityManager initialSlots={timeSlots ?? []} />
      )}
    </div>
  );
}
