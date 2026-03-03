import { QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QrCodeTable } from "@/components/admin/qr-code-table";
import type { QrCode as QrCodeType, QrScan } from "@/lib/types/database";

async function fetchQrData(): Promise<{
  qrCodes: (QrCodeType & { scan_count: number })[];
  scans: QrScan[];
  error: string | null;
  unconfigured: boolean;
}> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { qrCodes: [], scans: [], error: null, unconfigured: true };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Fetch QR codes
    const { data: codes, error: codesError } = await supabase
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (codesError) {
      return { qrCodes: [], scans: [], error: codesError.message, unconfigured: false };
    }

    // Fetch all scans for analytics
    const { data: scans, error: scansError } = await supabase
      .from("qr_scans")
      .select("*")
      .order("scanned_at", { ascending: false });

    if (scansError) {
      return { qrCodes: [], scans: [], error: scansError.message, unconfigured: false };
    }

    // Compute scan counts per QR code
    const scanCounts = new Map<string, number>();
    for (const scan of scans ?? []) {
      const current = scanCounts.get(scan.qr_code_id) ?? 0;
      scanCounts.set(scan.qr_code_id, current + 1);
    }

    const qrCodes = ((codes ?? []) as QrCodeType[]).map((code) => ({
      ...code,
      scan_count: scanCounts.get(code.id) ?? 0,
    }));

    return {
      qrCodes,
      scans: (scans ?? []) as QrScan[],
      error: null,
      unconfigured: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch QR data";
    return { qrCodes: [], scans: [], error: message, unconfigured: false };
  }
}

export default async function QrCodesPage() {
  const { qrCodes, scans, error, unconfigured } = await fetchQrData();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://your-domain.com";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <QrCode className="size-7 text-primary" />
          QR Code Management
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create trackable QR codes with unique redirect URLs and monitor scan
          activity.
        </p>
      </div>

      {unconfigured && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Supabase is not configured. Set environment variables to manage QR
              codes.
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Failed to load QR codes: {error}</p>
          </CardContent>
        </Card>
      )}

      {!unconfigured && !error && (
        <QrCodeTable qrCodes={qrCodes} scans={scans} baseUrl={baseUrl} />
      )}
    </div>
  );
}
