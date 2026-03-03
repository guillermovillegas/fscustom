"use client";

import { useState, useMemo, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWeekend,
  parseISO,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  Appointment,
  AppointmentStatus,
  ProjectType,
} from "@/lib/types/database";
import { DayAppointments } from "./day-appointments";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_DOT_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

const STATUS_PILL_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
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

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

interface AppointmentCalendarProps {
  appointments: Appointment[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppointmentCalendar({
  appointments: initialAppointments,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);

  // Group appointments by date string for quick lookup
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const key = appt.appointment_date; // "YYYY-MM-DD"
      const existing = map.get(key);
      if (existing) {
        existing.push(appt);
      } else {
        map.set(key, [appt]);
      }
    }
    return map;
  }, [appointments]);

  // Generate calendar grid days (6 weeks to always fill grid)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Appointments for the selected date
  const selectedDateAppointments = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return appointmentsByDate.get(key) ?? [];
  }, [selectedDate, appointmentsByDate]);

  // Upcoming appointments for mobile view
  const upcomingAppointments = useMemo(() => {
    const today = startOfDay(new Date());
    return appointments
      .filter((appt) => {
        const apptDate = parseISO(appt.appointment_date);
        return (
          !isBefore(apptDate, today) &&
          appt.status !== "cancelled" &&
          appt.status !== "completed"
        );
      })
      .sort((a, b) => {
        const dateCmp = a.appointment_date.localeCompare(b.appointment_date);
        if (dateCmp !== 0) return dateCmp;
        return a.appointment_time.localeCompare(b.appointment_time);
      })
      .slice(0, 10);
  }, [appointments]);

  // Navigation
  const goToPrevMonth = useCallback(
    () => setCurrentMonth((prev) => subMonths(prev, 1)),
    []
  );
  const goToNextMonth = useCallback(
    () => setCurrentMonth((prev) => addMonths(prev, 1)),
    []
  );
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  }, []);

  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate(day);
  }, []);

  const handleAppointmentUpdate = useCallback((updated: Appointment) => {
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === updated.id ? updated : appt))
    );
  }, []);

  const handleAppointmentCreate = useCallback((appt: Appointment) => {
    setAppointments((prev) => [...prev, appt]);
  }, []);

  // Get count + status breakdown for a given day
  const getDayInfo = useCallback(
    (day: Date) => {
      const key = format(day, "yyyy-MM-dd");
      const dayAppointments = appointmentsByDate.get(key);
      if (!dayAppointments || dayAppointments.length === 0) {
        return { count: 0, appointments: [] as Appointment[] };
      }
      return { count: dayAppointments.length, appointments: dayAppointments };
    },
    [appointmentsByDate]
  );

  // Month stats
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    let total = 0;
    const statusCounts: Record<AppointmentStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const appt of appointments) {
      const apptDate = parseISO(appt.appointment_date);
      if (apptDate >= monthStart && apptDate <= monthEnd) {
        total++;
        statusCounts[appt.status]++;
      }
    }

    return { total, statusCounts };
  }, [appointments, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-[180px] text-center text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Month Summary */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {monthStats.total} appointments:
          </span>
          {monthStats.statusCounts.pending > 0 && (
            <Badge
              variant="outline"
              className="border-yellow-300 bg-yellow-50 text-yellow-800"
            >
              {monthStats.statusCounts.pending} pending
            </Badge>
          )}
          {monthStats.statusCounts.confirmed > 0 && (
            <Badge
              variant="outline"
              className="border-green-300 bg-green-50 text-green-800"
            >
              {monthStats.statusCounts.confirmed} confirmed
            </Badge>
          )}
          {monthStats.statusCounts.completed > 0 && (
            <Badge
              variant="outline"
              className="border-blue-300 bg-blue-50 text-blue-800"
            >
              {monthStats.statusCounts.completed} completed
            </Badge>
          )}
          {monthStats.statusCounts.cancelled > 0 && (
            <Badge
              variant="outline"
              className="border-red-300 bg-red-50 text-red-800"
            >
              {monthStats.statusCounts.cancelled} cancelled
            </Badge>
          )}
        </div>
      </div>

      {/* Desktop: Calendar Grid + Day Detail */}
      <div className="hidden md:grid md:grid-cols-[1fr_340px] md:gap-6">
        {/* Calendar Grid */}
        <Card className="overflow-hidden py-0">
          <CardContent className="p-0">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b bg-muted/50">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="px-2 py-2.5 text-center text-xs font-medium text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const { count, appointments: dayAppts } = getDayInfo(day);
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const weekend = isWeekend(day);
                const selected = isSameDay(day, selectedDate);

                // Collect unique statuses for dots
                const statuses = [
                  ...new Set(dayAppts.map((a) => a.status)),
                ] as AppointmentStatus[];

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "relative flex min-h-[100px] flex-col border-b border-r p-1.5 text-left transition-colors",
                      "hover:bg-accent/50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      !inMonth && "bg-muted/30",
                      weekend && inMonth && "bg-muted/20",
                      selected && "ring-2 ring-inset ring-primary",
                      today && "bg-primary/5"
                    )}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-sm",
                          !inMonth && "text-muted-foreground/40",
                          inMonth && "text-foreground",
                          weekend && inMonth && "text-muted-foreground",
                          today &&
                            "bg-primary font-semibold text-primary-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 min-w-5 px-1 text-[10px]"
                        >
                          {count}
                        </Badge>
                      )}
                    </div>

                    {/* Appointment Pills */}
                    {inMonth && dayAppts.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
                        {dayAppts
                          .sort((a, b) =>
                            a.appointment_time.localeCompare(
                              b.appointment_time
                            )
                          )
                          .slice(0, 3)
                          .map((appt) => (
                            <div
                              key={appt.id}
                              className={cn(
                                "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                                STATUS_PILL_STYLES[appt.status]
                              )}
                              title={`${formatTime(appt.appointment_time)} - ${appt.customer_name}`}
                            >
                              {formatTime(appt.appointment_time)}{" "}
                              {appt.customer_name.split(" ")[0]}
                            </div>
                          ))}
                        {dayAppts.length > 3 && (
                          <span className="px-1 text-[10px] text-muted-foreground">
                            +{dayAppts.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status dots row (bottom) */}
                    {inMonth && statuses.length > 0 && (
                      <div className="mt-auto flex gap-0.5 pt-1">
                        {statuses.map((status) => (
                          <div
                            key={status}
                            className={cn(
                              "size-1.5 rounded-full",
                              STATUS_DOT_COLORS[status]
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Detail Panel */}
        <div>
          <DayAppointments
            date={selectedDate}
            appointments={selectedDateAppointments}
            onAppointmentUpdate={handleAppointmentUpdate}
            onAppointmentCreate={handleAppointmentCreate}
          />
        </div>
      </div>

      {/* Mobile: List View */}
      <div className="space-y-4 md:hidden">
        {/* Mini month navigator */}
        <Card>
          <CardContent className="p-3">
            {/* Compact calendar grid for mobile */}
            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="text-center text-[10px] font-medium text-muted-foreground"
                >
                  {label.charAt(0)}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const { count } = getDayInfo(day);
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const selected = isSameDay(day, selectedDate);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "relative flex flex-col items-center rounded-md p-1 text-xs transition-colors",
                      !inMonth && "text-muted-foreground/30",
                      selected && "bg-primary text-primary-foreground",
                      today &&
                        !selected &&
                        "bg-accent font-semibold text-accent-foreground",
                      inMonth &&
                        !selected &&
                        !today &&
                        "hover:bg-accent/50"
                    )}
                  >
                    {format(day, "d")}
                    {count > 0 && inMonth && (
                      <div
                        className={cn(
                          "mt-0.5 size-1 rounded-full",
                          selected ? "bg-primary-foreground" : "bg-primary"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected day appointments */}
        <DayAppointments
          date={selectedDate}
          appointments={selectedDateAppointments}
          onAppointmentUpdate={handleAppointmentUpdate}
          onAppointmentCreate={handleAppointmentCreate}
        />

        {/* Upcoming appointments list */}
        {upcomingAppointments.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarDays className="size-4" />
              Upcoming
            </h3>
            <div className="space-y-2">
              {upcomingAppointments.map((appt) => (
                <Card key={appt.id} className="py-0">
                  <CardContent className="flex items-center gap-3 p-3">
                    {/* Status dot */}
                    <div
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        STATUS_DOT_COLORS[appt.status]
                      )}
                    />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {appt.customer_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {format(
                            parseISO(appt.appointment_date),
                            "MMM d"
                          )}
                        </span>
                        <Clock className="size-3" />
                        <span>{formatTime(appt.appointment_time)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {PROJECT_LABELS[appt.project_type]}
                      </Badge>
                      <a
                        href={`tel:${appt.customer_phone}`}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label={`Call ${appt.customer_name}`}
                      >
                        <Phone className="size-3.5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
