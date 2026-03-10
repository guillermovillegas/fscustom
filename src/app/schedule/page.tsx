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

const SHOWCASE_IMAGES = [
  {
    src: "/gallery/kitchen-island-marble.webp",
    alt: "Kitchen remodel with marble island",
  },
  {
    src: "/gallery/bathroom-dark-tub-1.webp",
    alt: "Luxury dark stone bathroom",
  },
  {
    src: "/gallery/shower-stone-walk-in-1.webp",
    alt: "Natural stone walk-in shower",
  },
  {
    src: "/gallery/flooring-living-room-1.webp",
    alt: "LVP flooring living room",
  },
];

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-6">
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

        {/* Mobile: horizontal scroll strip */}
        <div className="mb-6 -mx-4 px-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SHOWCASE_IMAGES.map((img) => (
              <div
                key={img.src}
                className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="128px"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* Wizard */}
          <div className="flex-1 lg:max-w-2xl">
            <BookingWizard />
          </div>

          {/* Desktop: sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">
              Recent Work
            </p>
            <div className="grid grid-cols-1 gap-3">
              {SHOWCASE_IMAGES.map((img) => (
                <div
                  key={img.src}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="256px"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
