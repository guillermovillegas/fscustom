"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock,
  QrCode,
  Users,
  ArrowRight,
} from "lucide-react";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  AppointmentStats,
  QrScanStats,
  RecentActivityItem,
} from "@/lib/actions/analytics";
import type { AppointmentStatus, ProjectType } from "@/lib/types/database";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DashboardStatsProps {
  appointments: AppointmentStats;
  qrScans: QrScanStats;
  recentActivity: RecentActivityItem[];
}

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const statusChartConfig = {
  pending: { label: "Pending", color: "#facc15" },
  confirmed: { label: "Confirmed", color: "#4ade80" },
  completed: { label: "Completed", color: "#60a5fa" },
  cancelled: { label: "Cancelled", color: "#fca5a5" },
} satisfies ChartConfig;

const projectChartConfig = {
  kitchen: { label: "Kitchen", color: "#fb923c" },
  bathroom: { label: "Bathroom", color: "#22d3ee" },
  flooring: { label: "Flooring", color: "#fbbf24" },
} satisfies ChartConfig;

const qrChartConfig = {
  count: { label: "Scans", color: "#8b5cf6" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardStats({
  appointments,
  qrScans,
  recentActivity,
}: DashboardStatsProps) {
  // Prepare chart data
  const statusData = (
    ["pending", "confirmed", "completed", "cancelled"] as AppointmentStatus[]
  ).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: appointments.byStatus[status],
    fill: statusChartConfig[status].color,
  }));

  const projectData = (["kitchen", "bathroom", "flooring"] as ProjectType[]).map(
    (type) => ({
      type,
      label: PROJECT_LABELS[type],
      count: appointments.byProjectType[type],
      fill: projectChartConfig[type].color,
    })
  );

  const qrBarData = qrScans.perQrCode.slice(0, 6).map((qr) => ({
    name: qr.label.length > 12 ? qr.label.slice(0, 12) + "..." : qr.label,
    count: qr.count,
  }));

  return (
    <div className="space-y-4">
      {/* Row 1: Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {appointments.total}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Appointments
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="size-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {appointments.byStatus.pending}
              </p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100">
              <QrCode className="size-5 text-violet-700" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {qrScans.last30Days}
              </p>
              <p className="text-xs text-muted-foreground">QR Scans (30d)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
              <CalendarDays className="size-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {appointments.thisMonth}
              </p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Pie charts */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Status pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Appointment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.total === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No appointments yet.
              </p>
            ) : (
              <ChartContainer
                config={statusChartConfig}
                className="mx-auto aspect-square max-h-[160px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    strokeWidth={2}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
              {statusData.map((s) => (
                <div key={s.status} className="flex items-center gap-1.5">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: s.fill }}
                  />
                  <span className="text-muted-foreground">
                    {s.label}: {s.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project type pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              By Project Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.total === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No appointments yet.
              </p>
            ) : (
              <ChartContainer
                config={projectChartConfig}
                className="mx-auto aspect-square max-h-[160px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={projectData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    strokeWidth={2}
                  >
                    {projectData.map((entry) => (
                      <Cell key={entry.type} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
              {projectData.map((p) => (
                <div key={p.type} className="flex items-center gap-1.5">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: p.fill }}
                  />
                  <span className="text-muted-foreground">
                    {p.label}: {p.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: QR scan bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              QR Code Scans (30 days)
            </CardTitle>
            <Link
              href="/admin/qr-codes"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Manage QR codes <ArrowRight className="ml-0.5 inline size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {qrBarData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No QR scans yet. Create a QR code to start tracking.
            </p>
          ) : (
            <ChartContainer config={qrChartConfig} className="h-[200px] w-full">
              <BarChart data={qrBarData} layout="vertical" margin={{ left: 0 }}>
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                  className="text-xs"
                />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Row 4: Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Link
              href="/admin/calendar"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View calendar <ArrowRight className="ml-0.5 inline size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                      item.type === "appointment"
                        ? "bg-primary/10"
                        : "bg-violet-100"
                    }`}
                  >
                    {item.type === "appointment" ? (
                      <Users className="size-3 text-primary" />
                    ) : (
                      <QrCode className="size-3 text-violet-700" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
