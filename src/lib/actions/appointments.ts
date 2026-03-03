"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { FollowUpEmail } from "@/emails/follow-up";
import { ReminderEmail } from "@/emails/reminder";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "FS Custom Flooring <onboarding@resend.dev>";

export interface ActionState {
  success: boolean;
  error?: string;
}

function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const updateAppointmentSchema = z.object({
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled"])
    .optional(),
  admin_notes: z.string().optional(),
  customer_address: z.string().optional(),
  follow_up_date: z.string().nullable().optional(),
});

export async function updateAppointment(
  id: string,
  data: {
    status?: string;
    admin_notes?: string;
    customer_address?: string;
    follow_up_date?: string | null;
  }
): Promise<ActionState> {
  try {
    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid appointment ID" };
    }

    const parsed = updateAppointmentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid data: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      };
    }

    const supabase = await createClient();

    const updatePayload: Record<string, unknown> = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("appointments")
      .update(updatePayload)
      .eq("id", parsedId.data);

    if (error) {
      console.error("Update appointment error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Update appointment unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function sendFollowUpEmail(
  appointmentId: string,
  customMessage: string
): Promise<ActionState> {
  try {
    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(appointmentId);
    if (!parsedId.success) {
      return { success: false, error: "Invalid appointment ID" };
    }

    const messageSchema = z.string().min(1, "Custom message is required");
    const parsedMessage = messageSchema.safeParse(customMessage);
    if (!parsedMessage.success) {
      return { success: false, error: "Custom message is required" };
    }

    const supabase = await createClient();

    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", parsedId.data)
      .single();

    if (fetchError || !appointment) {
      return { success: false, error: "Appointment not found" };
    }

    if (!appointment.customer_email) {
      return { success: false, error: "Customer does not have an email address on file" };
    }

    const subject = `Follow-up: Your ${capitalize(appointment.project_type)} Walkthrough`;

    if (!process.env.RESEND_API_KEY) {
      console.log("RESEND_API_KEY not set, skipping email send");

      await logEmail(supabase, {
        appointment_id: parsedId.data,
        email_type: "follow_up",
        subject,
        recipient_email: appointment.customer_email,
        status: "skipped",
      });

      await supabase
        .from("appointments")
        .update({ follow_up_sent: true, updated_at: new Date().toISOString() })
        .eq("id", parsedId.data);

      return { success: true };
    }

    const { error: sendError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: appointment.customer_email,
      subject,
      react: FollowUpEmail({
        customerName: appointment.customer_name,
        projectType: appointment.project_type,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        customMessage: parsedMessage.data,
      }),
    });

    if (sendError) {
      console.error("Follow-up email send error:", sendError);

      await logEmail(supabase, {
        appointment_id: parsedId.data,
        email_type: "follow_up",
        subject,
        recipient_email: appointment.customer_email,
        status: "failed",
      });

      return { success: false, error: sendError.message };
    }

    await logEmail(supabase, {
      appointment_id: parsedId.data,
      email_type: "follow_up",
      subject,
      recipient_email: appointment.customer_email,
      status: "sent",
    });

    await supabase
      .from("appointments")
      .update({ follow_up_sent: true, updated_at: new Date().toISOString() })
      .eq("id", parsedId.data);

    return { success: true };
  } catch (err) {
    console.error("Send follow-up email unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function sendReminderEmail(
  appointmentId: string
): Promise<ActionState> {
  try {
    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(appointmentId);
    if (!parsedId.success) {
      return { success: false, error: "Invalid appointment ID" };
    }

    const supabase = await createClient();

    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", parsedId.data)
      .single();

    if (fetchError || !appointment) {
      return { success: false, error: "Appointment not found" };
    }

    if (!appointment.customer_email) {
      return { success: false, error: "Customer does not have an email address on file" };
    }

    const subject = `Reminder: Your ${capitalize(appointment.project_type)} Walkthrough on ${appointment.appointment_date}`;

    if (!process.env.RESEND_API_KEY) {
      console.log("RESEND_API_KEY not set, skipping email send");

      await logEmail(supabase, {
        appointment_id: parsedId.data,
        email_type: "reminder",
        subject,
        recipient_email: appointment.customer_email,
        status: "skipped",
      });

      return { success: true };
    }

    const { error: sendError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: appointment.customer_email,
      subject,
      react: ReminderEmail({
        customerName: appointment.customer_name,
        projectType: appointment.project_type,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
      }),
    });

    if (sendError) {
      console.error("Reminder email send error:", sendError);

      await logEmail(supabase, {
        appointment_id: parsedId.data,
        email_type: "reminder",
        subject,
        recipient_email: appointment.customer_email,
        status: "failed",
      });

      return { success: false, error: sendError.message };
    }

    await logEmail(supabase, {
      appointment_id: parsedId.data,
      email_type: "reminder",
      subject,
      recipient_email: appointment.customer_email,
      status: "sent",
    });

    return { success: true };
  } catch (err) {
    console.error("Send reminder email unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

interface EmailLogEntry {
  appointment_id: string;
  email_type: string;
  subject: string;
  recipient_email: string;
  status: string;
}

async function logEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entry: EmailLogEntry
): Promise<void> {
  const { error } = await supabase.from("email_log").insert({
    ...entry,
    sent_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to log email:", error);
  }
}
