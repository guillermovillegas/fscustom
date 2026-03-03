"use client";

import { useCallback, useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQrCode, updateQrCode } from "@/lib/actions/qr-codes";
import { slugify } from "@/lib/qr-utils";
import type { QrCode } from "@/lib/types/database";

interface QrCodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingQrCode?: QrCode | null;
  baseUrl: string;
}

export function QrCodeForm({
  open,
  onOpenChange,
  editingQrCode,
  baseUrl,
}: QrCodeFormProps) {
  const isEditing = !!editingQrCode;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState(editingQrCode?.label ?? "");
  const [slug, setSlug] = useState(editingQrCode?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [targetUrl, setTargetUrl] = useState(
    editingQrCode?.target_url ?? `${baseUrl}/schedule`
  );

  const redirectUrl = `${baseUrl}/r/${slug || "preview"}`;

  const handleLabelChange = useCallback(
    (value: string) => {
      setLabel(value);
      if (!slugTouched) {
        setSlug(slugify(value));
      }
    },
    [slugTouched]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = { label, slug, target_url: targetUrl };
      const result = isEditing
        ? await updateQrCode({ ...payload, id: editingQrCode.id })
        : await createQrCode(payload);

      if (result.success) {
        onOpenChange(false);
        // Reset form state
        setLabel("");
        setSlug("");
        setSlugTouched(false);
        setTargetUrl(`${baseUrl}/schedule`);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit QR Code" : "Create QR Code"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the QR code details below."
              : "Create a new trackable QR code with a short redirect URL."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-label">Label</Label>
            <Input
              id="qr-label"
              placeholder="e.g. Business Card QR"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-slug">Slug</Label>
            <Input
              id="qr-slug"
              placeholder="e.g. business-card"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              maxLength={50}
              required
            />
            <p className="text-xs text-muted-foreground">
              Redirect URL: <span className="font-mono">{redirectUrl}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-target">Target URL</Label>
            <Input
              id="qr-target"
              type="url"
              placeholder="https://example.com/schedule"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </div>

          {slug && (
            <div className="flex justify-center rounded-lg border bg-white p-4">
              <QRCodeSVG value={redirectUrl} size={160} level="H" marginSize={2} />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !label || !slug}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
