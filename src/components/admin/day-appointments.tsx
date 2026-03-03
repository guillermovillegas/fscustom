"use client";

import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Phone, CalendarX2, Plus, Check, Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  Appointment,
  AppointmentStatus,
  ProjectType,
} from "@/lib/types/database";
import { quickCreateAppointment } from "@/lib/actions";
import { updateAppointment, sendFollowUpEmail } from "@/lib/actions/update-appointment";
import { AppointmentDetailDialog } from "./appointment-detail-dialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_DOT_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

const PROJECT_LABELS: Record<ProjectType, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  flooring: "Flooring",
};

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const h = parseInt(hours ?? "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

/** 7:00 AM – 6:00 PM in 30-min increments */
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 7; h <= 18; h++) {
  for (const m of [0, 30]) {
    if (h === 18 && m === 30) continue; // stop at 6:00 PM
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const label = `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    TIME_OPTIONS.push({ value, label });
  }
}

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "flooring", label: "Flooring" },
];

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

interface DayAppointmentsProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentUpdate: (updated: Appointment) => void;
  onAppointmentCreate?: (appt: Appointment) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DayAppointments({
  date,
  appointments,
  onAppointmentUpdate,
  onAppointmentCreate,
}: DayAppointmentsProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Quick Book state
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [quickBookTime, setQuickBookTime] = useState("");
  const [quickBookProject, setQuickBookProject] = useState<ProjectType>("kitchen");
  const [quickBookName, setQuickBookName] = useState("");
  const [quickBookPhone, setQuickBookPhone] = useState("");
  const [quickBookError, setQuickBookError] = useState("");
  const [quickBookLoading, setQuickBookLoading] = useState(false);

  const resetQuickBook = useCallback(() => {
    setQuickBookTime("");
    setQuickBookProject("kitchen");
    setQuickBookName("");
    setQuickBookPhone("");
    setQuickBookError("");
    setQuickBookLoading(false);
  }, []);

  const handleQuickBookSubmit = useCallback(async () => {
    setQuickBookError("");
    setQuickBookLoading(true);

    const result = await quickCreateAppointment({
      appointment_date: format(date, "yyyy-MM-dd"),
      appointment_time: quickBookTime,
      customer_name: quickBookName.trim(),
      customer_phone: quickBookPhone.trim(),
      project_type: quickBookProject,
    });

    if (result.success) {
      onAppointmentCreate?.(result.appointment);
      setQuickBookOpen(false);
      resetQuickBook();
    } else {
      setQuickBookError(result.error);
    }

    setQuickBookLoading(false);
  }, [
    date,
    quickBookTime,
    quickBookName,
    quickBookPhone,
    quickBookProject,
    onAppointmentCreate,
    resetQuickBook,
  ]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        a.appointment_time.localeCompare(b.appointment_time)
      ),
    [appointments]
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCardClick = useCallback((appt: Appointment) => {
    setSelectedAppointment(appt);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    (updated: Appointment) => {
      setSelectedAppointment(updated);
      onAppointmentUpdate(updated);
    },
    [onAppointmentUpdate]
  );

  const handleConfirm = useCallback(
    async (appt: Appointment) => {
      setActionLoading(`confirm-${appt.id}`);
      const result = await updateAppointment({ id: appt.id, status: "confirmed" });
      if (result.success) {
        onAppointmentUpdate({ ...appt, status: "confirmed" });
      }
      setActionLoading(null);
    },
    [onAppointmentUpdate]
  );

  const handleEmail = useCallback(
    async (appt: Appointment) => {
      setActionLoading(`email-${appt.id}`);
      await sendFollowUpEmail(appt.id);
      setActionLoading(null);
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight">
              {format(date, "EEE, MMM d")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {format(date, "yyyy")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetQuickBook();
                setQuickBookOpen(true);
              }}
            >
              <Plus className="mr-1 size-3.5" />
              Quick Book
            </Button>
            <Badge variant="secondary" className="text-xs">
              {sortedAppointments.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Appointment List */}
      {sortedAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarX2 className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No appointments for this day
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Select another day to view appointments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedAppointments.map((appt) => (
            <div
              key={appt.id}
              className="rounded-lg border bg-card shadow-sm"
            >
              {/* Clickable card area */}
              <button
                type="button"
                onClick={() => handleCardClick(appt)}
                className={cn(
                  "group w-full p-3 text-left",
                  "transition-colors hover:bg-accent/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  "rounded-t-lg"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        STATUS_DOT_COLORS[appt.status]
                      )}
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium tabular-nums text-muted-foreground">
                        {formatTime(appt.appointment_time)}
                      </p>
                      <p className="truncate font-semibold text-sm leading-tight">
                        {appt.customer_name}
                      </p>
                      <a
                        href={`tel:${appt.customer_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Phone className="size-3" />
                        {appt.customer_phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge
                      className={cn("border text-[10px] px-1.5 py-0", STATUS_STYLES[appt.status])}
                      variant="outline"
                    >
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {PROJECT_LABELS[appt.project_type]}
                    </Badge>
                  </div>
                </div>
              </button>

              {/* Quick actions bar */}
              <div className="flex items-center gap-1 border-t px-3 py-1.5">
                {appt.status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                    disabled={actionLoading === `confirm-${appt.id}`}
                    onClick={() => handleConfirm(appt)}
                  >
                    {actionLoading === `confirm-${appt.id}` ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3" />
                    )}
                    Confirm
                  </Button>
                )}
                {appt.customer_email && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                    disabled={actionLoading === `email-${appt.id}`}
                    onClick={() => handleEmail(appt)}
                  >
                    {actionLoading === `email-${appt.id}` ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Mail className="size-3" />
                    )}
                    Email
                  </Button>
                )}
                {appt.status !== "pending" && !appt.customer_email && (
                  <span className="text-[10px] text-muted-foreground/60 py-0.5">
                    No quick actions
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedAppointment && (
        <AppointmentDetailDialog
          appointment={selectedAppointment}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
        />
      )}

      {/* Quick Book Dialog */}
      <Dialog
        open={quickBookOpen}
        onOpenChange={(open) => {
          setQuickBookOpen(open);
          if (!open) resetQuickBook();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Book</DialogTitle>
            <DialogDescription>
              {format(date, "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Time */}
            <div className="grid gap-2">
              <Label htmlFor="qb-time">Time</Label>
              <Select value={quickBookTime} onValueChange={setQuickBookTime}>
                <SelectTrigger id="qb-time" className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Type */}
            <div className="grid gap-2">
              <Label>Project Type</Label>
              <div className="flex gap-2">
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={quickBookProject === opt.value ? "default" : "outline"}
                    onClick={() => setQuickBookProject(opt.value)}
                    className="flex-1"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Customer Name */}
            <div className="grid gap-2">
              <Label htmlFor="qb-name">Customer Name</Label>
              <Input
                id="qb-name"
                placeholder="John Doe"
                value={quickBookName}
                onChange={(e) => setQuickBookName(e.target.value)}
              />
            </div>

            {/* Customer Phone */}
            <div className="grid gap-2">
              <Label htmlFor="qb-phone">Phone</Label>
              <Input
                id="qb-phone"
                placeholder="(555) 123-4567"
                value={quickBookPhone}
                onChange={(e) => setQuickBookPhone(e.target.value)}
              />
            </div>

            {/* Error */}
            {quickBookError && (
              <p className="text-sm text-destructive">{quickBookError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleQuickBookSubmit}
              disabled={quickBookLoading || !quickBookTime || !quickBookName.trim() || !quickBookPhone.trim()}
            >
              {quickBookLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
