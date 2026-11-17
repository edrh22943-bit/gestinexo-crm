import { afterEach, describe, expect, it } from "vitest";
import { getPublicSupabaseEnv, getServiceRoleKey } from "./env";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

afterEach(() => {
  for (const key of KEYS) {
    delete process.env[key];
  }
});

describe("supabase env accessors", () => {
  it("reads public env when present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(getPublicSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });

  it("throws if public env is missing", () => {
    expect(() => getPublicSupabaseEnv()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });

  it("reads service role key only from server env", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    expect(getServiceRoleKey()).toBe("service-role");
  });

  it("throws if service role key is missing", () => {
    expect(() => getServiceRoleKey()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});
