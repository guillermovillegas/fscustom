"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isBefore, startOfDay, isSunday } from "date-fns";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  Bath,
  Layers,
  Home,
  Building2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  appointmentSchema,
  type AppointmentFormData,
  projectTypes,
  propertyTypes,
} from "@/lib/validations";
import { createAppointment } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { StepIndicator } from "@/components/step-indicator";

import type { ProjectType, PropertyType } from "@/lib/types/database";

const TOTAL_STEPS = 5;

const PROJECT_OPTIONS: {
  value: ProjectType;
  label: string;
  icon: typeof UtensilsCrossed;
  description: string;
}[] = [
  {
    value: "kitchen",
    label: "Kitchen",
    icon: UtensilsCrossed,
    description: "Countertops, cabinets, backsplash & more",
  },
  {
    value: "bathroom",
    label: "Bathroom",
    icon: Bath,
    description: "Tile, showers, vanities & tub surrounds",
  },
  {
    value: "flooring",
    label: "Flooring",
    icon: Layers,
    description: "Hardwood, tile, LVP & custom flooring",
  },
];

const PROPERTY_OPTIONS: {
  value: PropertyType;
  label: string;
  icon: typeof Home;
  description: string;
}[] = [
  {
    value: "residential",
    label: "Residential",
    icon: Home,
    description: "Single family homes, condos & apartments",
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: Building2,
    description: "Offices, retail spaces & restaurants",
  },
];

const TIME_SLOTS = [
  { label: "Early Morning", range: "8:00 – 10:00 AM", value: "8:00 AM" },
  { label: "Late Morning", range: "10:00 AM – 12:00 PM", value: "10:00 AM" },
  { label: "Early Afternoon", range: "12:00 – 2:00 PM", value: "12:00 PM" },
  { label: "Mid Afternoon", range: "2:00 – 4:00 PM", value: "2:00 PM" },
  { label: "Late Afternoon", range: "4:00 – 5:30 PM", value: "4:00 PM" },
  { label: "Evening", range: "5:30 – 7:00 PM", value: "5:30 PM" },
] as const;

function isDateDisabled(date: Date): boolean {
  const today = startOfDay(new Date());
  return isBefore(date, today) || isSunday(date);
}

export function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      project_type: undefined as unknown as (typeof projectTypes)[number],
      property_type: undefined as unknown as (typeof propertyTypes)[number],
      appointment_date: "",
      appointment_time: "",
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      description: "",
    },
    mode: "onTouched",
  });

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setSubmitError(null);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setSubmitError(null);
  }, []);

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
    setSubmitError(null);
  }, []);

  const handleProjectSelect = useCallback(
    (value: (typeof projectTypes)[number]) => {
      form.setValue("project_type", value, { shouldValidate: true });
      goNext();
    },
    [form, goNext]
  );

  const handlePropertySelect = useCallback(
    (value: (typeof propertyTypes)[number]) => {
      form.setValue("property_type", value, { shouldValidate: true });
      goNext();
    },
    [form, goNext]
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        form.setValue("appointment_date", format(date, "yyyy-MM-dd"), {
          shouldValidate: true,
        });
      }
    },
    [form]
  );

  const handleTimeSelect = useCallback(
    (time: string) => {
      form.setValue("appointment_time", time, { shouldValidate: true });
      goNext();
    },
    [form, goNext]
  );

  const onSubmit = useCallback(
    async (data: AppointmentFormData) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await createAppointment(data);

        if (result.success) {
          const params = new URLSearchParams({
            name: data.customer_name,
            date: data.appointment_date,
            time: data.appointment_time,
            project: data.project_type,
          });
          router.push(`/confirmation?${params.toString()}`);
        } else {
          setSubmitError(
            result.error ?? "Something went wrong. Please try again."
          );
        }
      } catch {
        setSubmitError("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  const selectedDate = form.watch("appointment_date");
  const selectedTime = form.watch("appointment_time");
  const selectedProject = form.watch("project_type");
  const selectedProperty = form.watch("property_type");

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="relative min-h-[400px]">
            {/* Step 1: Project Type */}
            <StepContainer isActive={currentStep === 1}>
              <StepHeader
                title="What type of project?"
                subtitle="Select the area you'd like to update"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {PROJECT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedProject === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleProjectSelect(option.value)}
                      className={cn(
                        "group flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all duration-200",
                        "hover:border-primary/50 hover:shadow-md",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-muted bg-card"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-14 items-center justify-center rounded-full transition-colors duration-200",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        <Icon className="size-7" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{option.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </StepContainer>

            {/* Step 2: Property Type */}
            <StepContainer isActive={currentStep === 2}>
              <StepHeader
                title="What type of property?"
                subtitle="This helps us prepare for your walkthrough"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {PROPERTY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedProperty === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handlePropertySelect(option.value)}
                      className={cn(
                        "group flex flex-col items-center gap-3 rounded-xl border-2 p-8 text-center transition-all duration-200",
                        "hover:border-primary/50 hover:shadow-md",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-muted bg-card"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-16 items-center justify-center rounded-full transition-colors duration-200",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        <Icon className="size-8" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{option.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <NavigationButtons onBack={goBack} />
            </StepContainer>

            {/* Step 3: Select Date */}
            <StepContainer isActive={currentStep === 3}>
              <StepHeader
                title="Pick a date"
                subtitle="Choose a convenient day for your walkthrough"
              />

              <div className="flex flex-col items-center gap-4">
                <Card className="w-full">
                  <CardContent className="flex justify-center p-2 sm:p-4">
                    <Calendar
                      mode="single"
                      selected={
                        selectedDate ? new Date(selectedDate + "T00:00:00") : undefined
                      }
                      onSelect={handleDateSelect}
                      disabled={isDateDisabled}
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                {selectedDate && (
                  <p className="text-center text-sm font-medium text-primary">
                    Selected:{" "}
                    {format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </div>

              <NavigationButtons
                onBack={goBack}
                onNext={selectedDate ? goNext : undefined}
                nextDisabled={!selectedDate}
                showNext
              />
            </StepContainer>

            {/* Step 4: Select Time */}
            <StepContainer isActive={currentStep === 4}>
              <StepHeader
                title="Choose a time"
                subtitle={
                  selectedDate
                    ? `Available times for ${format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d")}`
                    : "Select a time slot"
                }
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => handleTimeSelect(slot.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all duration-200",
                        "hover:border-primary/50 hover:shadow-md",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-muted bg-card"
                      )}
                    >
                      <span className="text-sm font-semibold">
                        {slot.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {slot.range}
                      </span>
                    </button>
                  );
                })}
              </div>

              <NavigationButtons onBack={goBack} />
            </StepContainer>

            {/* Step 5: Contact Info */}
            <StepContainer isActive={currentStep === 5}>
              <StepHeader
                title="Your contact details"
                subtitle="We'll use this info to confirm your appointment"
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(515) 555-0123"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project..."
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitError && (
                  <div
                    role="alert"
                    className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {submitError}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Walkthrough"
                  )}
                </Button>
              </div>
            </StepContainer>
          </div>
        </form>
      </Form>
    </div>
  );
}

// --- Sub-components ---

function StepContainer({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  if (!isActive) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
      {children}
    </div>
  );
}

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function NavigationButtons({
  onBack,
  onNext,
  nextDisabled,
  showNext = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  showNext?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {onBack && (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}
      {showNext && (
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="ml-auto gap-2"
        >
          Next
          <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
