import { QrGenerator } from "@/components/qr-generator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  Appointment,
  AppointmentStatus,
  ProjectType,
  PropertyType,
} from "@/lib/types/database";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const PROJECT_LABELS: Record<ProjectType, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  flooring: "Flooring",
};

const PROPERTY_LABELS: Record<PropertyType, string> = {
  residential: "Residential",
  commercial: "Commercial",
};

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

// ---------------------------------------------------------------------------
// Appointment Card
// ---------------------------------------------------------------------------

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{appointment.customer_name}</CardTitle>
            <CardDescription>{appointment.customer_phone}</CardDescription>
          </div>
          <Badge
            className={`border ${STATUS_STYLES[appointment.status]}`}
            variant="outline"
          >
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {PROJECT_LABELS[appointment.project_type]}
          </Badge>
          <Badge variant="outline">
            {PROPERTY_LABELS[appointment.property_type]}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          {formatDate(appointment.appointment_date)} at{" "}
          {formatTime(appointment.appointment_time)}
        </div>

        {appointment.customer_email && (
          <div className="text-sm text-muted-foreground">
            {appointment.customer_email}
          </div>
        )}

        {appointment.description && (
          <>
            <Separator />
            <p className="text-sm text-muted-foreground">
              {truncate(appointment.description, 120)}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

async function fetchAppointments(): Promise<{
  data: Appointment[] | null;
  error: string | null;
  unconfigured: boolean;
}> {
  // Check if Supabase env vars are present before importing
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
      .order("appointment_date", { ascending: false })
      .order("created_at", { ascending: false });

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

export default async function AdminPage() {
  const { data: appointments, error, unconfigured } = await fetchAppointments();

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Generate QR codes and manage appointment requests.
        </p>
      </div>

      {/* QR Code Generator */}
      <section>
        <QrGenerator />
      </section>

      {/* Appointments */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Appointments
          </h2>
          <p className="text-sm text-muted-foreground">
            Recent appointment requests from customers.
          </p>
        </div>

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

        {!unconfigured && !error && (!appointments || appointments.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No appointments yet.</p>
            </CardContent>
          </Card>
        )}

        {appointments && appointments.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
