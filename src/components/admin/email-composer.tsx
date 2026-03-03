"use client";

import { useState, useTransition } from "react";
import { Mail, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { sendFollowUpEmail, sendReminderEmail } from "@/lib/actions/appointments";
import type { Appointment } from "@/lib/types/database";

type EmailType = "follow_up" | "reminder";

interface EmailComposerProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function EmailComposer({ appointment, open, onOpenChange }: EmailComposerProps) {
  const [emailType, setEmailType] = useState<EmailType>("follow_up");
  const [customMessage, setCustomMessage] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasEmail = Boolean(appointment.customer_email);

  function handleSend() {
    setFeedback(null);

    startTransition(async () => {
      let result: { success: boolean; error?: string };

      if (emailType === "follow_up") {
        result = await sendFollowUpEmail(appointment.id, customMessage);
      } else {
        result = await sendReminderEmail(appointment.id);
      }

      if (result.success) {
        setFeedback({ type: "success", message: "Email sent successfully" });
        setCustomMessage("");
      } else {
        setFeedback({
          type: "error",
          message: result.error ?? "Failed to send email",
        });
      }
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFeedback(null);
      setCustomMessage("");
      setEmailType("follow_up");
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Compose and send an email to the customer for this appointment.
          </DialogDescription>
        </DialogHeader>

        {/* Recipient Info */}
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{appointment.customer_name}</p>
                {hasEmail ? (
                  <p className="text-sm text-muted-foreground">
                    {appointment.customer_email}
                  </p>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="size-3.5" />
                    No email address on file
                  </div>
                )}
              </div>
              <Badge variant="secondary">
                {capitalize(appointment.project_type)}
              </Badge>
            </div>
          </div>

          {hasEmail && (
            <>
              <Separator />

              {/* Email Type Selector */}
              <div className="space-y-2">
                <Label htmlFor="email-type">Email Type</Label>
                <Select
                  value={emailType}
                  onValueChange={(value: string) => setEmailType(value as EmailType)}
                >
                  <SelectTrigger id="email-type" className="w-full">
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Message (Follow-up only) */}
              {emailType === "follow_up" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-message">Personal Message</Label>
                  <Textarea
                    id="custom-message"
                    placeholder="Write a personalized note to the customer..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <Separator />

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="rounded-md border bg-muted/30 p-4 text-sm">
                  <p className="font-medium text-foreground">
                    Hi {appointment.customer_name},
                  </p>
                  {emailType === "follow_up" ? (
                    <>
                      <p className="mt-2 text-muted-foreground">
                        Thank you for your interest in our{" "}
                        {capitalize(appointment.project_type)} remodeling services.
                      </p>
                      <p className="mt-2 text-muted-foreground">
                        We wanted to follow up on your walkthrough scheduled for{" "}
                        <span className="font-medium text-foreground">
                          {formatDate(appointment.appointment_date)}
                        </span>{" "}
                        at{" "}
                        <span className="font-medium text-foreground">
                          {appointment.appointment_time}
                        </span>
                        .
                      </p>
                      {customMessage.trim() && (
                        <div className="mt-3 rounded border bg-background p-2 text-muted-foreground">
                          <p className="text-xs font-medium uppercase tracking-wide text-foreground">
                            A note from our team:
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{customMessage}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-muted-foreground">
                        This is a friendly reminder about your upcoming{" "}
                        <span className="font-medium text-foreground">
                          {capitalize(appointment.project_type)}
                        </span>{" "}
                        walkthrough.
                      </p>
                      <div className="mt-3 rounded border bg-background p-2">
                        <p className="text-muted-foreground">
                          <span className="text-muted-foreground">Date: </span>
                          <span className="font-medium text-foreground">
                            {formatDate(appointment.appointment_date)}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-muted-foreground">Time: </span>
                          <span className="font-medium text-foreground">
                            {appointment.appointment_time}
                          </span>
                        </p>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        If you need to reschedule, please call us at{" "}
                        <span className="font-medium text-foreground">
                          (515) 414-4145
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                    feedback.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  {feedback.message}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {hasEmail && (
            <Button
              onClick={handleSend}
              disabled={
                isPending || (emailType === "follow_up" && !customMessage.trim())
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Send Email
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
