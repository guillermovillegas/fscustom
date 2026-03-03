"use client";

import { useState, useTransition } from "react";
import { Mail, Bell, MessageSquare, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { updateEmailSettings } from "@/lib/actions/email-settings";
import type { EmailSettings } from "@/lib/types/database";

interface EmailSettingsFormProps {
  settings: EmailSettings;
}

export function EmailSettingsForm({ settings }: EmailSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [confirmationEnabled, setConfirmationEnabled] = useState(
    settings.confirmation_enabled
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    settings.reminder_enabled
  );
  const [reminderHours, setReminderHours] = useState(
    settings.reminder_hours_before
  );
  const [followUpEnabled, setFollowUpEnabled] = useState(
    settings.follow_up_enabled
  );
  const [followUpDays, setFollowUpDays] = useState(
    settings.follow_up_days_after
  );
  const [followUpMessage, setFollowUpMessage] = useState(
    settings.follow_up_default_message
  );

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateEmailSettings({
        confirmation_enabled: confirmationEnabled,
        reminder_enabled: reminderEnabled,
        reminder_hours_before: reminderHours,
        follow_up_enabled: followUpEnabled,
        follow_up_days_after: followUpDays,
        follow_up_default_message: followUpMessage,
      });

      if (result.success) {
        setFeedback({ type: "success", message: "Settings saved." });
      } else {
        setFeedback({
          type: "error",
          message: result.error ?? "Failed to save settings.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Email */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-green-600" />
              <CardTitle className="text-base">Confirmation Email</CardTitle>
            </div>
            <Switch
              checked={confirmationEnabled}
              onCheckedChange={setConfirmationEnabled}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sent immediately when a customer books an appointment. Includes
            appointment details and next steps.
          </p>
          <div className="mt-3">
            <Badge variant={confirmationEnabled ? "default" : "secondary"}>
              {confirmationEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Email */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-blue-600" />
              <CardTitle className="text-base">Reminder Email</CardTitle>
            </div>
            <Switch
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sent before the appointment to remind the customer. Includes date,
            time, and rescheduling info.
          </p>
          <div className="flex items-center gap-3">
            <Label htmlFor="reminder-hours" className="shrink-0 text-sm">
              Send
            </Label>
            <Input
              id="reminder-hours"
              type="number"
              min={1}
              max={168}
              value={reminderHours}
              onChange={(e) => setReminderHours(parseInt(e.target.value, 10) || 24)}
              className="w-20"
              disabled={!reminderEnabled}
            />
            <span className="text-sm text-muted-foreground">
              hours before appointment
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Email */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-orange-600" />
              <CardTitle className="text-base">Follow-up Email</CardTitle>
            </div>
            <Switch
              checked={followUpEnabled}
              onCheckedChange={setFollowUpEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sent after the appointment to check in and encourage the customer to
            proceed.
          </p>
          <div className="flex items-center gap-3">
            <Label htmlFor="followup-days" className="shrink-0 text-sm">
              Send
            </Label>
            <Input
              id="followup-days"
              type="number"
              min={1}
              max={30}
              value={followUpDays}
              onChange={(e) => setFollowUpDays(parseInt(e.target.value, 10) || 3)}
              className="w-20"
              disabled={!followUpEnabled}
            />
            <span className="text-sm text-muted-foreground">
              days after appointment
            </span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="followup-message" className="text-sm">
              Default message
            </Label>
            <Textarea
              id="followup-message"
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={!followUpEnabled}
              placeholder="Thank you for your recent walkthrough..."
            />
            <p className="text-xs text-muted-foreground">
              This message can be customized per appointment when sending
              manually.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save */}
      <div className="flex items-center justify-between">
        {feedback && (
          <p
            className={`text-sm ${
              feedback.type === "success"
                ? "text-green-600"
                : "text-destructive"
            }`}
          >
            {feedback.message}
          </p>
        )}
        <div className="ml-auto">
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-1.5 size-4" />
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
