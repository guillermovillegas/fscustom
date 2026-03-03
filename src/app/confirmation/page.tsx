import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddToCalendar } from "@/components/add-to-calendar";

function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const PROJECT_LABELS: Record<string, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  flooring: "Flooring",
};

interface ConfirmationPageProps {
  searchParams: Promise<{
    name?: string;
    date?: string;
    time?: string;
    project?: string;
  }>;
}

export const metadata = {
  title: "Booking Confirmed | FS Custom Flooring",
  description: "Your walkthrough appointment has been confirmed.",
};

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  const name = escapeHtml(params.name) || "there";
  const dateStr = params.date;
  const time = escapeHtml(params.time) || "";
  const project = params.project ?? "";
  const projectLabel = PROJECT_LABELS[project] ?? "Remodeling";

  let formattedDate = "";
  if (dateStr) {
    try {
      formattedDate = format(
        new Date(dateStr + "T00:00:00"),
        "EEEE, MMMM d, yyyy"
      );
    } catch {
      formattedDate = escapeHtml(dateStr);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
            <CheckCircle2 className="size-9" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              Thank You, {name}!
            </CardTitle>
            <p className="mt-2 text-muted-foreground">
              Your {projectLabel.toLowerCase()} walkthrough is confirmed
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {(formattedDate || time) && (
            <div className="rounded-lg bg-muted/50 p-4">
              {formattedDate && (
                <p className="text-sm font-medium">{formattedDate}</p>
              )}
              {time && (
                <p className="text-lg font-semibold text-primary">{time}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {projectLabel} Walkthrough
              </p>
            </div>
          )}

          {dateStr && time && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Add to your calendar
                </p>
                <AddToCalendar
                  title={`${projectLabel} Walkthrough — FS Custom Flooring`}
                  date={dateStr}
                  time={time}
                  description={`${projectLabel} flooring walkthrough with FS Custom Flooring. We'll call to confirm details and get your address.`}
                />
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              We will call you to confirm the details and get your address.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Phone className="size-4" />
              <span>
                Questions? Call us at{" "}
                <a
                  href="tel:+15154144145"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  (515) 414-4145
                </a>
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-2">
          <Button asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
