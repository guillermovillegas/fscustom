"use client";

import { useCallback } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { googleCalendarUrl, generateICS } from "@/lib/calendar-utils";

interface AddToCalendarProps {
  title: string;
  date: string;
  time: string;
  description?: string;
}

export function AddToCalendar({ title, date, time, description }: AddToCalendarProps) {
  const googleUrl = googleCalendarUrl({
    title,
    date,
    time,
    durationMinutes: 60,
    description,
  });

  const handleICS = useCallback(() => {
    const ics = generateICS({
      title,
      date,
      time,
      durationMinutes: 60,
      description,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appointment.ics";
    link.click();
    URL.revokeObjectURL(url);
  }, [title, date, time, description]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      <Button variant="outline" size="sm" asChild>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer">
          <Calendar className="mr-1.5 size-4" />
          Google Calendar
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={handleICS}>
        <Calendar className="mr-1.5 size-4" />
        Apple / Outlook (.ics)
      </Button>
    </div>
  );
}
