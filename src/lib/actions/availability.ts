"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";

type ActionState = { success: boolean; error?: string };

const slotIdSchema = z.string().uuid("Invalid slot ID");

const addTimeSlotSchema = z.object({
  day_of_week: z
    .number()
    .int()
    .min(0, "Day must be 0-6")
    .max(6, "Day must be 0-6"),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (expected HH:MM)"),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (expected HH:MM)"),
});

export async function toggleTimeSlot(
  slotId: string,
  isActive: boolean
): Promise<ActionState> {
  const idResult = slotIdSchema.safeParse(slotId);
  if (!idResult.success) {
    return { success: false, error: "Invalid slot ID" };
  }

  if (typeof isActive !== "boolean") {
    return { success: false, error: "Invalid active state" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("time_slots")
      .update({ is_active: isActive })
      .eq("id", slotId);

    if (error) {
      console.error("Supabase toggle error:", error);
      return { success: false, error: "Failed to update time slot." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error toggling time slot:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function addTimeSlot(data: {
  day_of_week: number;
  start_time: string;
  end_time: string;
}): Promise<ActionState> {
  const parsed = addTimeSlotSchema.safeParse(data);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Invalid time slot data",
    };
  }

  const { day_of_week, start_time, end_time } = parsed.data;

  // Normalize to HH:MM:SS for Supabase time column
  const normalizeTime = (t: string): string =>
    t.length === 5 ? `${t}:00` : t;

  try {
    const supabase = await createClient();

    // Check for duplicate time slot on the same day
    const { data: existing, error: checkError } = await supabase
      .from("time_slots")
      .select("id")
      .eq("day_of_week", day_of_week)
      .eq("start_time", normalizeTime(start_time))
      .limit(1);

    if (checkError) {
      console.error("Supabase check error:", checkError);
      return { success: false, error: "Failed to check for duplicates." };
    }

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "A time slot already exists for this day and time.",
      };
    }

    const { error } = await supabase.from("time_slots").insert({
      day_of_week,
      start_time: normalizeTime(start_time),
      end_time: normalizeTime(end_time),
      is_active: true,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: "Failed to add time slot." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error adding time slot:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteTimeSlot(slotId: string): Promise<ActionState> {
  const idResult = slotIdSchema.safeParse(slotId);
  if (!idResult.success) {
    return { success: false, error: "Invalid slot ID" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("time_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      console.error("Supabase delete error:", error);
      return { success: false, error: "Failed to delete time slot." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error deleting time slot:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

const batchAddTimeSlotsSchema = z.array(
  z.object({
    day_of_week: z
      .number()
      .int()
      .min(0, "Day must be 0-6")
      .max(6, "Day must be 0-6"),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (expected HH:MM)"),
    end_time: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (expected HH:MM)"),
  })
).min(1, "At least one slot required").max(50, "Too many slots at once");

export async function batchAddTimeSlots(
  slots: Array<{ day_of_week: number; start_time: string; end_time: string }>
): Promise<ActionState & { created?: number }> {
  const parsed = batchAddTimeSlotsSchema.safeParse(slots);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Invalid batch slot data",
    };
  }

  const normalizeTime = (t: string): string =>
    t.length === 5 ? `${t}:00` : t;

  const items = parsed.data.map((s) => ({
    day_of_week: s.day_of_week,
    start_time: normalizeTime(s.start_time),
    end_time: normalizeTime(s.end_time),
  }));

  try {
    const supabase = await createClient();

    // Query existing slots for the relevant days to filter duplicates
    const daySet = [...new Set(items.map((s) => s.day_of_week))];
    const { data: existing, error: checkError } = await supabase
      .from("time_slots")
      .select("day_of_week, start_time")
      .in("day_of_week", daySet);

    if (checkError) {
      console.error("Supabase check error:", checkError);
      return { success: false, error: "Failed to check for duplicates." };
    }

    const existingKeys = new Set(
      (existing ?? []).map(
        (e: { day_of_week: number; start_time: string }) =>
          `${e.day_of_week}-${e.start_time}`
      )
    );

    const toInsert = items
      .filter((s) => !existingKeys.has(`${s.day_of_week}-${s.start_time}`))
      .map((s) => ({ ...s, is_active: true }));

    if (toInsert.length === 0) {
      return { success: true, created: 0 };
    }

    const { error } = await supabase.from("time_slots").insert(toInsert);

    if (error) {
      console.error("Supabase batch insert error:", error);
      return { success: false, error: "Failed to add time slots." };
    }

    return { success: true, created: toInsert.length };
  } catch (err) {
    console.error("Unexpected error in batchAddTimeSlots:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function batchToggleTimeSlots(
  updates: Array<{ id: string; is_active: boolean }>
): Promise<ActionState> {
  if (!Array.isArray(updates) || updates.length === 0) {
    return { success: false, error: "No updates provided" };
  }

  // Validate all IDs
  for (const update of updates) {
    const idResult = slotIdSchema.safeParse(update.id);
    if (!idResult.success) {
      return { success: false, error: `Invalid slot ID: ${update.id}` };
    }
    if (typeof update.is_active !== "boolean") {
      return { success: false, error: "Invalid active state in batch" };
    }
  }

  try {
    const supabase = await createClient();

    // Execute all updates. Supabase doesn't support batch updates natively,
    // so we run them in parallel.
    const results = await Promise.all(
      updates.map((update) =>
        supabase
          .from("time_slots")
          .update({ is_active: update.is_active })
          .eq("id", update.id)
      )
    );

    const failed = results.filter((r) => r.error);
    if (failed.length > 0) {
      console.error("Batch toggle errors:", failed.map((f) => f.error));
      return {
        success: false,
        error: `Failed to update ${failed.length} time slot(s).`,
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in batch toggle:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
