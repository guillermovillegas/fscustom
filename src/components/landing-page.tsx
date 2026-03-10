"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  MapPin,
  Instagram,
  ChevronDown,
  Play,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MotionDiv,
  MotionSection,
  MotionH1,
  MotionH2,
  MotionP,
  MotionSpan,
  MotionNav,
  MotionFooter,
  fadeUp,
  fadeIn,
  staggerContainer,
  scaleIn,
} from "@/components/motion";

const PHONE = "(515) 414-4145";
const PHONE_HREF = "tel:+15154144145";
const INSTAGRAM = "https://www.instagram.com/fscustomflooring";
const LOCATION = "Des Moines, IA";

const SERVICES = [
  {
    title: "Kitchen Remodel",
    description: "Full-scale kitchen transformations",
    image: "/gallery/kitchen-island-marble.webp",
  },
  {
    title: "Bathroom Remodel",
    description: "Luxury bathroom renovations",
    image: "/gallery/bathroom-dark-tub-1.webp",
  },
  {
    title: "Backsplash",
    description: "Custom tile backsplash design",
    image: "/gallery/kitchen-backsplash-bar.webp",
  },
  {
    title: "Tile Walls",
    description: "Accent walls & full surrounds",
    image: "/gallery/shower-tile-niche.webp",
  },
  {
    title: "Hardwood",
    description: "Solid & engineered hardwood floors",
    image: "/gallery/flooring-living-room-1.webp",
  },
  {
    title: "Tile Floors",
    description: "Porcelain, ceramic & natural stone",
    image: "/gallery/flooring-fireplace-stone.webp",
  },
  {
    title: "Showers",
    description: "Custom shower builds & tile work",
    image: "/gallery/shower-stone-walk-in-1.webp",
  },
  {
    title: "LVP",
    description: "Luxury vinyl plank installation",
    image: "/gallery/flooring-living-room-2.webp",
  },
];

const TRUST_ITEMS = [
  { stat: "110+", label: "Projects Showcased" },
  { stat: "1,800+", label: "Happy Followers" },
  { stat: "Des Moines", label: "Iowa" },
];

type GalleryCategory = "all" | "kitchen" | "bathroom" | "shower" | "flooring";

const GALLERY_FILTERS: { label: string; value: GalleryCategory }[] = [
  { label: "All", value: "all" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Bathroom", value: "bathroom" },
  { label: "Showers", value: "shower" },
  { label: "Flooring", value: "flooring" },
];

interface GalleryItem {
  src: string;
  alt: string;
  category: GalleryCategory;
  span?: "tall" | "wide";
}

const GALLERY_ITEMS: GalleryItem[] = [
  // Kitchen — best 2
  {
    src: "/gallery/kitchen-island-marble.webp",
    alt: "Modern kitchen island with marble countertop and pendant lights",
    category: "kitchen",
    span: "wide",
  },
  {
    src: "/gallery/kitchen-range-backsplash.webp",
    alt: "Kitchen range with zellige tile backsplash and white cabinets",
    category: "kitchen",
  },
  // Bathroom — best 3
  {
    src: "/gallery/bathroom-dark-tub-1.webp",
    alt: "Luxury dark stone bathroom with freestanding soaking tub",
    category: "bathroom",
    span: "tall",
  },
  {
    src: "/gallery/bathroom-terrazzo-tub-1.webp",
    alt: "Terrazzo stone freestanding bathtub",
    category: "bathroom",
  },
  {
    src: "/gallery/bathroom-dark-tub-2.webp",
    alt: "Freestanding round tub with dark and white tile surround",
    category: "bathroom",
  },
  // Shower — best 3
  {
    src: "/gallery/shower-stone-walk-in-1.webp",
    alt: "Natural stone walk-in shower with pebble floor",
    category: "shower",
  },
  {
    src: "/gallery/shower-terrazzo-dual.webp",
    alt: "Terrazzo dual rain shower with built-in niche",
    category: "shower",
    span: "tall",
  },
  {
    src: "/gallery/shower-marble-bench.webp",
    alt: "Marble shower with built-in bench and mosaic floor",
    category: "shower",
  },
  // Flooring — best 2
  {
    src: "/gallery/flooring-living-room-1.webp",
    alt: "Living room with LVP flooring and stone fireplace surround",
    category: "flooring",
  },
  {
    src: "/gallery/flooring-fireplace-stone.webp",
    alt: "Custom stone fireplace with hardwood flooring",
    category: "flooring",
    span: "wide",
  },
];

interface VideoItem {
  src: string;
  poster: string;
  title: string;
}

const VIDEO_ITEMS: VideoItem[] = [
  {
    src: "/gallery/project-reel.mp4",
    poster: "/gallery/kitchen-island-marble.webp",
    title: "Project Highlights Reel",
  },
  {
    src: "/gallery/project-showcase-1.mp4",
    poster: "/gallery/shower-stone-walk-in-1.webp",
    title: "Shower Transformation",
  },
  {
    src: "/gallery/project-showcase-2.mp4",
    poster: "/gallery/bathroom-terrazzo-tub-1.webp",
    title: "Bathroom Renovation",
  },
];

export function LandingPage() {
  const [activeFilter, setActiveFilter] = useState<GalleryCategory>("all");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const filteredGallery =
    activeFilter === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <div className="min-h-dvh bg-black text-white selection:bg-white selection:text-black">
      {/* ─── Nav ─── */}
      <MotionNav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="FS Custom Flooring"
              width={36}
              height={36}
              className="rounded-sm"
              priority
            />
            <span className="hidden text-sm font-medium tracking-[0.2em] uppercase sm:inline">
              FS Custom Flooring
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={PHONE_HREF}
              className="hidden items-center gap-2 text-xs tracking-wider text-white/60 transition-colors hover:text-white sm:flex"
            >
              <Phone className="size-3.5" />
              {PHONE}
            </a>
            <Button
              asChild
              size="sm"
              className="rounded-none bg-white text-black hover:bg-white/90 text-xs tracking-wider uppercase font-medium h-9 px-5"
            >
              <Link href="/schedule">Book Now</Link>
            </Button>
          </div>
        </div>
      </MotionNav>

      {/* ─── Hero with Video Background ─── */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          poster="/gallery/kitchen-island-marble.webp"
        >
          <source src="/gallery/project-reel.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 flex flex-col items-center text-center"
        >
          {/* Logo */}
          <MotionDiv variants={scaleIn} custom={0} className="mb-8 sm:mb-10">
            <Image
              src="/logo.jpg"
              alt="FS Custom Flooring"
              width={120}
              height={120}
              className="size-20 rounded-sm sm:size-[120px]"
              priority
            />
          </MotionDiv>

          {/* Heading */}
          <MotionH1
            variants={fadeUp}
            custom={0.1}
            className="text-[2.5rem] leading-none font-light tracking-[0.1em] uppercase sm:text-7xl sm:tracking-[0.15em] lg:text-8xl"
          >
            FS Custom
          </MotionH1>
          <MotionH1
            variants={fadeUp}
            custom={0.2}
            className="mt-1 text-[2.5rem] leading-none font-light tracking-[0.1em] uppercase sm:text-7xl sm:tracking-[0.15em] lg:text-8xl"
          >
            Flooring
          </MotionH1>

          {/* Divider line */}
          <MotionDiv
            variants={fadeIn}
            custom={0.4}
            className="mt-8 h-px w-16 bg-white/30"
          />

          {/* Tagline */}
          <MotionP
            variants={fadeUp}
            custom={0.5}
            className="mt-6 text-sm tracking-[0.35em] uppercase text-white/50"
          >
            Design + Build
          </MotionP>

          {/* Location */}
          <MotionDiv
            variants={fadeUp}
            custom={0.6}
            className="mt-4 flex items-center gap-2 text-xs tracking-wider text-white/40"
          >
            <MapPin className="size-3" />
            {LOCATION}
          </MotionDiv>

          {/* CTA */}
          <MotionDiv
            variants={fadeUp}
            custom={0.8}
            className="mt-10 w-full max-w-sm sm:mt-12 sm:w-auto"
          >
            <Button
              asChild
              size="lg"
              className="group rounded-none bg-white text-black hover:bg-white/90 h-12 w-full px-6 text-xs tracking-[0.15em] uppercase font-medium sm:h-14 sm:w-auto sm:px-10 sm:text-sm sm:tracking-[0.2em]"
            >
              <Link href="/schedule">
                Schedule Free Walkthrough
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </MotionDiv>

          {/* Phone */}
          <MotionDiv variants={fadeUp} custom={0.9} className="mt-6">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
            >
              <Phone className="size-3.5" />
              {PHONE}
            </a>
          </MotionDiv>
        </MotionDiv>

        {/* Scroll indicator */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <MotionDiv
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="size-5 text-white/20" />
          </MotionDiv>
        </MotionDiv>
      </section>

      {/* ─── Services with Images ─── */}
      <MotionSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <MotionDiv variants={fadeUp} custom={0} className="mb-10 sm:mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-white/40 mb-3">
              What We Do
            </p>
            <h2 className="text-2xl font-light tracking-wide sm:text-4xl">
              Our Services
            </h2>
          </MotionDiv>

          <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, i) => (
              <MotionDiv
                key={service.title}
                variants={fadeUp}
                custom={i * 0.05}
                className="group relative bg-black overflow-hidden transition-colors duration-500"
              >
                {/* Service image background */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                {/* Text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <MotionSpan className="block text-[10px] tracking-[0.3em] uppercase text-white/50 mb-1 font-mono sm:text-xs sm:mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </MotionSpan>
                  <h3 className="text-sm font-medium tracking-wide sm:text-lg">
                    {service.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/50 sm:mt-1 sm:text-sm">
                    {service.description}
                  </p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* ─── Portfolio Gallery ─── */}
      <MotionSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <MotionDiv variants={fadeUp} custom={0} className="mb-10 sm:mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-white/40 mb-3">
              Our Work
            </p>
            <h2 className="text-2xl font-light tracking-wide sm:text-4xl">
              Recent Projects
            </h2>
          </MotionDiv>

          {/* Category filters */}
          <MotionDiv
            variants={fadeUp}
            custom={0.1}
            className="mb-8 flex flex-wrap gap-2"
          >
            {GALLERY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-none border px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                  activeFilter === filter.value
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-white/50 hover:border-white/40 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </MotionDiv>

          {/* Masonry-style grid */}
          <div className="columns-2 gap-2 sm:columns-3 sm:gap-3 lg:columns-4">
            {filteredGallery.map((item) => (
              <MotionDiv
                key={item.src}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-2 sm:mb-3 break-inside-avoid"
              >
                <button
                  onClick={() => {
                    setLightboxSrc(item.src);
                    setLightboxAlt(item.alt);
                  }}
                  className="group relative block w-full overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={`View: ${item.alt}`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={600}
                    height={item.span === "wide" ? 400 : item.span === "tall" ? 900 : 750}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                </button>
              </MotionDiv>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* ─── Video Showcase ─── */}
      <MotionSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <MotionDiv variants={fadeUp} custom={0} className="mb-10 sm:mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-white/40 mb-3">
              See It In Action
            </p>
            <h2 className="text-2xl font-light tracking-wide sm:text-4xl">
              Video Walkthroughs
            </h2>
          </MotionDiv>

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {VIDEO_ITEMS.map((video, i) => (
              <MotionDiv key={video.src} variants={fadeUp} custom={i * 0.1}>
                <VideoCard video={video} />
              </MotionDiv>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* ─── Stats / Trust ─── */}
      <MotionSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 text-center sm:gap-8">
          {TRUST_ITEMS.map((item, i) => (
            <MotionDiv key={item.label} variants={fadeUp} custom={i * 0.1}>
              <p className="text-2xl font-light tracking-wider sm:text-5xl">
                {item.stat}
              </p>
              <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-white/40 sm:mt-2 sm:text-xs sm:tracking-[0.25em]">
                {item.label}
              </p>
            </MotionDiv>
          ))}
        </div>
      </MotionSection>

      {/* ─── CTA Section ─── */}
      <MotionSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="relative border-t border-white/10 px-4 py-16 sm:px-6 sm:py-32 overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/gallery/shower-terrazzo-dual.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          <MotionH2
            variants={fadeUp}
            custom={0}
            className="text-2xl font-light tracking-wide sm:text-5xl"
          >
            Ready to Transform
            <br />
            Your Space?
          </MotionH2>

          <MotionDiv
            variants={fadeIn}
            custom={0.2}
            className="mt-6 h-px w-12 bg-white/30 mx-auto"
          />

          <MotionP
            variants={fadeUp}
            custom={0.3}
            className="mt-6 text-white/50 leading-relaxed"
          >
            Book a free in-home walkthrough. We&apos;ll measure, discuss your
            vision, and provide a detailed estimate within 48 hours.
          </MotionP>

          <MotionDiv
            variants={fadeUp}
            custom={0.5}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              asChild
              size="lg"
              className="group rounded-none bg-white text-black hover:bg-white/90 h-12 w-full px-6 text-xs tracking-[0.15em] uppercase font-medium sm:h-14 sm:w-auto sm:px-10 sm:text-sm sm:tracking-[0.2em]"
            >
              <Link href="/schedule">
                Book Walkthrough
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <a
              href={PHONE_HREF}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-none border border-white/20 px-6 text-xs tracking-[0.15em] uppercase text-white/70 transition-colors hover:border-white/40 hover:text-white w-full sm:h-14 sm:w-auto sm:px-10 sm:text-sm sm:tracking-[0.2em]"
            >
              <Phone className="size-3.5" />
              Call Us
            </a>
          </MotionDiv>
        </div>
      </MotionSection>

      {/* ─── Footer ─── */}
      <MotionFooter
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={0}
        className="border-t border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.jpg"
                  alt="FS Custom Flooring"
                  width={32}
                  height={32}
                  className="rounded-sm"
                />
                <span className="text-sm font-medium tracking-[0.2em] uppercase">
                  FS Custom Flooring
                </span>
              </div>
              <p className="text-xs tracking-wider text-white/30">
                Design + Build
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-2 text-sm">
              <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-3">
                Contact
              </p>
              <a
                href={PHONE_HREF}
                className="flex items-center gap-2 text-white/50 transition-colors hover:text-white"
              >
                <Phone className="size-3.5" />
                {PHONE}
              </a>
              <div className="flex items-center gap-2 text-white/50">
                <MapPin className="size-3.5" />
                {LOCATION}
              </div>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 transition-colors hover:text-white"
              >
                <Instagram className="size-3.5" />
                @fscustomflooring
              </a>
            </div>

            {/* Services */}
            <div className="space-y-2 text-sm">
              <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-3">
                Services
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-white/50">
                {SERVICES.map((s) => (
                  <span key={s.title} className="text-xs">
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} FS Custom Flooring. All rights
              reserved.
            </p>
            <Link
              href="/admin"
              className="text-xs text-white/10 transition-colors hover:text-white/30"
            >
              Admin
            </Link>
          </div>
        </div>
      </MotionFooter>

      {/* ─── Lightbox Modal ─── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="size-6" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxSrc}
              alt={lightboxAlt}
              width={1600}
              height={1200}
              sizes="90vw"
              className="max-h-[90vh] w-auto object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: VideoItem }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    videoRef.current?.play();
  };

  const handlePause = () => {
    setIsPlaying(false);
    videoRef.current?.pause();
  };

  return (
    <div className="group relative overflow-hidden bg-white/5">
      <div className="relative aspect-[9/16]">
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play/pause overlay */}
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 transition-colors hover:bg-black/30"
            aria-label={`Play ${video.title}`}
          >
            <div className="flex size-14 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm transition-transform hover:scale-110">
              <Play className="size-6 fill-white text-white ml-0.5" />
            </div>
            <p className="mt-3 text-xs tracking-[0.15em] uppercase text-white/70">
              {video.title}
            </p>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="absolute inset-0 bg-transparent"
            aria-label={`Pause ${video.title}`}
          />
        )}
      </div>
    </div>
  );
}
