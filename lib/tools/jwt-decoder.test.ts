import { describe, expect, it } from "vitest";
import { decodeJwt } from "./jwt-decoder";

const VALID_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXIiLCJyb2xlIjoiZGV2ZWxvcGVyIn0.c2lnbmF0dXJl";

describe("decodeJwt", () => {
  it("decodes object-shaped header and payload sections", () => {
    expect(decodeJwt(VALID_TOKEN)).toEqual({
      ok: true,
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: "demo-user", role: "developer" },
      headerJson: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
      payloadJson: '{\n  "sub": "demo-user",\n  "role": "developer"\n}',
      algorithm: "HS256",
      hasSignature: true,
    });
  });

  it("accepts an unsigned compact token without treating it as verified", () => {
    const result = decodeJwt(`${VALID_TOKEN.slice(0, VALID_TOKEN.lastIndexOf("."))}.`);

    expect(result).toMatchObject({ ok: true, algorithm: "HS256", hasSignature: false });
  });

  it.each([
    ["", "Enter a JWT to decode."],
    ["one.two", "three dot-separated parts"],
    ["*.e30.signature", "header is not valid Base64URL"],
    ["e30.e30.*", "signature is not valid Base64URL"],
    ["bm90LWpzb24.e30.signature", "header does not contain valid JSON"],
    ["W10.e30.signature", "header must contain a JSON object"],
  ])("rejects malformed input %#", (input, expectedMessage) => {
    expect(decodeJwt(input)).toMatchObject({ ok: false, message: expect.stringContaining(expectedMessage) });
  });

  it("enforces the configured local-processing limit", () => {
    expect(decodeJwt(VALID_TOKEN, 10)).toEqual({
      ok: false,
      message: "This JWT exceeds the 10 character local-processing limit.",
    });
  });
});
