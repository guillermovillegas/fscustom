import Link from "next/link";
import {
  Phone,
  ArrowRight,
  Star,
  Shield,
  ChefHat,
  Bath,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PortfolioGrid } from "@/components/portfolio-grid";
import type { ProjectType } from "@/lib/types/database";

const PHONE_NUMBER = "(555) 123-4567";
const PHONE_HREF = "tel:+15551234567";

// Placeholder portfolio data -- replace with Supabase query
const SAMPLE_PHOTOS: Array<{
  id: string;
  category: ProjectType;
  image_url: string;
  caption: string | null;
}> = [
  {
    id: "1",
    category: "kitchen",
    image_url: "/portfolio/kitchen-1.jpg",
    caption: "Modern white kitchen with quartz countertops",
  },
  {
    id: "2",
    category: "kitchen",
    image_url: "/portfolio/kitchen-2.jpg",
    caption: "Open-concept kitchen renovation",
  },
  {
    id: "3",
    category: "bathroom",
    image_url: "/portfolio/bathroom-1.jpg",
    caption: "Luxury master bathroom with walk-in shower",
  },
  {
    id: "4",
    category: "bathroom",
    image_url: "/portfolio/bathroom-2.jpg",
    caption: "Guest bathroom update with new tile",
  },
  {
    id: "5",
    category: "flooring",
    image_url: "/portfolio/flooring-1.jpg",
    caption: "Hardwood flooring throughout main level",
  },
  {
    id: "6",
    category: "flooring",
    image_url: "/portfolio/flooring-2.jpg",
    caption: "Custom tile work in entryway",
  },
];

export default function HomePage() {
  // TODO: Fetch photos from Supabase
  // const photos = await getPortfolioPhotos();
  const photos = SAMPLE_PHOTOS;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-14 pb-12 text-center bg-gradient-to-b from-background to-muted/50">
        <div className="w-full max-w-lg mx-auto">
          {/* Business Name */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Premier Remodeling
          </h1>

          {/* Tagline */}
          <p className="mt-3 text-xl sm:text-2xl text-muted-foreground font-medium">
            Transform Your Space
          </p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              5.0 Rating
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex items-center gap-1.5">
              <Shield className="size-4" />
              Licensed & Insured
            </span>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-14 text-lg px-8 rounded-xl font-semibold"
            >
              <Link href="/schedule">
                Schedule Your Free Walkthrough
                <ArrowRight className="size-5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Phone number */}
          <div className="mt-5">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] text-base"
            >
              <Phone className="size-4" />
              {PHONE_NUMBER}
            </a>
          </div>

          {/* Service highlights */}
          <div className="grid grid-cols-3 gap-3 mt-10">
            <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card border p-4">
              <ChefHat className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Kitchens</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card border p-4">
              <Bath className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Bathrooms</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card border p-4">
              <Layers className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Flooring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="px-4 sm:px-6 py-10" id="portfolio">
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
            Our Work
          </h2>
          <PortfolioGrid photos={photos} />
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="px-6 py-10 bg-muted/50">
        <div className="w-full max-w-lg mx-auto text-center">
          <h2 className="text-xl font-semibold">
            Ready to Start Your Project?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Book a free walkthrough and get a detailed estimate.
          </p>
          <div className="mt-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold"
            >
              <Link href="/schedule">
                Book Now
                <ArrowRight className="size-5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="px-6 py-8 w-full max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">Premier Remodeling</p>
              <p className="text-sm text-muted-foreground mt-1">
                Kitchen, Bathroom & Flooring Specialists
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
              >
                <Phone className="size-4" />
                {PHONE_NUMBER}
              </a>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Premier Remodeling. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
