// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { transformBase64 } from "@/lib/tools/base64";
import { calculateBmi } from "@/lib/tools/calculators/bmi";
import { calculateLoan } from "@/lib/tools/calculators/loan";
import { calculateTipSplit } from "@/lib/tools/calculators/tip-split";
import { csvToJson } from "@/lib/tools/data/csv-json";
import { formatInteger, parseInteger, toRoman } from "@/lib/tools/data/number-bases";
import { calculateDateDifference } from "@/lib/tools/dates/date-difference";
import { calculateDateMath } from "@/lib/tools/dates/date-math";
import { dateToExcelSerial } from "@/lib/tools/dates/excel-date";
import { calculateHoursWorked } from "@/lib/tools/dates/hours-worked";
import { hashText } from "@/lib/tools/hash-generator";
import { transformJson } from "@/lib/tools/json-formatter";
import { buildUtmUrl } from "@/lib/tools/seo/utm";
import { TOOL_EXTRAS } from "@/lib/tools/tool-extras";
import { getTools } from "@/lib/tools/tool-registry";
import { transformUrlComponent } from "@/lib/tools/url-encoder";

const available = getTools().filter((tool) => tool.status === "available");

describe("tool extras", () => {
  it("covers every available tool, and only those", () => {
    expect(Object.keys(TOOL_EXTRAS).sort()).toEqual(available.map((tool) => tool.id).sort());
  });

  it.each(available.map((tool) => [tool.slug, tool.id] as const))("%s has an example, an explanation, and limits", (_slug, id) => {
    const extras = TOOL_EXTRAS[id];

    expect(extras, id).toBeDefined();
    expect(extras?.example.title.length ?? 0, `${id} title`).toBeGreaterThan(3);
    expect(extras?.example.input.length ?? 0, `${id} input`).toBeGreaterThan(3);
    expect(extras?.example.output.length ?? 0, `${id} output`).toBeGreaterThan(3);
    expect(extras?.about.length ?? 0, `${id} about`).toBeGreaterThanOrEqual(100);
    expect(extras?.limits.length ?? 0, `${id} limits`).toBeGreaterThanOrEqual(2);
    expect(extras?.limits.length ?? 0, `${id} limits`).toBeLessThanOrEqual(4);

    for (const limit of extras?.limits ?? []) {
      expect(limit.endsWith("."), `${id}: ${limit}`).toBe(true);
    }
  });

  it("has no placeholder text and no long dashes", () => {
    for (const [id, extras] of Object.entries(TOOL_EXTRAS)) {
      const text = [extras.about, extras.example.title, extras.example.input, extras.limits.join(" ")].join(" ");

      expect(text, id).not.toMatch(/lorem|todo|tbd|xxx/i);
      expect(text, id).not.toMatch(/[–—]/);
    }
  });
});

describe("worked examples match what the tools really produce", () => {
  it("formats JSON", () => {
    const result = transformJson('{"name":"Ada","skills":["math","code"],"active":true}', "format", 2);

    expect(result.ok && result.output).toBe(TOOL_EXTRAS["DEV-01"]?.example.output);
  });

  it("encodes Base64 and URL components", () => {
    const base64 = transformBase64("Hello, world!", "encode");
    const url = transformUrlComponent("name=Ada Lovelace&city=São Paulo", "encode");

    expect(base64.ok && base64.output).toBe(TOOL_EXTRAS["DEV-04"]?.example.output);
    expect(url.ok && url.output).toBe(TOOL_EXTRAS["DEV-05"]?.example.output);
  });

  it("hashes text", async () => {
    const result = await hashText("hello");

    expect(result.ok && result.hashes["SHA-256"]).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    expect(TOOL_EXTRAS["DEV-08"]?.example.output).toContain("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("converts CSV to JSON with numbers typed", () => {
    const result = csvToJson("name,age,city\nAda,36,London\nLinus,28,Helsinki", {
      delimiter: "auto",
      hasHeader: true,
      indent: 2,
      inferTypes: true,
      trim: true,
    });

    expect(result.ok && JSON.parse(result.output)).toEqual([
      { age: 36, city: "London", name: "Ada" },
      { age: 28, city: "Helsinki", name: "Linus" },
    ]);
  });

  it("converts number bases and Roman numerals", () => {
    const parsed = parseInteger("255", 10);

    expect(parsed.ok && [formatInteger(parsed.value, 16), formatInteger(parsed.value, 2), formatInteger(parsed.value, 8)]).toEqual([
      "FF",
      "11111111",
      "377",
    ]);
    expect(toRoman(2024)).toEqual({ ok: true, output: "MMXXIV" });
  });

  it("works out the loan, tip, and BMI figures", () => {
    const loan = calculateLoan({ annualRatePercent: 6, extraMonthly: 100, principal: 10000, termMonths: 60 });
    const plain = calculateLoan({ annualRatePercent: 6, extraMonthly: 0, principal: 10000, termMonths: 60 });
    const tip = calculateTipSplit({ bill: 120, people: 4, roundUpShare: false, tipPercent: 18 });
    const bmi = calculateBmi({ height: 175, heightInches: 0, heightUnit: "cm", weight: 70, weightUnit: "kg" });

    expect(loan.ok && [loan.monthlyPayment.toFixed(2), loan.payoffMonths, loan.totalInterest.toFixed(2), loan.interestSaved.toFixed(2)]).toEqual([
      "193.33",
      38,
      "991.06",
      "608.62",
    ]);
    expect(plain.ok && plain.totalInterest.toFixed(2)).toBe("1599.68");
    expect(tip.ok && [tip.tip.toFixed(2), tip.total.toFixed(2), tip.perPerson.toFixed(2)]).toEqual(["21.60", "141.60", "35.40"]);
    expect(bmi.ok && [bmi.bmi.toFixed(1), bmi.category, bmi.healthyRange.min.toFixed(1), bmi.healthyRange.max.toFixed(1)]).toEqual([
      "22.9",
      "Healthy weight",
      "56.7",
      "76.3",
    ]);
  });

  it("works out the date and time figures", () => {
    const difference = calculateDateDifference("2024-01-15", "2024-03-01", false);
    const math = calculateDateMath({ days: 30, months: 0, operation: "add", startDate: "2024-01-31", weeks: 0, years: 0 });
    const shift = calculateHoursWorked("09:00", "17:30", 30);
    const excel = dateToExcelSerial("2024-01-01", "", "1900");

    expect(difference.ok && [difference.totalDays, difference.months, difference.days, difference.weeks, difference.remainingDays]).toEqual([
      46, 1, 15, 6, 4,
    ]);
    expect(math.ok && math.date).toBe("2024-03-01");
    expect(shift.ok && shift.netLabel).toBe("8h 00m");
    expect(excel.ok && excel.serial).toBe("45292");
  });

  it("builds a tagged link", () => {
    const result = buildUtmUrl(
      { campaign: "Spring Sale", content: "", id: "", medium: "email", source: "newsletter", term: "", url: "example.com/shop" },
      { lowercase: true, spaces: "dash" },
    );

    expect(result.url).toBe(TOOL_EXTRAS["SEO-07"]?.example.output);
  });
});
