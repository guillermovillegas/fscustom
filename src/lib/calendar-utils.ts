/**
 * Utilities for generating "Add to Calendar" links.
 */

interface CalendarEventParams {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "2:00 PM"
  durationMinutes?: number;
  description?: string;
  location?: string;
}

function parseTime(time: string): { hours: number; minutes: number } {
  // Parse "2:00 PM", "10:30 AM" etc.
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    // Fallback: try 24h format "14:00"
    const [h, m] = time.split(":");
    return { hours: parseInt(h, 10), minutes: parseInt(m, 10) };
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

function toICSDate(date: string, time: string): string {
  const { hours, minutes } = parseTime(time);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(hours, minutes, 0, 0);
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function toGoogleDate(date: string, time: string): string {
  const { hours, minutes } = parseTime(time);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(hours, minutes, 0, 0);
  // Google format: YYYYMMDDTHHmmss (local time, no Z)
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/**
 * Generate a Google Calendar URL.
 */
export function googleCalendarUrl(params: CalendarEventParams): string {
  const duration = params.durationMinutes ?? 60;
  const startDate = toGoogleDate(params.date, params.time);

  const { hours, minutes } = parseTime(params.time);
  const endD = new Date(`${params.date}T00:00:00`);
  endD.setHours(hours, minutes + duration, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const endDate = `${endD.getFullYear()}${pad(endD.getMonth() + 1)}${pad(endD.getDate())}T${pad(endD.getHours())}${pad(endD.getMinutes())}00`;

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${startDate}/${endDate}`);
  if (params.description) url.searchParams.set("details", params.description);
  if (params.location) url.searchParams.set("location", params.location);
  return url.toString();
}

/**
 * Generate an .ics file content string (for Apple Calendar, Outlook, etc.).
 */
export function generateICS(params: CalendarEventParams): string {
  const duration = params.durationMinutes ?? 60;
  const dtStart = toICSDate(params.date, params.time);

  const { hours, minutes } = parseTime(params.time);
  const endD = new Date(`${params.date}T00:00:00`);
  endD.setHours(hours, minutes + duration, 0, 0);
  const dtEnd = endD
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FS Custom Flooring//Appointment//EN",
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${params.title}`,
    params.description ? `DESCRIPTION:${params.description.replace(/\n/g, "\\n")}` : "",
    params.location ? `LOCATION:${params.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.filter(Boolean).join("\r\n");
}
