import { describe, it, expect } from "vitest";
import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
  it("renders minutes below one hour", () => {
    expect(formatDuration(9)).toBe("9 min");
    expect(formatDuration(12)).toBe("12 min");
    expect(formatDuration(59)).toBe("59 min");
  });

  it("renders hours and minutes above one hour", () => {
    expect(formatDuration(61)).toBe("1 h 1 min");
    expect(formatDuration(80)).toBe("1 h 20 min");
    expect(formatDuration(135)).toBe("2 h 15 min");
  });

  it("renders whole hours without a minutes part", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(120)).toBe("2 h");
  });

  it("rounds fractional minutes instead of leaking seconds", () => {
    expect(formatDuration(12.4)).toBe("12 min");
    expect(formatDuration(90.6)).toBe("1 h 31 min");
  });
});
