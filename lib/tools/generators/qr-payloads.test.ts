// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  contactPayload,
  emailPayload,
  phonePayload,
  smsPayload,
  textPayload,
  urlPayload,
  whatsappPayload,
} from "@/lib/tools/generators/qr-payloads";
import { wifiPayload } from "@/lib/tools/generators/qr-payloads";

// Every payload below was also built into a real QR code and scanned back with OpenCV, which
// returned exactly the same text.

describe("textPayload and urlPayload", () => {
  it("keeps text as typed and refuses nothing", () => {
    expect(textPayload("Hello, world")).toEqual({ ok: true, text: "Hello, world" });
    expect(textPayload("   ")).toMatchObject({ ok: false });
  });

  it("fills in https when a web address has no scheme", () => {
    expect(urlPayload("example.com/path?a=1&b=2")).toEqual({ ok: true, text: "https://example.com/path?a=1&b=2" });
    expect(urlPayload("  http://example.com  ")).toEqual({ ok: true, text: "http://example.com" });
  });

  it("refuses things that are not web addresses", () => {
    for (const bad of ["", "ftp://example.com", "localhost", "not a url with spaces", "javascript:alert(1)"]) {
      expect(urlPayload(bad)).toMatchObject({ ok: false });
    }
  });
});

describe("wifiPayload", () => {
  const HOME = { hidden: false, password: "secret123", security: "WPA" as const, ssid: "Home" };

  it("writes the network in the format phones read", () => {
    expect(wifiPayload(HOME)).toEqual({ ok: true, text: "WIFI:T:WPA;S:Home;P:secret123;;" });
    expect(wifiPayload({ ...HOME, hidden: true })).toEqual({ ok: true, text: "WIFI:T:WPA;S:Home;P:secret123;H:true;;" });
    expect(wifiPayload({ hidden: false, password: "", security: "nopass", ssid: "Cafe" })).toEqual({
      ok: true,
      text: "WIFI:T:nopass;S:Cafe;;",
    });
  });

  it("escapes the characters that would otherwise break the format", () => {
    expect(wifiPayload({ hidden: true, password: 'p@ss;w"or:d,\\1', security: "WPA", ssid: "My;Net:work" })).toEqual({
      ok: true,
      text: 'WIFI:T:WPA;S:My\\;Net\\:work;P:p@ss\\;w\\"or\\:d\\,\\\\1;H:true;;',
    });
  });

  it("explains what is missing or wrong", () => {
    expect(wifiPayload({ ...HOME, ssid: "" })).toMatchObject({ ok: false });
    expect(wifiPayload({ ...HOME, ssid: "x".repeat(33) })).toMatchObject({ ok: false });
    expect(wifiPayload({ ...HOME, password: "short" })).toMatchObject({ ok: false });
    expect(wifiPayload({ ...HOME, password: "x".repeat(64) })).toMatchObject({ ok: false });
    expect(wifiPayload({ ...HOME, password: "", security: "WEP" })).toMatchObject({ ok: false });
  });
});

describe("contactPayload", () => {
  const ADA = {
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    organization: "Analytical",
    phone: "+44 20 7946 0958",
    title: "Engineer",
    website: "https://example.com",
  };

  it("writes a vCard with only the parts that were filled in", () => {
    expect(contactPayload(ADA)).toEqual({
      ok: true,
      text: [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Lovelace;Ada;;;",
        "FN:Ada Lovelace",
        "ORG:Analytical",
        "TITLE:Engineer",
        "TEL;TYPE=CELL:+442079460958",
        "EMAIL:ada@example.com",
        "URL:https://example.com",
        "END:VCARD",
      ].join("\n"),
    });
    expect(contactPayload({ ...ADA, email: "", organization: "", phone: "", title: "", website: "" })).toMatchObject({
      text: "BEGIN:VCARD\nVERSION:3.0\nN:Lovelace;Ada;;;\nFN:Ada Lovelace\nEND:VCARD",
    });
  });

  it("escapes commas and semicolons, and uses the organisation as the name when there is no person", () => {
    expect(contactPayload({ ...ADA, lastName: "García, Jr." })).toMatchObject({
      text: expect.stringContaining("N:García\\, Jr.;Ada;;;"),
    });
    expect(contactPayload({ ...ADA, firstName: "", lastName: "" })).toMatchObject({
      text: expect.stringContaining("FN:Analytical"),
    });
  });

  it("needs a name or an organisation, and a believable email", () => {
    expect(contactPayload({ ...ADA, firstName: "", lastName: "", organization: "" })).toMatchObject({ ok: false });
    expect(contactPayload({ ...ADA, email: "not an email" })).toMatchObject({ ok: false });
  });
});

describe("emailPayload, phonePayload, smsPayload, and whatsappPayload", () => {
  it("builds a mailto link, encoding the subject and message", () => {
    expect(emailPayload({ body: "Hello & welcome", subject: "Hi there", to: "a@b.com" })).toEqual({
      ok: true,
      text: "mailto:a@b.com?subject=Hi%20there&body=Hello%20%26%20welcome",
    });
    expect(emailPayload({ body: "", subject: "", to: " a@b.com " })).toEqual({ ok: true, text: "mailto:a@b.com" });
    expect(emailPayload({ body: "", subject: "", to: "nope" })).toMatchObject({ ok: false });
  });

  it("keeps a phone number's digits and leading plus", () => {
    expect(phonePayload("+92 (300) 123-4567")).toEqual({ ok: true, text: "tel:+923001234567" });
    expect(phonePayload("12")).toMatchObject({ ok: false });
  });

  it("builds a text message link", () => {
    expect(smsPayload({ message: "See you at 5: ok?", number: "+1 (555) 010-9999" })).toEqual({
      ok: true,
      text: "SMSTO:+15550109999:See you at 5: ok?",
    });
    expect(smsPayload({ message: "", number: "1" })).toMatchObject({ ok: false });
  });

  it("builds a WhatsApp link from the number without its plus sign", () => {
    expect(whatsappPayload({ message: "Hi! How much?", number: "+92 300 1234567" })).toEqual({
      ok: true,
      text: "https://wa.me/923001234567?text=Hi!%20How%20much%3F",
    });
    expect(whatsappPayload({ message: "", number: "+92 300 1234567" })).toEqual({ ok: true, text: "https://wa.me/923001234567" });
    expect(whatsappPayload({ message: "", number: "12345" })).toMatchObject({ ok: false });
    expect(whatsappPayload({ message: "", number: "1".repeat(16) })).toMatchObject({ ok: false });
  });
});
