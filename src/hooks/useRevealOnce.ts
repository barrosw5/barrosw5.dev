import { useEffect, useRef } from "react";

/**
 * Keeps a CSS entrance animation from playing twice.
 *
 * The animation itself is pure CSS, so it starts with the first paint, before
 * any JavaScript. But Next hides pages you leave with `display: none`, and a
 * CSS animation restarts when its element is shown again. So once it ends,
 * this marks the element with `data-reveal-done`, which turns the animation
 * off in globals.css.
 *
 * @param text The text shown: a new text may play again.
 * @returns The ref to put on the animated element.
 */
export function useRevealOnce<Element extends HTMLElement>(text: string) {
  const ref = useRef<Element>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let left = false;
    // Includes animations that ended before this code loaded
    const animations = element.getAnimations({ subtree: true });
    Promise.allSettled(animations.map((a) => a.finished)).then(() => {
      if (!left) element.dataset.revealDone = "";
    });

    return () => {
      left = true;
    };
  }, [text]);

  return ref;
}
