"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProjectType } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";

interface PortfolioPhoto {
  id: string;
  category: ProjectType;
  image_url: string;
  caption: string | null;
}

type FilterCategory = "all" | ProjectType;

const FILTER_OPTIONS: { label: string; value: FilterCategory }[] = [
  { label: "All", value: "all" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Bathroom", value: "bathroom" },
  { label: "Flooring", value: "flooring" },
];

const CATEGORY_LABELS: Record<ProjectType, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  flooring: "Flooring",
};

interface PortfolioGridProps {
  photos: PortfolioPhoto[];
}

export function PortfolioGrid({ photos }: PortfolioGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioPhoto | null>(
    null
  );

  const filteredPhotos =
    activeFilter === "all"
      ? photos
      : photos.filter((photo) => photo.category === activeFilter);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ImageIcon className="size-12 mb-4" />
        <p className="text-lg font-medium">Portfolio coming soon</p>
        <p className="text-sm mt-1">
          Check back to see our latest remodeling projects.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Filter portfolio by category">
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              role="tab"
              aria-selected={isActive}
              className="min-h-[44px] min-w-[44px] cursor-pointer"
            >
              <Badge
                variant={isActive ? "default" : "outline"}
                className="px-4 py-2 text-sm pointer-events-none"
              >
                {option.label}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredPhotos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
            aria-label={
              photo.caption
                ? `View ${photo.caption}`
                : `View ${CATEGORY_LABELS[photo.category]} project`
            }
          >
            <Card className="overflow-hidden p-0 gap-0 group transition-shadow hover:shadow-md">
              <div className="relative aspect-square">
                <Image
                  src={photo.image_url}
                  alt={photo.caption ?? `${CATEGORY_LABELS[photo.category]} remodeling project`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className="bg-black/60 text-white border-none text-xs backdrop-blur-sm"
                  >
                    {CATEGORY_LABELS[photo.category]}
                  </Badge>
                </div>
              </div>
              {photo.caption && (
                <div className="px-3 py-2.5">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              )}
            </Card>
          </button>
        ))}
      </div>

      {/* Lightbox dialog */}
      <Dialog
        open={selectedPhoto !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPhoto(null);
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedPhoto?.caption ??
                (selectedPhoto
                  ? `${CATEGORY_LABELS[selectedPhoto.category]} project`
                  : "Project photo")}
            </DialogTitle>
            <DialogDescription>
              Full-size view of the portfolio photo.
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex flex-col">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={selectedPhoto.image_url}
                  alt={
                    selectedPhoto.caption ??
                    `${CATEGORY_LABELS[selectedPhoto.category]} remodeling project`
                  }
                  fill
                  sizes="95vw"
                  className="object-contain bg-black"
                  priority
                />
              </div>
              {selectedPhoto.caption && (
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[selectedPhoto.category]}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {selectedPhoto.caption}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
