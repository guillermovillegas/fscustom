"use client";

import { useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { downloadQrPng } from "@/lib/qr-utils";
import type { QrCode, QrScan } from "@/lib/types/database";

interface QrCodeDetailProps {
  qrCode: QrCode;
  scans: QrScan[];
  baseUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPad")) return "iPad";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Macintosh")) return "Mac";
  if (ua.includes("Linux")) return "Linux";
  return "Other";
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function QrCodeDetail({
  qrCode,
  scans,
  baseUrl,
  open,
  onOpenChange,
}: QrCodeDetailProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const redirectUrl = `${baseUrl}/r/${qrCode.slug}`;

  const handleDownload = useCallback(() => {
    const svg = svgRef.current?.querySelector("svg");
    if (svg) {
      downloadQrPng(svg, `qr-${qrCode.slug}.png`, 256);
    }
  }, [qrCode.slug]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(redirectUrl);
  }, [redirectUrl]);

  const sortedScans = [...scans].sort(
    (a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{qrCode.label}</DialogTitle>
          <DialogDescription>
            <code className="text-xs">/r/{qrCode.slug}</code>
            {" "}
            <Badge
              variant={qrCode.is_active ? "default" : "secondary"}
              className="ml-1"
            >
              {qrCode.is_active ? "Active" : "Inactive"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Large QR preview */}
          <div
            ref={svgRef}
            className="mx-auto flex w-fit rounded-lg border bg-white p-4"
          >
            <QRCodeSVG value={redirectUrl} size={200} level="H" marginSize={2} />
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-1.5 size-3.5" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 size-3.5" />
              Copy URL
            </Button>
          </div>

          {/* Target URL */}
          <div className="space-y-1 text-sm">
            <p className="font-medium">Redirects to:</p>
            <p className="break-all text-muted-foreground">{qrCode.target_url}</p>
          </div>

          <Separator />

          {/* Scan history */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Scan History ({scans.length} total)
            </p>
            {sortedScans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {sortedScans.slice(0, 50).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">
                        {formatTimestamp(scan.scanned_at)}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {parseUserAgent(scan.user_agent)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
