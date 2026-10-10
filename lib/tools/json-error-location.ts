/**
 * Finds where invalid JSON first goes wrong, without depending on what a browser's own error
 * message says. Browsers word these errors differently, and some give no position at all, so
 * the position is found here by reading the text against the JSON grammar (RFC 8259).
 *
 * It reads one character at a time with an explicit list of open arrays and objects, so deeply
 * nested input cannot overflow the call stack.
 */

const QUOTE = 0x22;
const BACKSLASH = 0x5c;
const FIRST_PRINTABLE = 0x20;
const SIMPLE_ESCAPES = new Set(['"', "\\", "/", "b", "f", "n", "r", "t"]);
const HEX_DIGITS = /^[0-9a-fA-F]{4}$/;
const LITERALS = ["true", "false", "null"] as const;

/** A scan either finishes at an index after what it read, or fails at a position. */
type Scan = { end: number; ok: true } | { ok: false; position: number };

type Expect = "after" | "key" | "value";

/**
 * Tells whether a character is a space, tab, or line break, the only whitespace JSON allows.
 */
function isWhitespace(character: string | undefined): boolean {
  return character === " " || character === "\t" || character === "\n" || character === "\r";
}

/**
 * Tells whether a character is a digit from 0 to 9.
 */
function isDigit(character: string | undefined): boolean {
  return character !== undefined && character >= "0" && character <= "9";
}

/**
 * Moves past spaces, tabs, and line breaks.
 */
function skipWhitespace(text: string, from: number): number {
  let index = from;

  while (index < text.length && isWhitespace(text[index])) {
    index += 1;
  }

  return index;
}

/**
 * Reads a string that starts at an opening quote, checking each escape and rejecting raw
 * control characters, which JSON does not allow inside a string.
 */
function scanString(text: string, start: number): Scan {
  let index = start + 1;

  while (index < text.length) {
    const code = text.charCodeAt(index);

    if (code === QUOTE) {
      return { end: index + 1, ok: true };
    }

    if (code < FIRST_PRINTABLE) {
      return { ok: false, position: index };
    }

    if (code === BACKSLASH) {
      const escaped = text[index + 1];

      if (escaped === "u") {
        if (!HEX_DIGITS.test(text.slice(index + 2, index + 6))) {
          return { ok: false, position: Math.min(index + 2, text.length) };
        }

        index += 6;
      } else if (escaped !== undefined && SIMPLE_ESCAPES.has(escaped)) {
        index += 2;
      } else {
        return { ok: false, position: Math.min(index + 1, text.length) };
      }
    } else {
      index += 1;
    }
  }

  // The text ended before the closing quote.
  return { ok: false, position: text.length };
}

/**
 * Reads a number: an optional minus, an integer without leading zeros, then an optional
 * fraction and an optional exponent.
 */
function scanNumber(text: string, start: number): Scan {
  let index = start;

  if (text[index] === "-") {
    index += 1;
  }

  if (text[index] === "0") {
    index += 1;
  } else if (isDigit(text[index])) {
    while (isDigit(text[index])) {
      index += 1;
    }
  } else {
    return { ok: false, position: index };
  }

  if (text[index] === ".") {
    index += 1;

    if (!isDigit(text[index])) {
      return { ok: false, position: index };
    }

    while (isDigit(text[index])) {
      index += 1;
    }
  }

  if (text[index] === "e" || text[index] === "E") {
    index += 1;

    if (text[index] === "+" || text[index] === "-") {
      index += 1;
    }

    if (!isDigit(text[index])) {
      return { ok: false, position: index };
    }

    while (isDigit(text[index])) {
      index += 1;
    }
  }

  return { end: index, ok: true };
}

/**
 * Reads true, false, or null, failing at the first character that does not match.
 */
function scanLiteral(text: string, start: number): Scan {
  const word = LITERALS.find((candidate) => candidate[0] === text[start]);

  if (!word) {
    return { ok: false, position: start };
  }

  for (let offset = 0; offset < word.length; offset += 1) {
    if (text[start + offset] !== word[offset]) {
      return { ok: false, position: Math.min(start + offset, text.length) };
    }
  }

  return { end: start + word.length, ok: true };
}

/**
 * Reads one value that is not an array or an object.
 */
function scanScalar(text: string, start: number): Scan {
  const first = text[start];

  if (first === '"') {
    return scanString(text, start);
  }

  if (first === "-" || isDigit(first)) {
    return scanNumber(text, start);
  }

  return scanLiteral(text, start);
}

/**
 * Returns the zero-based position of the first error in a piece of JSON text, or null when the
 * text is valid. A text that ends too early is reported at its end.
 */
export function findJsonErrorPosition(text: string): number | null {
  const open: ("array" | "object")[] = [];
  let index = skipWhitespace(text, 0);
  let expect: Expect = "value";

  for (;;) {
    if (expect === "value") {
      if (index >= text.length) {
        return text.length;
      }

      const character = text[index];

      if (character === "{") {
        open.push("object");
        index = skipWhitespace(text, index + 1);

        if (text[index] === "}") {
          open.pop();
          index = skipWhitespace(text, index + 1);
          expect = "after";
        } else {
          expect = "key";
        }
      } else if (character === "[") {
        open.push("array");
        index = skipWhitespace(text, index + 1);

        if (text[index] === "]") {
          open.pop();
          index = skipWhitespace(text, index + 1);
          expect = "after";
        }
      } else {
        const scan = scanScalar(text, index);

        if (!scan.ok) {
          return scan.position;
        }

        index = skipWhitespace(text, scan.end);
        expect = "after";
      }
    } else if (expect === "key") {
      if (text[index] !== '"') {
        return Math.min(index, text.length);
      }

      const scan = scanString(text, index);

      if (!scan.ok) {
        return scan.position;
      }

      index = skipWhitespace(text, scan.end);

      if (text[index] !== ":") {
        return Math.min(index, text.length);
      }

      index = skipWhitespace(text, index + 1);
      expect = "value";
    } else {
      const innermost = open.at(-1);

      if (innermost === undefined) {
        // The one value is complete, so only whitespace may follow.
        return index < text.length ? index : null;
      }

      const character = text[index];

      if (character === ",") {
        index = skipWhitespace(text, index + 1);
        expect = innermost === "object" ? "key" : "value";
      } else if (character === (innermost === "object" ? "}" : "]")) {
        open.pop();
        index = skipWhitespace(text, index + 1);
      } else {
        return Math.min(index, text.length);
      }
    }
  }
}
