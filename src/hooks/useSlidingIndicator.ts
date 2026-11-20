import { useLayoutEffect, useRef } from "react";

/**
 * Moves one background "pill" under the selected item of a list, so it can
 * slide from item to item instead of jumping.
 *
 * The selected item is the list child that has (or contains) the element
 * with `aria-current`; the pill is another child of the list. It is placed
 * by setting its style directly (no React state, so no extra re-render), and
 * two attributes on the list tell the CSS what to do:
 * - `data-ready`: the pill is in place (until then, the server's HTML styles
 *   the selected item itself, so nothing is missing before JavaScript runs)
 * - `data-animate`: from then on, moves are animated. Set one frame after the
 *   first placement, so the pill doesn't fly in from the left on page load.
 *
 * @param selectedKey Changes whenever the selection changes (e.g. the path).
 */
export function useSlidingIndicator<
  List extends HTMLElement,
  Pill extends HTMLElement,
>(selectedKey: string) {
  const listRef = useRef<List>(null);
  const pillRef = useRef<Pill>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;

    const items = [...list.children].filter(
      (child): child is HTMLElement => child !== pill,
    );

    const place = () => {
      const selected = items.find((item) =>
        item.matches("[aria-current], :has([aria-current])"),
      );
      if (!selected) {
        // No item selected (e.g. on the 404 page): hide the pill
        delete list.dataset.ready;
        return;
      }
      pill.style.width = `${selected.offsetWidth}px`;
      pill.style.transform = `translateX(${selected.offsetLeft}px)`;
      list.dataset.ready = "";
    };
    place();

    const frame = requestAnimationFrame(() => {
      list.dataset.animate = "";
    });

    // Sizes change when the font loads or the screen is resized (and on the
    // phone, when an item shows or hides its name)
    const resize = new ResizeObserver(place);
    for (const item of items) resize.observe(item);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, [selectedKey]);

  return { listRef, pillRef };
}
