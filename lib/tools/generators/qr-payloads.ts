import { type CalculationFailure, failure } from "@/lib/tools/dates/result";

export type PayloadResult = { ok: true; text: string } | CalculationFailure;

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export interface WifiFields {
  hidden: boolean;
  password: string;
  security: WifiSecurity;
  ssid: string;
}

export interface ContactFields {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  phone: string;
  title: string;
  website: string;
}

export interface EmailFields {
  body: string;
  subject: string;
  to: string;
}

export interface MessageFields {
  message: string;
  number: string;
}

const MAX_SSID_BYTES = 32;
const MIN_WPA_PASSWORD = 8;
const MAX_WPA_PASSWORD = 63;
const MIN_PHONE_DIGITS = 3;
const MIN_WHATSAPP_DIGITS = 6;
const MAX_PHONE_DIGITS = 15;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Wraps text for the success case.
 */
function ok(text: string): PayloadResult {
  return { ok: true, text };
}

/**
 * Keeps a phone number's digits and a leading plus, dropping spaces, dashes, and brackets.
 */
function cleanNumber(number: string): string {
  const trimmed = number.trim();

  return (trimmed.startsWith("+") ? "+" : "") + trimmed.replace(/\D/g, "");
}

/**
 * Plain text, exactly as typed.
 */
export function textPayload(text: string): PayloadResult {
  return text.trim() === "" ? failure("Enter some text.") : ok(text);
}

/**
 * A web address. A missing scheme is filled in as https, so "example.com" works.
 */
export function urlPayload(input: string): PayloadResult {
  const trimmed = input.trim();

  if (trimmed === "") {
    return failure("Enter a web address.");
  }

  const candidate = SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);

    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) {
      return failure("Enter a web address that starts with http or https, such as example.com.");
    }
  } catch {
    return failure("That does not look like a web address.");
  }

  return ok(candidate);
}

/**
 * Backslash-escapes the characters that have a meaning inside a Wi-Fi code.
 */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/**
 * Wi-Fi details in the format phones read to offer joining the network.
 */
export function wifiPayload({ hidden, password, security, ssid }: WifiFields): PayloadResult {
  if (ssid === "") {
    return failure("Enter the network name.");
  }

  if (new TextEncoder().encode(ssid).length > MAX_SSID_BYTES) {
    return failure(`A network name can be at most ${MAX_SSID_BYTES} bytes long.`);
  }

  if (security === "WPA" && (password.length < MIN_WPA_PASSWORD || password.length > MAX_WPA_PASSWORD)) {
    return failure(`A WPA password is ${MIN_WPA_PASSWORD} to ${MAX_WPA_PASSWORD} characters.`);
  }

  if (security === "WEP" && password === "") {
    return failure("Enter the network password.");
  }

  const parts = [`T:${security}`, `S:${escapeWifi(ssid)}`];

  if (security !== "nopass") {
    parts.push(`P:${escapeWifi(password)}`);
  }

  if (hidden) {
    parts.push("H:true");
  }

  return ok(`WIFI:${parts.join(";")};;`);
}

/**
 * Escapes the characters that have a meaning inside a vCard value.
 */
function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

/**
 * A contact card (vCard 3.0) that phones offer to save.
 */
export function contactPayload(fields: ContactFields): PayloadResult {
  const first = fields.firstName.trim();
  const last = fields.lastName.trim();
  const organization = fields.organization.trim();
  const email = fields.email.trim();
  const phone = cleanNumber(fields.phone);

  if (!first && !last && !organization) {
    return failure("Enter a name or an organisation.");
  }

  if (email && !EMAIL.test(email)) {
    return failure("That email address does not look right.");
  }

  const fullName = [first, last].filter(Boolean).join(" ") || organization;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
    `FN:${escapeVCard(fullName)}`,
    ...(organization ? [`ORG:${escapeVCard(organization)}`] : []),
    ...(fields.title.trim() ? [`TITLE:${escapeVCard(fields.title.trim())}`] : []),
    ...(phone ? [`TEL;TYPE=CELL:${phone}`] : []),
    ...(email ? [`EMAIL:${escapeVCard(email)}`] : []),
    ...(fields.website.trim() ? [`URL:${fields.website.trim()}`] : []),
    "END:VCARD",
  ];

  return ok(lines.join("\n"));
}

/**
 * A mailto link with an optional subject and message.
 */
export function emailPayload({ body, subject, to }: EmailFields): PayloadResult {
  const address = to.trim();

  if (!EMAIL.test(address)) {
    return failure("Enter a valid email address.");
  }

  const query = [
    ...(subject.trim() ? [`subject=${encodeURIComponent(subject.trim())}`] : []),
    ...(body.trim() ? [`body=${encodeURIComponent(body.trim())}`] : []),
  ].join("&");

  return ok(`mailto:${address}${query ? `?${query}` : ""}`);
}

/**
 * A phone number that phones offer to call.
 */
export function phonePayload(number: string): PayloadResult {
  const cleaned = cleanNumber(number);

  return cleaned.replace("+", "").length < MIN_PHONE_DIGITS ? failure("Enter a phone number.") : ok(`tel:${cleaned}`);
}

/**
 * A text message to a number, with an optional ready-written message.
 */
export function smsPayload({ message, number }: MessageFields): PayloadResult {
  const cleaned = cleanNumber(number);

  if (cleaned.replace("+", "").length < MIN_PHONE_DIGITS) {
    return failure("Enter a phone number.");
  }

  return ok(`SMSTO:${cleaned}:${message.trim()}`);
}

/**
 * A WhatsApp chat link. WhatsApp wants the number with its country code and no plus sign.
 */
export function whatsappPayload({ message, number }: MessageFields): PayloadResult {
  const digits = number.replace(/\D/g, "");

  if (digits.length < MIN_WHATSAPP_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return failure(`Enter the number with its country code, ${MIN_WHATSAPP_DIGITS} to ${MAX_PHONE_DIGITS} digits.`);
  }

  return ok(`https://wa.me/${digits}${message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ""}`);
}
