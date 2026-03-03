"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/types/database";

const updateAppointmentSchema = z.object({
  id: z.string().min(1, "Appointment ID is required"),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  admin_notes: z.string().max(2000).optional().nullable(),
  customer_address: z.string().max(500).optional().nullable(),
  follow_up_date: z.string().optional().nullable(),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

export type UpdateAppointmentResult = {
  success: boolean;
  error?: string;
};

export async function updateAppointment(
  data: unknown
): Promise<UpdateAppointmentResult> {
  const parsed = updateAppointmentSchema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Invalid data",
    };
  }

  const { id, ...updates } = parsed.data;

  // Build the update payload, only including fields that were provided
  const updatePayload: Record<string, unknown> = {};
  if (updates.status !== undefined) {
    updatePayload.status = updates.status as AppointmentStatus;
  }
  if (updates.admin_notes !== undefined) {
    updatePayload.admin_notes = updates.admin_notes;
  }
  if (updates.customer_address !== undefined) {
    updatePayload.customer_address = updates.customer_address;
  }
  if (updates.follow_up_date !== undefined) {
    updatePayload.follow_up_date = updates.follow_up_date;
  }
  updatePayload.updated_at = new Date().toISOString();

  if (Object.keys(updatePayload).length <= 1) {
    return { success: false, error: "No fields to update" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("appointments")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);
      return {
        success: false,
        error: "Failed to update appointment. Please try again.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating appointment:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function sendFollowUpEmail(
  appointmentId: string
): Promise<UpdateAppointmentResult> {
  if (!appointmentId) {
    return { success: false, error: "Appointment ID is required" };
  }

  try {
    const supabase = await createClient();

    // Fetch the appointment
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Send follow-up email if customer has an email
    if (appointment.customer_email) {
      try {
        const { sendConfirmationEmail } = await import("@/lib/email");
        await sendConfirmationEmail({
          to: appointment.customer_email,
          customerName: appointment.customer_name,
          customerPhone: appointment.customer_phone,
          projectType: appointment.project_type,
          propertyType: appointment.property_type,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          description: appointment.description ?? undefined,
        });
      } catch (emailErr) {
        console.error("Failed to send follow-up email:", emailErr);
        return { success: false, error: "Failed to send email" };
      }
    } else {
      return { success: false, error: "No email address on file" };
    }

    // Mark follow-up as sent
    await supabase
      .from("appointments")
      .update({
        follow_up_sent: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending follow-up:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
