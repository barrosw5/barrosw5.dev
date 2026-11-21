"use client";

import { useLocale, useTranslations } from "next-intl";

import type { Place } from "@/core/types/profile";
import { wheelRowStyle } from "@/core/utils/clockWheel";
import { formatTime } from "@/core/utils/formatTime";
import { useClockWheel } from "@/hooks/useClockWheel";
import { cn } from "@/lib/utils";

interface ClockWheelProps {
  /** The places on the wheel; the first one starts in the centre. */
  places: Place[];
  /** Now, or `null` until the page runs in the browser. */
  now: Date | null;
  /** Start open (used by the Storybook story of that state). */
  defaultOpen?: boolean;
}

/**
 * The footer's place and local time, on a wheel that turns forever through
 * the other places: like a drum lying on its side, rolling up and down.
 * Hover and scroll with a mouse; tap, or hold and drag, with a finger.
 *
 * To screen readers it's one control (a spin button) that says its value.
 */
export function ClockWheel({ places, now, defaultOpen = false }: ClockWheelProps) {
  const t = useTranslations("footer");
  const locale = useLocale();
  const { ref, isOpen, isDragging, currentIndex, rows, handlers } =
    useClockWheel(places.length, defaultOpen);

  const current = places[currentIndex];
  const currentName = t(`places.${current.id}`);
  const currentTime = now && formatTime(now, locale, current.timeZone);

  // Mono font: every character has the same width (1ch), so the longest name
  // sets a width that doesn't change, and the footer never jumps as it turns.
  // 6ch = " · 00:00"'s characters; the rem are the dot and the gaps
  const longestName = Math.max(
    ...places.map(({ id }) => t(`places.${id}`).length),
  );

  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={t("clock")}
      aria-valuemin={1}
      aria-valuemax={places.length}
      aria-valuenow={currentIndex + 1}
      aria-valuetext={currentTime ? `${currentName}, ${currentTime}` : currentName}
      {...handlers}
      style={{ width: `calc(${longestName + 6}ch + 1.875rem)` }}
      className="relative h-4 max-w-full shrink-0 cursor-ns-resize touch-manipulation rounded-sm outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {/* Red dot = live. It stays still while the rows roll past it */}
      <span
        aria-hidden
        className="absolute top-1/2 left-0 z-30 size-1.5 -translate-y-1/2 rounded-full bg-status-live"
      />

      {/* The wheel's window, wider and taller than the line it sits on. It
          floats over the page, so opening it moves nothing around it */}
      <div
        aria-hidden
        className={cn(
          // A distant perspective: a close one slants small text like italics
          "absolute -inset-x-3 -inset-y-8 z-20 overflow-hidden rounded-xl border perspective-distant transition-[background-color,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
          isOpen
            ? // Solid: on the phone it opens over the profile links
              "border-border bg-background shadow-sm"
            : "pointer-events-none border-transparent",
        )}
      >
        {rows.map(({ key, itemIndex, offset }) => {
          const place = places[itemIndex];
          const time = now && formatTime(now, locale, place.timeZone);
          return (
            <div
              key={key}
              style={wheelRowStyle(offset, isOpen)}
              className={cn(
                "absolute inset-x-3 top-1/2 -mt-2 flex h-4 items-center gap-2 pl-3.5 whitespace-nowrap backface-hidden",
                !isDragging &&
                  "transition-[transform,opacity,color] duration-200 ease-out motion-reduce:transition-none",
                isOpen && Math.abs(offset) < 0.5 && "text-foreground",
              )}
            >
              <span>{t(`places.${place.id}`)}</span>
              <span>·</span>
              {time ? (
                <time dateTime={now.toISOString()}>{time}</time>
              ) : (
                // Until the browser knows the time: keeps the space, no jump
                <span className="invisible">00:00</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
