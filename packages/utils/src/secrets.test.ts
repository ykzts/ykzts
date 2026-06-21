import { describe, expect, it } from "vitest";
import {
  timingSafeEqualStrings,
  verifyBearerSecret,
  verifySecret,
} from "./secrets.js";

describe("timingSafeEqualStrings", () => {
  it("returns true for equal strings", () => {
    expect(timingSafeEqualStrings("secret", "secret")).toBe(true);
  });

  it("returns false for different strings of equal length", () => {
    expect(timingSafeEqualStrings("secret-a", "secret-b")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(timingSafeEqualStrings("short", "much-longer-value")).toBe(false);
  });
});

describe("verifySecret", () => {
  it("returns true when secrets match", () => {
    expect(verifySecret("my-secret", "my-secret")).toBe(true);
  });

  it("returns false for missing or invalid values", () => {
    expect(verifySecret(null, "my-secret")).toBe(false);
    expect(verifySecret("my-secret", undefined)).toBe(false);
    expect(verifySecret("wrong", "my-secret")).toBe(false);
  });
});

describe("verifyBearerSecret", () => {
  it("returns true for a valid bearer token", () => {
    expect(verifyBearerSecret("Bearer cron-secret", "cron-secret")).toBe(true);
  });

  it("returns false for invalid bearer tokens", () => {
    expect(verifyBearerSecret("Bearer wrong", "cron-secret")).toBe(false);
    expect(verifyBearerSecret("Basic cron-secret", "cron-secret")).toBe(false);
    expect(verifyBearerSecret(null, "cron-secret")).toBe(false);
    expect(verifyBearerSecret("Bearer cron-secret", undefined)).toBe(false);
  });
});
