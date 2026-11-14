import { describe, expect, it, vi } from "vitest";
import { acceptChoice, acceptIsoDate, buildShareUrl, MAX_SHARED_VALUE_LENGTH, readSharedValues } from "@/lib/tools/share-link";

const PAGE = { origin: "https://www.quicklysorted.com", pathname: "/tools/loan-calculator" };

describe("buildShareUrl", () => {
  it("puts the values in the query, leaving out empty ones", () => {
    expect(buildShareUrl(PAGE, { amount: "10000", extra: " ", rate: "6.5", years: "5" })).toBe(
      "https://www.quicklysorted.com/tools/loan-calculator?amount=10000&rate=6.5&years=5",
    );
  });

  it("encodes values safely and gives the bare page when nothing is filled in", () => {
    expect(buildShareUrl(PAGE, { note: "a&b=c" })).toBe("https://www.quicklysorted.com/tools/loan-calculator?note=a%26b%3Dc");
    expect(buildShareUrl(PAGE, { amount: "" })).toBe("https://www.quicklysorted.com/tools/loan-calculator");
  });
});

describe("readSharedValues", () => {
  it("reads only the keys the tool knows", () => {
    expect(readSharedValues("?amount=10000&rate=6.5&utm_source=x", ["amount", "rate", "years"])).toEqual({ amount: "10000", rate: "6.5" });
  });

  it("ignores empty and overlong values", () => {
    const long = "9".repeat(MAX_SHARED_VALUE_LENGTH + 1);

    expect(readSharedValues(`?amount=&rate=${long}&years=5`, ["amount", "rate", "years"])).toEqual({ years: "5" });
  });

  it("round trips what buildShareUrl writes", () => {
    const url = new URL(buildShareUrl(PAGE, { from: "2024-01-01", to: "2024-12-31" }));

    expect(readSharedValues(url.search, ["from", "to"])).toEqual({ from: "2024-01-01", to: "2024-12-31" });
  });
});

describe("setters for shared values", () => {
  it("passes on only a known choice", () => {
    const set = vi.fn();
    const accept = acceptChoice(["add", "subtract"] as const, set);

    accept("subtract");
    accept("multiply");

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith("subtract");
  });

  it("passes on only a YYYY-MM-DD date", () => {
    const set = vi.fn();
    const accept = acceptIsoDate(set);

    accept("2024-02-29");
    accept("29/02/2024");
    accept("2024-2-9");

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith("2024-02-29");
  });
});
