import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getWheelRows,
  WHEEL_ROW_REM,
  type WheelRow,
  wrapIndex,
} from "@/core/utils/clockWheel";

/** How long a finger rests on the wheel before it grabs it. */
const HOLD_MS = 180;
/** A finger moving more than this before the hold is scrolling the page. */
const MOVE_TOLERANCE_PX = 8;
/** Mouse wheel or trackpad distance for one step. */
const WHEEL_STEP_PX = 40;
/** Keeps a fast trackpad from spinning the wheel faster than the eye. */
const WHEEL_COOLDOWN_MS = 110;
/** How long the wheel stays open after the finger lets go. */
const CLOSE_AFTER_TOUCH_MS = 1200;

interface TouchGesture {
  startX: number;
  startY: number;
  /** `pending` until we know if the finger wants the wheel or the page. */
  mode: "pending" | "drag";
  wasOpen: boolean;
  moved: boolean;
  /** Steps already applied to the wheel in this gesture. */
  steps: number;
  holdTimer?: ReturnType<typeof setTimeout>;
}

export interface ClockWheelState {
  ref: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  /** True while a finger moves it: rows follow without animating. */
  isDragging: boolean;
  /** Which item of the list is in the centre. */
  currentIndex: number;
  rows: WheelRow[];
  handlers: {
    onPointerEnter: (event: ReactPointerEvent) => void;
    onPointerLeave: (event: ReactPointerEvent) => void;
    onFocus: (event: FocusEvent<HTMLDivElement>) => void;
    onBlur: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
  };
}

/**
 * A wheel that turns through a list forever.
 *
 * - Mouse: hover opens it, scrolling turns it.
 * - Keyboard: focus opens it, ↑↓ turn it, Esc closes it.
 * - Finger: a tap opens it, or hold and drag in one gesture. It closes by
 *   itself a moment after the finger lets go. A quick swipe still scrolls
 *   the page, so the wheel never gets in the way.
 *
 * @param count How many items the list has.
 * @param defaultOpen Start open (used by the Storybook story of that state).
 */
export function useClockWheel(
  count: number,
  defaultOpen = false,
): ClockWheelState {
  const ref = useRef<HTMLDivElement>(null);
  // The listeners below live outside React's renders and read this one
  const isOpenRef = useRef(defaultOpen);
  const [isOpen, setIsOpenState] = useState(defaultOpen);
  // Once opened, the neighbours stay mounted so they can fade out on close
  const [hasOpened, setHasOpened] = useState(defaultOpen);
  const [index, setIndex] = useState(0);
  const [drift, setDrift] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const setOpen = useCallback((next: boolean) => {
    isOpenRef.current = next;
    setIsOpenState(next);
    if (next) setHasOpened(true);
  }, []);

  // Added by hand because React's wheel and touch listeners are "passive":
  // they can't stop the page from scrolling while the wheel turns
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let wheelDistance = 0;
    let lastWheelStep = 0;
    let gesture: TouchGesture | null = null;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    const closeSoon = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => setOpen(false), CLOSE_AFTER_TOUCH_MS);
    };

    const rowHeight = () =>
      parseFloat(getComputedStyle(document.documentElement).fontSize) *
      WHEEL_ROW_REM;

    const onWheel = (event: WheelEvent) => {
      if (!isOpenRef.current) return;
      event.preventDefault();

      // Some mice report lines instead of pixels
      wheelDistance += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (Math.abs(wheelDistance) < WHEEL_STEP_PX) return;

      const direction = Math.sign(wheelDistance);
      wheelDistance = 0;
      const now = performance.now();
      if (now - lastWheelStep < WHEEL_COOLDOWN_MS) return;
      lastWheelStep = now;
      setIndex((current) => current + direction);
    };

    const onTouchStart = (event: TouchEvent) => {
      clearTimeout(closeTimer); // A finger is back: stay open
      if (event.touches.length !== 1) return;
      const { clientX, clientY } = event.touches[0];
      const wasOpen = isOpenRef.current;
      const started: TouchGesture = {
        startX: clientX,
        startY: clientY,
        mode: wasOpen ? "drag" : "pending",
        wasOpen,
        moved: false,
        steps: 0,
      };
      gesture = started;

      if (wasOpen) {
        setIsDragging(true);
      } else {
        started.holdTimer = setTimeout(() => {
          started.mode = "drag";
          setOpen(true);
          setIsDragging(true);
        }, HOLD_MS);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      const active = gesture;
      if (!active) return;

      const { clientX, clientY } = event.touches[0];
      const moved =
        Math.hypot(clientX - active.startX, clientY - active.startY) >
        MOVE_TOLERANCE_PX;

      if (active.mode === "pending") {
        // Moved before the hold: it's a page scroll, leave it alone
        if (moved) {
          clearTimeout(active.holdTimer);
          gesture = null;
        }
        return;
      }

      if (event.cancelable) event.preventDefault();
      if (moved) active.moved = true;

      // Finger up = rows go up = next item
      const rows = (active.startY - clientY) / rowHeight();
      const steps = Math.round(rows);
      const change = steps - active.steps;
      if (change !== 0) {
        active.steps = steps;
        setIndex((current) => current + change);
      }
      setDrift(rows - steps);
    };

    const endTouch = () => {
      const active = gesture;
      gesture = null;
      if (!active) return;
      clearTimeout(active.holdTimer);

      if (active.mode === "pending") {
        setOpen(true); // A quick tap
        closeSoon();
        return;
      }
      setDrift(0);
      setIsDragging(false);
      if (active.wasOpen && !active.moved) {
        setOpen(false); // Tapped it again
      } else {
        closeSoon();
      }
    };

    const cancelTouch = () => {
      if (gesture) clearTimeout(gesture.holdTimer);
      gesture = null;
      setDrift(0);
      setIsDragging(false);
      if (isOpenRef.current) closeSoon();
    };

    // Holding a finger on text would otherwise open the phone's own menu
    const onContextMenu = (event: Event) => {
      if (gesture) event.preventDefault();
    };

    const onPointerDownOutside = (event: PointerEvent) => {
      if (isOpenRef.current && !element.contains(event.target as Node)) {
        clearTimeout(closeTimer);
        setOpen(false);
      }
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", endTouch);
    element.addEventListener("touchcancel", cancelTouch);
    element.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("pointerdown", onPointerDownOutside);

    return () => {
      if (gesture) clearTimeout(gesture.holdTimer);
      clearTimeout(closeTimer);
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", endTouch);
      element.removeEventListener("touchcancel", cancelTouch);
      element.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("pointerdown", onPointerDownOutside);
    };
  }, [setOpen]);

  return {
    ref,
    isOpen,
    isDragging,
    currentIndex: wrapIndex(index, count),
    rows: getWheelRows(index, count, drift, hasOpened),
    handlers: {
      onPointerEnter: (event) => {
        if (event.pointerType === "mouse") setOpen(true);
      },
      onPointerLeave: (event) => {
        // Stays open for someone using the keyboard on it
        if (
          event.pointerType === "mouse" &&
          !ref.current?.matches(":focus-visible")
        ) {
          setOpen(false);
        }
      },
      onFocus: (event) => {
        if (event.target.matches(":focus-visible")) setOpen(true);
      },
      onBlur: () => {
        if (!ref.current?.matches(":hover")) setOpen(false);
      },
      onKeyDown: (event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          setOpen(true);
          setIndex((current) => current + (event.key === "ArrowDown" ? 1 : -1));
        } else if (event.key === "Escape") {
          setOpen(false);
        }
      },
    },
  };
}
