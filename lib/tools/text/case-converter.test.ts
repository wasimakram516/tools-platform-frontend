// @vitest-environment node
import { describe, expect, it } from "vitest";
import { CASE_SAMPLE, CASE_STYLES, convertCase, type CaseStyle } from "@/lib/tools/text/case-converter";

describe("convertCase", () => {
  it("changes the whole text to upper or lower case", () => {
    expect(convertCase("Hello World", "upper")).toBe("HELLO WORLD");
    expect(convertCase("Hello World", "lower")).toBe("hello world");
  });

  it("capitalises each word in title case, leaving small words alone after the first", () => {
    expect(convertCase("the lord of the rings", "title")).toBe("The Lord of the Rings");
    expect(convertCase("DON'T STOP believing", "title")).toBe("Don't Stop Believing");
    expect(convertCase("a tale of two cities", "title")).toBe("A Tale of Two Cities");
  });

  it("capitalises the start of each sentence and line in sentence case", () => {
    expect(convertCase("hELLO world. hOW are you?\nnew line", "sentence")).toBe(
      "Hello world. How are you?\nNew line",
    );
  });

  it("joins words in the programming styles, whatever style they started in", () => {
    expect(convertCase("the quick-brown_fox JumpsOver", "camel")).toBe("theQuickBrownFoxJumpsOver");
    expect(convertCase("hello world", "pascal")).toBe("HelloWorld");
    expect(convertCase("Hello World", "snake")).toBe("hello_world");
    expect(convertCase("someVariableName", "kebab")).toBe("some-variable-name");
    expect(convertCase("some variable-name", "constant")).toBe("SOME_VARIABLE_NAME");
  });

  it("splits runs of capitals before the next word", () => {
    expect(convertCase("XMLHttpRequest", "snake")).toBe("xml_http_request");
  });

  it("converts each line on its own so a list stays a list", () => {
    expect(convertCase("one two\n\nthree four", "snake")).toBe("one_two\n\nthree_four");
  });

  it("handles accented letters", () => {
    expect(convertCase("école normale", "title")).toBe("École Normale");
    expect(convertCase("café au lait", "upper")).toBe("CAFÉ AU LAIT");
  });

  it("returns empty text unchanged for every style", () => {
    for (const style of CASE_STYLES.map((entry) => entry.value) as CaseStyle[]) {
      expect(convertCase("", style)).toBe("");
    }
  });

  it("lists an example that the converter itself produces", () => {
    for (const { example, value } of CASE_STYLES) {
      expect(convertCase(CASE_SAMPLE, value)).toBe(example);
    }
  });

  it("capitalises every word, small words included, in capitalize-each-word", () => {
    expect(convertCase("the lord of the rings", "capitalized")).toBe("The Lord Of The Rings");
  });

  it("alternates the case from letter to letter and swaps the case", () => {
    expect(convertCase("hello world", "alternating")).toBe("hElLo WoRlD");
    expect(convertCase("Hello World", "inverse")).toBe("hELLO wORLD");
  });

  it("writes dot.case and Train-Case", () => {
    expect(convertCase("someVariable name", "dot")).toBe("some.variable.name");
    expect(convertCase("hello big world", "train")).toBe("Hello-Big-World");
  });

  it("makes a URL slug without accents or punctuation, and does not split camelCase", () => {
    expect(convertCase("  Crème Brûlée & Café!  ", "slug")).toBe("creme-brulee-cafe");
    expect(convertCase("iPhone Case", "slug")).toBe("iphone-case");
  });

  it("tidies spacing without changing the words", () => {
    const messy = "  hello   world " + "\n\n\n\n" + " next\t line  ";

    expect(convertCase(messy, "tidy")).toBe("hello world\n\nnext line");
  });
});
