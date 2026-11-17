import { describe, expect, it } from "vitest";
import { isValidPhoneE164, normalizePhoneE164 } from "./phone";

describe("phone E.164", () => {
  it("accepts valid E.164 numbers", () => {
    expect(isValidPhoneE164("+51987654321")).toBe(true);
    expect(isValidPhoneE164("+14155552671")).toBe(true);
  });

  it("rejects non-E.164 values", () => {
    expect(isValidPhoneE164("987654321")).toBe(false);
    expect(isValidPhoneE164("+0123")).toBe(false);
    expect(isValidPhoneE164("")).toBe(false);
  });

  it("normalizes blank to null", () => {
    expect(normalizePhoneE164("  ")).toEqual({ ok: true, phone: null });
  });

  it("rejects invalid non-empty input", () => {
    expect(normalizePhoneE164("999")).toMatchObject({ ok: false });
  });
});
