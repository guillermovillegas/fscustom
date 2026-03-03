"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const slugSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only");

const createQrCodeSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  slug: slugSchema,
  target_url: z.url("Must be a valid URL"),
});

const updateQrCodeSchema = z.object({
  id: z.uuid(),
  label: z.string().min(1, "Label is required").max(100),
  slug: slugSchema,
  target_url: z.url("Must be a valid URL"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QrActionState = {
  success?: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function createQrCode(data: unknown): Promise<QrActionState> {
  const parsed = createQrCodeSchema.safeParse(data);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("qr_codes").insert({
    label: parsed.data.label,
    slug: parsed.data.slug,
    target_url: parsed.data.target_url,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A QR code with this slug already exists." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/qr-codes");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateQrCode(data: unknown): Promise<QrActionState> {
  const parsed = updateQrCodeSchema.safeParse(data);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("qr_codes")
    .update({
      label: parsed.data.label,
      slug: parsed.data.slug,
      target_url: parsed.data.target_url,
    })
    .eq("id", parsed.data.id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A QR code with this slug already exists." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/qr-codes");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleQrCode(
  id: string,
  isActive: boolean
): Promise<QrActionState> {
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: "Invalid QR code ID" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("qr_codes")
    .update({ is_active: isActive })
    .eq("id", parsedId.data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/qr-codes");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteQrCode(id: string): Promise<QrActionState> {
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: "Invalid QR code ID" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("qr_codes")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/qr-codes");
  revalidatePath("/admin");
  return { success: true };
}
