"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSliderImage = {
  url: string;
  alt?: string;
  addedAt?: string;
};

export function HeroBackgroundSlider({
  images,
}: {
  images: HeroSliderImage[];
}) {
  // Sort latest first (by addedAt descending or preserving newest-first order)
  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    return [...images].sort((a, b) => {
      if (a.addedAt && b.addedAt) {
        const timeA = new Date(a.addedAt).getTime();
        const timeB = new Date(b.addedAt).getTime();
        if (!isNaN(timeA) && !isNaN(timeB)) {
          return timeB - timeA;
        }
      }
      return 0;
    });
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides every 6 seconds if multiple pictures exist
  useEffect(() => {
    if (sortedImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [sortedImages.length, isPaused]);

  if (sortedImages.length === 0) return null;

  // Single picture: render directly without slider controls
  if (sortedImages.length === 1) {
    return (
      <div className="absolute inset-0 -z-20">
        <Image
          alt={sortedImages[0].alt || "Church worship gathering"}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={sortedImages[0].url}
        />
      </div>
    );
  }

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  }

  return (
    <div
      aria-label="Hero background pictures slideshow"
      className="absolute inset-0 -z-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
    >
      {/* Background Images with Crossfade */}
      {sortedImages.map((image, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            key={`${image.url}-${index}`}
          >
            <Image
              alt={image.alt || `Church hero picture ${index + 1}`}
              className="object-cover"
              fill
              priority={index === 0}
              sizes="100vw"
              src={image.url}
            />
          </div>
        );
      })}

      {/* Floating Modern Slider Controls - Latest First */}
      <div className="absolute bottom-6 right-5 sm:bottom-10 sm:right-10 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-stone-950/60 px-3 py-1.5 text-white backdrop-blur-md shadow-lg">
        <button
          aria-label="Previous hero picture"
          className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
          onClick={handlePrev}
          type="button"
        >
          <ChevronLeft className="size-3.5 sm:size-4" />
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-1.5 px-1">
          {sortedImages.map((_, dotIndex) => (
            <button
              aria-label={`Jump to picture ${dotIndex + 1}${dotIndex === 0 ? " (Latest)" : ""}`}
              className={`h-1.5 rounded-full transition-all ${
                dotIndex === currentIndex
                  ? "w-5 bg-secondary"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              key={dotIndex}
              onClick={() => setCurrentIndex(dotIndex)}
              type="button"
            />
          ))}
        </div>

        <button
          aria-label="Next hero picture"
          className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
          onClick={handleNext}
          type="button"
        >
          <ChevronRight className="size-3.5 sm:size-4" />
        </button>

        {/* Counter Badge */}
        <span className="ml-1 text-[10px] font-semibold tracking-wider text-white/80 uppercase">
          {currentIndex + 1} / {sortedImages.length}
        </span>
      </div>
    </div>
  );
}
