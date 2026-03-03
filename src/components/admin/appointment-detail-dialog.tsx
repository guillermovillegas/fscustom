"use client";

import { useState, useTransition, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Clock,
  Send,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type {
  Appointment,
  AppointmentStatus,
  ProjectType,
  PropertyType,
} from "@/lib/types/database";
import {
  updateAppointment,
  sendFollowUpEmail,
} from "@/lib/actions/update-appointment";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
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

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const h = parseInt(hours ?? "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

interface AppointmentDetailDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Appointment) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onSave,
}: AppointmentDetailDialogProps) {
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [adminNotes, setAdminNotes] = useState(appointment.admin_notes ?? "");
  const [customerAddress, setCustomerAddress] = useState(
    appointment.customer_address ?? ""
  );
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(
    appointment.follow_up_date
      ? parseISO(appointment.follow_up_date)
      : undefined
  );
  const [followUpPopoverOpen, setFollowUpPopoverOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isSendingEmail, startEmailTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = useCallback(() => {
    setSaveMessage(null);
    startTransition(async () => {
      const result = await updateAppointment({
        id: appointment.id,
        status,
        admin_notes: adminNotes || null,
        customer_address: customerAddress || null,
        follow_up_date: followUpDate
          ? format(followUpDate, "yyyy-MM-dd")
          : null,
      });

      if (result.success) {
        setSaveMessage({ type: "success", text: "Changes saved" });
        onSave({
          ...appointment,
          status,
          admin_notes: adminNotes || null,
          customer_address: customerAddress || null,
          follow_up_date: followUpDate
            ? format(followUpDate, "yyyy-MM-dd")
            : null,
          updated_at: new Date().toISOString(),
        });
        // Clear message after 3s
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({
          type: "error",
          text: result.error ?? "Failed to save",
        });
      }
    });
  }, [
    appointment,
    status,
    adminNotes,
    customerAddress,
    followUpDate,
    onSave,
  ]);

  const handleSendFollowUp = useCallback(() => {
    setSaveMessage(null);
    startEmailTransition(async () => {
      const result = await sendFollowUpEmail(appointment.id);
      if (result.success) {
        setSaveMessage({ type: "success", text: "Follow-up email sent" });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({
          type: "error",
          text: result.error ?? "Failed to send email",
        });
      }
    });
  }, [appointment.id]);

  const appointmentDate = parseISO(appointment.appointment_date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {appointment.customer_name}
          </DialogTitle>
          <DialogDescription>
            {format(appointmentDate, "EEEE, MMMM d, yyyy")} at{" "}
            {formatTime(appointment.appointment_time)}
          </DialogDescription>
        </DialogHeader>

        {/* Contact Info */}
        <div className="space-y-2">
          <a
            href={`tel:${appointment.customer_phone}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="size-4" />
            {appointment.customer_phone}
          </a>
          {appointment.customer_email && (
            <a
              href={`mailto:${appointment.customer_email}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="size-4" />
              {appointment.customer_email}
            </a>
          )}
        </div>

        {/* Project Details */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {PROJECT_LABELS[appointment.project_type]}
          </Badge>
          <Badge variant="outline">
            {PROPERTY_LABELS[appointment.property_type]}
          </Badge>
        </div>

        {appointment.description && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <p className="text-sm">{appointment.description}</p>
          </div>
        )}

        <Separator />

        {/* Status Selector */}
        <div className="space-y-2">
          <Label htmlFor="status-select">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as AppointmentStatus)}
          >
            <SelectTrigger className="w-full" id="status-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(STATUS_LABELS) as [AppointmentStatus, string][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        value === "pending" && "bg-yellow-500",
                        value === "confirmed" && "bg-green-500",
                        value === "completed" && "bg-blue-500",
                        value === "cancelled" && "bg-red-500"
                      )}
                    />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Admin Notes */}
        <div className="space-y-2">
          <Label htmlFor="admin-notes">Admin Notes</Label>
          <Textarea
            id="admin-notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes about this appointment..."
            rows={3}
          />
        </div>

        {/* Customer Address */}
        <div className="space-y-2">
          <Label htmlFor="customer-address">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              Customer Address
            </span>
          </Label>
          <Input
            id="customer-address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Enter address when customer calls in..."
          />
        </div>

        {/* Follow-up Date */}
        <div className="space-y-2">
          <Label>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Follow-up Date
            </span>
          </Label>
          <Popover open={followUpPopoverOpen} onOpenChange={setFollowUpPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !followUpDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="size-4" />
                {followUpDate
                  ? format(followUpDate, "MMMM d, yyyy")
                  : "Select a follow-up date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={followUpDate}
                onSelect={(date) => {
                  setFollowUpDate(date);
                  setFollowUpPopoverOpen(false);
                }}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          {followUpDate && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setFollowUpDate(undefined)}
              className="text-muted-foreground"
            >
              Clear follow-up date
            </Button>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            Created {format(parseISO(appointment.created_at), "MMM d, yyyy")}
          </span>
          {appointment.follow_up_sent && (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700"
            >
              Follow-up sent
            </Badge>
          )}
        </div>

        {/* Save Feedback */}
        {saveMessage && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              saveMessage.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            )}
          >
            {saveMessage.type === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            {saveMessage.text}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleSendFollowUp}
            disabled={isSendingEmail || !appointment.customer_email}
          >
            {isSendingEmail ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send Follow-up
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
