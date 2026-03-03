import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingWizard } from "@/components/booking-wizard";

export const metadata = {
  title: "Schedule Your Walkthrough | FS Custom Flooring",
  description:
    "Book a free in-home walkthrough for your next project with FS Custom Flooring in Des Moines, IA.",
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
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="FS Custom Flooring"
              width={32}
              height={32}
              className="rounded-sm"
            />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Schedule Your Walkthrough
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Book a free in-home consultation to discuss your project.
          </p>
        </header>

        {/* Wizard */}
        <BookingWizard />
      </div>
    </div>
  );
}
