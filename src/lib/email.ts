"use server";

import { Resend } from "resend";
import { AppointmentConfirmation } from "@/emails/appointment-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendConfirmationParams {
  to: string;
  customerName: string;
  customerPhone: string;
  projectType: string;
  propertyType: string;
  appointmentDate: string;
  appointmentTime: string;
  description?: string;
}

interface EmailResult {
  success: boolean;
  skipped?: boolean;
  data?: { id: string };
  error?: string;
}

export async function sendConfirmationEmail(
  params: SendConfirmationParams
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set, skipping email");
    return { success: true, skipped: true };
  }

  const { to, ...templateProps } = params;

  const { data, error } = await resend.emails.send({
    from: "Premier Remodeling <onboarding@resend.dev>",
    to,
    subject: `Appointment Confirmed - ${templateProps.projectType.charAt(0).toUpperCase() + templateProps.projectType.slice(1)} Walkthrough`,
    react: AppointmentConfirmation(templateProps),
  });

  if (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? undefined };
}
