import { describe, expect, it } from "vitest";

import { getWheelRows, wheelRowStyle, wrapIndex } from "./clockWheel";

describe("wrapIndex", () => {
  it.each([
    [0, 3, 0],
    [2, 3, 2],
    [3, 3, 0],
    [7, 3, 1],
    [-1, 3, 2],
    [-3, 3, 0],
    [-7, 3, 2],
    [5, 2, 1],
    [-5, 2, 1],
  ])("wraps %i in a list of %i to %i", (index, length, expected) => {
    expect(wrapIndex(index, length)).toBe(expected);
  });
});

describe("getWheelRows", () => {
  it("draws only the centre while closed", () => {
    expect(getWheelRows(4, 2, 0, false)).toEqual([
      { key: 4, itemIndex: 0, offset: 0 },
    ]);
  });

  it("draws the neighbours, repeating a short list forever", () => {
    expect(getWheelRows(0, 2, 0, true).map((row) => row.itemIndex)).toEqual([
      0, 1, 0, 1, 0,
    ]);
  });

  it("keeps a row's key while the wheel turns, so it can animate", () => {
    const before = getWheelRows(10, 3, 0, true).find((row) => row.key === 11);
    const after = getWheelRows(11, 3, 0, true).find((row) => row.key === 11);
    expect(before?.offset).toBe(1);
    expect(after?.offset).toBe(0);
  });

  it("moves every row with the finger", () => {
    const centre = getWheelRows(0, 2, 0.25, true).find((row) => row.key === 0);
    expect(centre?.offset).toBe(-0.25);
  });
});

describe("wheelRowStyle", () => {
  it("shows the centre fully, flat", () => {
    expect(wheelRowStyle(0, true).opacity).toBe(1);
    expect(wheelRowStyle(0, false).opacity).toBe(1);
  });

  it("fades rows by distance, the same on both sides", () => {
    expect(wheelRowStyle(1, true).opacity).toBeCloseTo(0.55);
    expect(wheelRowStyle(-1, true).opacity).toBeCloseTo(0.55);
  });

  it("never gets a negative opacity", () => {
    expect(wheelRowStyle(3, true).opacity).toBe(0);
  });

  it("hides every other row while closed", () => {
    expect(wheelRowStyle(1, false).opacity).toBe(0);
  });
});
