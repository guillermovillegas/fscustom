"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  MapPin,
  Instagram,
  ChevronDown,
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
  },
  {
    title: "Bathroom Remodel",
    description: "Luxury bathroom renovations",
  },
  {
    title: "Backsplash",
    description: "Custom tile backsplash design",
  },
  {
    title: "Tile Walls",
    description: "Accent walls & full surrounds",
  },
  {
    title: "Hardwood",
    description: "Solid & engineered hardwood floors",
  },
  {
    title: "Tile Floors",
    description: "Porcelain, ceramic & natural stone",
  },
  {
    title: "Showers",
    description: "Custom shower builds & tile work",
  },
  {
    title: "LVP",
    description: "Luxury vinyl plank installation",
  },
];

const TRUST_ITEMS = [
  { stat: "110+", label: "Projects Showcased" },
  { stat: "1,800+", label: "Happy Followers" },
  { stat: "Des Moines", label: "Iowa" },
];

export function LandingPage() {
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

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 flex flex-col items-center text-center"
        >
          {/* Logo */}
          <MotionDiv
            variants={scaleIn}
            custom={0}
            className="mb-8 sm:mb-10"
          >
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
          <MotionDiv variants={fadeUp} custom={0.8} className="mt-10 w-full max-w-sm sm:mt-12 sm:w-auto">
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

      {/* ─── Services ─── */}
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
                className="group bg-black p-4 transition-colors duration-500 hover:bg-white/[0.04] sm:p-8"
              >
                <MotionSpan className="block text-[10px] tracking-[0.3em] uppercase text-white/30 mb-2 font-mono sm:text-xs sm:mb-3">
                  {String(i + 1).padStart(2, "0")}
                </MotionSpan>
                <h3 className="text-sm font-medium tracking-wide sm:text-lg">
                  {service.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/40 sm:mt-2 sm:text-sm">
                  {service.description}
                </p>
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
        className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-32"
      >
        <div className="mx-auto max-w-2xl text-center">
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
    </div>
  );
}
