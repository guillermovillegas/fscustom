"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleQrCode, deleteQrCode } from "@/lib/actions/qr-codes";
import { downloadQrPng } from "@/lib/qr-utils";
import { QrCodeForm } from "./qr-code-form";
import { QrCodeDetail } from "./qr-code-detail";
import type { QrCode, QrScan } from "@/lib/types/database";

interface QrCodeWithScans extends QrCode {
  scan_count: number;
}

interface QrCodeTableProps {
  qrCodes: QrCodeWithScans[];
  scans: QrScan[];
  baseUrl: string;
}

export function QrCodeTable({ qrCodes, scans, baseUrl }: QrCodeTableProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingQrCode, setEditingQrCode] = useState<QrCode | null>(null);
  const [detailQrCode, setDetailQrCode] = useState<QrCode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<QrCode | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const downloadRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCopy = useCallback(
    (slug: string) => {
      const url = `${baseUrl}/r/${slug}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
      });
    },
    [baseUrl]
  );

  const handleDownload = useCallback(
    (slug: string) => {
      const container = downloadRefs.current[slug];
      const svg = container?.querySelector("svg");
      if (svg) {
        downloadQrPng(svg, `qr-${slug}.png`);
      }
    },
    []
  );

  const handleToggle = useCallback((id: string, currentlyActive: boolean) => {
    startTransition(async () => {
      await toggleQrCode(id, !currentlyActive);
    });
  }, []);

  const handleDelete = useCallback((qrCode: QrCode) => {
    setDeleteConfirm(qrCode);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    startTransition(async () => {
      await deleteQrCode(deleteConfirm.id);
      setDeleteConfirm(null);
    });
  }, [deleteConfirm]);

  const handleEdit = useCallback((qrCode: QrCode) => {
    setEditingQrCode(qrCode);
    setFormOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">QR Codes</h2>
          <p className="text-sm text-muted-foreground">
            {qrCodes.length} QR code{qrCodes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingQrCode(null);
            setFormOpen(true);
          }}
          size="sm"
        >
          <Plus className="mr-1.5 size-4" />
          New QR Code
        </Button>
      </div>

      {qrCodes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No QR codes yet. Create one to start tracking scans.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-center">Scans</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <div
                        ref={(el) => { downloadRefs.current[qr.slug] = el; }}
                        className="flex size-10 items-center justify-center rounded border bg-white"
                      >
                        <QRCodeSVG
                          value={`${baseUrl}/r/${qr.slug}`}
                          size={32}
                          level="H"
                          marginSize={0}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        className="font-medium hover:underline"
                        onClick={() => setDetailQrCode(qr)}
                      >
                        {qr.label}
                      </button>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        /r/{qr.slug}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {qr.target_url}
                    </TableCell>
                    <TableCell className="text-center font-medium tabular-nums">
                      {qr.scan_count}
                    </TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => handleToggle(qr.id, qr.is_active)}>
                        <Badge
                          variant={qr.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                        >
                          {qr.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="size-8 p-0">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopy(qr.slug)}>
                            <Copy className="mr-2 size-4" />
                            {copiedSlug === qr.slug ? "Copied!" : "Copy URL"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(qr.slug)}>
                            <Download className="mr-2 size-4" />
                            Download PNG
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(qr)}>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(qr)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {qrCodes.map((qr) => (
              <div
                key={qr.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <button
                      className="font-medium hover:underline"
                      onClick={() => setDetailQrCode(qr)}
                    >
                      {qr.label}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      <code>/r/{qr.slug}</code>
                    </p>
                  </div>
                  <div
                    ref={(el) => { downloadRefs.current[qr.slug] = el; }}
                    className="flex size-12 items-center justify-center rounded border bg-white"
                  >
                    <QRCodeSVG
                      value={`${baseUrl}/r/${qr.slug}`}
                      size={40}
                      level="H"
                      marginSize={0}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <button onClick={() => handleToggle(qr.id, qr.is_active)}>
                    <Badge
                      variant={qr.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                    >
                      {qr.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                  <span className="text-muted-foreground">
                    {qr.scan_count} scan{qr.scan_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(qr.slug)}
                  >
                    <Copy className="mr-1.5 size-3" />
                    {copiedSlug === qr.slug ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(qr.slug)}
                  >
                    <Download className="mr-1.5 size-3" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(qr)}
                  >
                    <Edit className="mr-1.5 size-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(qr)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create / Edit form dialog */}
      <QrCodeForm
        key={editingQrCode?.id ?? "create"}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingQrCode(null);
        }}
        editingQrCode={editingQrCode}
        baseUrl={baseUrl}
      />

      {/* Detail dialog */}
      {detailQrCode && (
        <QrCodeDetail
          qrCode={detailQrCode}
          scans={scans.filter((s) => s.qr_code_id === detailQrCode.id)}
          baseUrl={baseUrl}
          open={!!detailQrCode}
          onOpenChange={(open) => {
            if (!open) setDetailQrCode(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete QR Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteConfirm?.label}&rdquo;?
              This will also delete all scan history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
