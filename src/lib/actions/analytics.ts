"use server";

import { createClient } from "@/lib/supabase/server";
import type { Appointment, AppointmentStatus, ProjectType } from "@/lib/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppointmentStats {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byProjectType: Record<ProjectType, number>;
  thisWeek: number;
  thisMonth: number;
}

export interface QrScanStats {
  last30Days: number;
  perQrCode: { label: string; slug: string; count: number }[];
}

export interface RecentActivityItem {
  type: "appointment" | "scan";
  timestamp: string;
  label: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  return start.toISOString().slice(0, 10);
}

function startOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Data fetchers
// ---------------------------------------------------------------------------

export async function getAppointmentStats(): Promise<AppointmentStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("status, project_type, appointment_date");

  const appointments = (data ?? []) as Pick<
    Appointment,
    "status" | "project_type" | "appointment_date"
  >[];

  const byStatus: Record<AppointmentStatus, number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  const byProjectType: Record<ProjectType, number> = {
    kitchen: 0,
    bathroom: 0,
    flooring: 0,
  };

  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  let thisWeek = 0;
  let thisMonth = 0;

  for (const appt of appointments) {
    byStatus[appt.status]++;
    byProjectType[appt.project_type]++;
    if (appt.appointment_date >= weekStart) thisWeek++;
    if (appt.appointment_date >= monthStart) thisMonth++;
  }

  return {
    total: appointments.length,
    byStatus,
    byProjectType,
    thisWeek,
    thisMonth,
  };
}

export async function getQrScanStats(): Promise<QrScanStats> {
  const supabase = await createClient();
  const cutoff = thirtyDaysAgo();

  const { data: scans } = await supabase
    .from("qr_scans")
    .select("qr_code_id, scanned_at")
    .gte("scanned_at", cutoff);

  const { data: codes } = await supabase
    .from("qr_codes")
    .select("id, label, slug");

  const codeMap = new Map(
    ((codes ?? []) as { id: string; label: string; slug: string }[]).map((c) => [
      c.id,
      c,
    ])
  );

  const countMap = new Map<string, number>();
  for (const scan of (scans ?? []) as { qr_code_id: string; scanned_at: string }[]) {
    const current = countMap.get(scan.qr_code_id) ?? 0;
    countMap.set(scan.qr_code_id, current + 1);
  }

  const perQrCode = Array.from(countMap.entries())
    .map(([id, count]) => {
      const code = codeMap.get(id);
      return {
        label: code?.label ?? "Unknown",
        slug: code?.slug ?? "",
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    last30Days: (scans ?? []).length,
    perQrCode,
  };
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("customer_name, project_type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: scans } = await supabase
    .from("qr_scans")
    .select("scanned_at, qr_code_id, user_agent")
    .order("scanned_at", { ascending: false })
    .limit(5);

  const { data: codes } = await supabase
    .from("qr_codes")
    .select("id, label");

  const codeMap = new Map(
    ((codes ?? []) as { id: string; label: string }[]).map((c) => [c.id, c.label])
  );

  const items: RecentActivityItem[] = [];

  for (const appt of (appointments ?? []) as Pick<
    Appointment,
    "customer_name" | "project_type" | "status" | "created_at"
  >[]) {
    items.push({
      type: "appointment",
      timestamp: appt.created_at,
      label: appt.customer_name,
      detail: `${appt.project_type} — ${appt.status}`,
    });
  }

  for (const scan of (scans ?? []) as {
    scanned_at: string;
    qr_code_id: string;
    user_agent: string | null;
  }[]) {
    items.push({
      type: "scan",
      timestamp: scan.scanned_at,
      label: codeMap.get(scan.qr_code_id) ?? "QR Scan",
      detail: scan.user_agent?.includes("iPhone")
        ? "iPhone"
        : scan.user_agent?.includes("Android")
          ? "Android"
          : "Device scan",
    });
  }

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}
