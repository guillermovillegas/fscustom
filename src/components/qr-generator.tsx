"use client";

import { useCallback, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const QR_SIZE = 256;

export function QrGenerator() {
  const [baseUrl, setBaseUrl] = useState(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://your-domain.com"
  );
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const bookingUrl = baseUrl.endsWith("/")
    ? `${baseUrl}book`
    : `${baseUrl}/book`;

  const handleDownload = useCallback(() => {
    const svgElement = svgContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Use 2x resolution for crisp output
      const scale = 2;
      canvas.width = QR_SIZE * scale;
      canvas.height = QR_SIZE * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "qr-code.png";
      link.href = pngUrl;
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">QR Code Generator</CardTitle>
        <CardDescription>
          Generate a QR code that links to your booking page. Print it or
          download it to share with customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="base-url">Base URL</Label>
          <Input
            id="base-url"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://your-domain.com"
          />
          <p className="text-xs text-muted-foreground">
            The QR code will link to:{" "}
            <span className="font-mono">{bookingUrl}</span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div
            ref={svgContainerRef}
            className="rounded-lg border bg-white p-4"
          >
            <QRCodeSVG
              value={bookingUrl}
              size={QR_SIZE}
              level="H"
              marginSize={2}
            />
          </div>

          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Scan this code to open the appointment booking page
          </p>

          <div className="flex gap-3">
            <Button onClick={handleDownload} variant="outline">
              Download PNG
            </Button>
            <Button onClick={handlePrint} variant="outline">
              Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
