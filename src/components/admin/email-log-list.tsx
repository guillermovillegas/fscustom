"use client";

import { Mail, Clock, CheckCircle2, XCircle, SkipForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailLogEntry {
  id: string;
  email_type: string;
  subject: string;
  sent_at: string;
  status: string;
}

interface EmailLogListProps {
  emails: EmailLogEntry[];
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

function getEmailTypeLabel(emailType: string): string {
  switch (emailType) {
    case "follow_up":
      return "Follow-up";
    case "reminder":
      return "Reminder";
    case "confirmation":
      return "Confirmation";
    default:
      return emailType;
  }
}

function getEmailTypeBadgeVariant(
  emailType: string
): "default" | "secondary" | "outline" {
  switch (emailType) {
    case "follow_up":
      return "default";
    case "reminder":
      return "secondary";
    case "confirmation":
      return "outline";
    default:
      return "outline";
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "sent":
      return <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />;
    case "failed":
      return <XCircle className="size-3.5 text-destructive" />;
    case "skipped":
      return (
        <SkipForward className="size-3.5 text-muted-foreground" />
      );
    default:
      return <Clock className="size-3.5 text-muted-foreground" />;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "sent":
      return "Sent";
    case "failed":
      return "Failed";
    case "skipped":
      return "Skipped";
    default:
      return status;
  }
}

export function EmailLogList({ emails }: EmailLogListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-center">
        <Mail className="size-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          No emails sent yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Emails sent to this customer will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <div
          key={email.id}
          className="flex items-start gap-3 rounded-md border bg-card p-3 text-card-foreground"
        >
          <div className="mt-0.5">
            <StatusIcon status={email.status} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={getEmailTypeBadgeVariant(email.email_type)} className="shrink-0">
                {getEmailTypeLabel(email.email_type)}
              </Badge>
              <span className="truncate text-sm font-medium">{email.subject}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTimestamp(email.sent_at)}</span>
              <span aria-hidden="true">-</span>
              <span>{getStatusLabel(email.status)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
