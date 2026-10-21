import { z } from "zod";

export const requestResponseInput = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  message: z.string().trim().max(2000).default(""),
  retry: z.boolean().default(false),
});

export function requireRequestAdmin(isAdmin: boolean | null) {
  if (isAdmin !== true) throw new Error("Forbidden");
}

export function clientDecisionMessage(name: string, service: string | null, decision: "approved" | "rejected", message = "") {
  return `Habari ${name}, ombi lako la ${service || "huduma"} ${decision === "approved" ? "limekubaliwa (Approved)" : "limekataliwa (Rejected)"} na Midnight Graphics Enterprises.${message ? `\n\n${message}` : ""}`;
}

export function clientWhatsAppNumber(number: string | null) {
  const digits = (number || "").replace(/\D/g, "");
  if (/^0[67]\d{8}$/.test(digits)) return `255${digits.slice(1)}`;
  if (/^[67]\d{8}$/.test(digits)) return `255${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}