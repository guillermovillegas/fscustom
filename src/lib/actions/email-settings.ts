"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { EmailSettings } from "@/lib/types/database";

const updateSchema = z.object({
  confirmation_enabled: z.boolean(),
  reminder_enabled: z.boolean(),
  reminder_hours_before: z.number().int().min(1).max(168),
  follow_up_enabled: z.boolean(),
  follow_up_days_after: z.number().int().min(1).max(30),
  follow_up_default_message: z.string().max(1000),
});

export type EmailSettingsActionState = {
  success?: boolean;
  error?: string;
};

export async function getEmailSettings(): Promise<EmailSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("email_settings")
    .select("*")
    .limit(1)
    .single();

  return (data as EmailSettings) ?? null;
}

export async function updateEmailSettings(
  data: unknown
): Promise<EmailSettingsActionState> {
  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Invalid data" };
  }

  const supabase = await createClient();

  // Get the singleton row ID
  const { data: existing } = await supabase
    .from("email_settings")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    return { success: false, error: "Email settings not initialized" };
  }

  const { error } = await supabase
    .from("email_settings")
    .update(parsed.data)
    .eq("id", existing.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
