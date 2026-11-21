/** Distance between two rows of the wheel, in rem. */
export const WHEEL_ROW_REM = 1.5;

/** How far each row tilts away per row from the centre, in degrees. */
const WHEEL_TILT_DEG = 28;

/** How much each row fades per row from the centre. */
const WHEEL_FADE = 0.45;

/** Rows drawn on each side of the centre: enough to fill the wheel's window. */
const WHEEL_REACH = 2;

export interface WheelRow {
  /** The row's position on the endless wheel; stable while it turns. */
  key: number;
  /** Which item of the list this row shows. */
  itemIndex: number;
  /** Rows away from the centre; can be fractional while dragging. */
  offset: number;
}

/**
 * Wraps any whole number into a list's range, so the list never ends:
 * with 3 items, 3 → 0 and -1 → 2.
 */
export function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

/**
 * The rows to draw around the current position. Only these few exist at any
 * time, which is what lets the wheel turn forever.
 *
 * @param index Position on the endless wheel (any whole number).
 * @param length How many items the list has.
 * @param drift Fraction of a row the finger moved past `index`.
 * @param withNeighbours False draws only the centre row.
 */
export function getWheelRows(
  index: number,
  length: number,
  drift: number,
  withNeighbours: boolean,
): WheelRow[] {
  const reach = withNeighbours ? WHEEL_REACH : 0;
  const rows: WheelRow[] = [];
  for (let key = index - reach; key <= index + reach; key++) {
    rows.push({
      key,
      itemIndex: wrapIndex(key, length),
      offset: key - index - drift,
    });
  }
  return rows;
}

/**
 * Where a row sits on the drum: higher or lower, tilted and faded the further
 * it is from the centre. A closed wheel only shows its centre row.
 */
export function wheelRowStyle(offset: number, isOpen: boolean) {
  const opacity = isOpen
    ? Math.max(0, 1 - Math.abs(offset) * WHEEL_FADE)
    : Number(offset === 0);

  return {
    opacity,
    transform: `translateY(${offset * WHEEL_ROW_REM}rem) rotateX(${offset * -WHEEL_TILT_DEG}deg)`,
  };
}
