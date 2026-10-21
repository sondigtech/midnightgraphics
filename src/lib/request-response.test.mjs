import { describe, expect, test } from "bun:test";
import { clientWhatsAppNumber, requestResponseInput, requireRequestAdmin } from "./request-response";

describe("admin request decisions", () => {
  test("accepts approved", () => {
    expect(requestResponseInput.parse({ id: "12345678-1234-4234-8234-123456789abc", decision: "approved" }).decision).toBe("approved");
  });
  test("accepts rejected and refuses other decisions", () => {
    expect(requestResponseInput.parse({ id: "12345678-1234-4234-8234-123456789abc", decision: "rejected" }).decision).toBe("rejected");
    expect(() => requestResponseInput.parse({ id: "12345678-1234-4234-8234-123456789abc", decision: "completed" })).toThrow();
  });
  test("only admins may respond", () => {
    expect(() => requireRequestAdmin(false)).toThrow("Forbidden");
    expect(() => requireRequestAdmin(null)).toThrow("Forbidden");
    expect(() => requireRequestAdmin(true)).not.toThrow();
  });
  test("normalizes Tanzanian phone numbers for WhatsApp", () => {
    expect(clientWhatsAppNumber("0775 057 780")).toBe("255775057780");
    expect(clientWhatsAppNumber("+255775057780")).toBe("255775057780");
    expect(clientWhatsAppNumber(null)).toBeNull();
  });
});