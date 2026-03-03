import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingWizard } from "@/components/booking-wizard";

export const metadata = {
  title: "Schedule Your Walkthrough | QR Appt",
  description:
    "Book a free in-home walkthrough for your remodeling project.",
};

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 gap-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Schedule Your Walkthrough
          </h1>
          <p className="mt-2 text-muted-foreground">
            Book a free in-home consultation to discuss your remodeling project.
          </p>
        </header>

        {/* Wizard */}
        <BookingWizard />
      </div>
    </div>
  );
}
