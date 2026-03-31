import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatDate,
  formatCurrency,
  truncate,
  randomId,
  sleep,
  debounce,
  throttle,
} from "../utils";

describe("cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("should handle conditional classes", () => {
    expect(cn("px-2", false && "py-1", "text-sm")).toBe("px-2 text-sm");
  });

  it("should handle conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("should handle arrays and objects", () => {
    expect(cn(["px-2", "py-1"], { "text-sm": true, "text-lg": false })).toBe("px-2 py-1 text-sm");
  });
});

describe("formatDate", () => {
  it("should format a Date object", () => {
    const date = new Date("2024-01-15");
    const formatted = formatDate(date, "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(formatted).toBe("January 15, 2024");
  });

  it("should format a date string", () => {
    const formatted = formatDate("2024-01-15", "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(formatted).toContain("Jan");
    expect(formatted).toContain("15");
    expect(formatted).toContain("2024");
  });

  it("should use default options when not provided", () => {
    const date = new Date("2024-01-15");
    const formatted = formatDate(date);
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe("formatCurrency", () => {
  it("should format USD currency", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("should format EUR currency", () => {
    const formatted = formatCurrency(1234.56, "EUR", "de-DE");
    expect(formatted).toContain("1.234,56");
    expect(formatted).toContain("€");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should handle negative numbers", () => {
    const formatted = formatCurrency(-100);
    expect(formatted).toContain("-");
    expect(formatted).toContain("100");
  });
});

describe("truncate", () => {
  it("should truncate text that exceeds length", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("should not truncate text within length", () => {
    expect(truncate("Hi", 5)).toBe("Hi");
  });

  it("should handle exact length", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("should handle empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("randomId", () => {
  it("should generate a random ID with default length", () => {
    const id = randomId();
    expect(id).toHaveLength(8);
    expect(typeof id).toBe("string");
  });

  it("should generate a random ID with custom length", () => {
    const id = randomId(12);
    expect(id).toHaveLength(12);
  });

  it("should generate different IDs", () => {
    const id1 = randomId();
    const id2 = randomId();
    expect(id1).not.toBe(id2);
  });
});

describe("sleep", () => {
  it("should resolve after specified time", async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should debounce function calls", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should call debounced function with latest arguments", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });
});

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throttle function calls", () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should call throttled function with first arguments", () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn("first");
    throttledFn("second");
    throttledFn("third");

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");
  });
});
