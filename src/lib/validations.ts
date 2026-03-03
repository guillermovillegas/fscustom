import { z } from "zod/v4";

export const projectTypes = ["kitchen", "bathroom", "flooring"] as const;
export const propertyTypes = ["residential", "commercial"] as const;

export const appointmentSchema = z.object({
  project_type: z.enum(projectTypes),
  property_type: z.enum(propertyTypes),
  appointment_date: z.string().min(1, "Date is required"),
  appointment_time: z.string().min(1, "Time slot is required"),
  customer_name: z.string().min(1, "Name is required").max(100),
  customer_phone: z
    .string()
    .min(10, "Valid phone number required")
    .max(20)
    .regex(/^[\d\s\-+()]+$/, "Invalid phone number format"),
  customer_email: z.email("Invalid email").optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
