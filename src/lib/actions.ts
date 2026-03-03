"use server";

import { appointmentSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  success?: boolean;
  error?: string;
};

export async function createAppointment(data: unknown): Promise<ActionState> {
  // 1. Validate with zod
  const parsed = appointmentSchema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Invalid form data",
    };
  }

  const {
    project_type,
    property_type,
    appointment_date,
    appointment_time,
    customer_name,
    customer_phone,
    customer_email,
    description,
  } = parsed.data;

  // 2. Insert into supabase appointments table
  try {
    const supabase = await createClient();

    const { error: insertError } = await supabase
      .from("appointments")
      .insert({
        project_type,
        property_type,
        appointment_date,
        appointment_time,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        description: description || null,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return {
        success: false,
        error: "Failed to book appointment. Please try again.",
      };
    }
  } catch (err) {
    console.error("Unexpected error creating appointment:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }

  // 3. Send confirmation email (don't fail the booking if email fails)
  try {
    if (customer_email) {
      const { sendConfirmationEmail } = await import("@/lib/email");
      await sendConfirmationEmail({
        to: customer_email,
        customerName: customer_name,
        customerPhone: customer_phone,
        projectType: project_type,
        propertyType: property_type,
        appointmentDate: appointment_date,
        appointmentTime: appointment_time,
        description: description ?? undefined,
      });
    }
  } catch (emailErr) {
    console.error("Failed to send confirmation email:", emailErr);
  }

  // 4. Return success
  return { success: true };
}
