import { parseIsoDate, toEpochDay } from "@/lib/tools/dates/calendar";

export type UnixTimestampMode = "toDate" | "toTimestamp";

export const MAX_TIMESTAMP_INPUT_CHARACTERS = 100;

/** Values with 12 or more digits are read as milliseconds; shorter values as seconds. */
const MILLISECONDS_THRESHOLD = 100_000_000_000;
/** The furthest instant a JavaScript Date can represent, in milliseconds. */
const MAX_DATE_MILLISECONDS = 8_640_000_000_000_000;
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;
const TIMESTAMP_PATTERN = /^-?\d{1,16}$/;
const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i;
const OFFSET_PATTERN = /^([+-])(\d{2}):?(\d{2})$/;

export interface TimestampTransformSuccess {
  ok: true;
  output: string;
  characterCount: number;
}

export interface TimestampTransformFailure {
  ok: false;
  message: string;
}

export type TimestampTransformResult = TimestampTransformSuccess | TimestampTransformFailure;

export interface TimestampOptions {
  /** IANA zone used for the "Local" line. Defaults to the browser's own zone. */
  timeZone?: string;
}

/**
 * Wraps lines of output in the success shape the converter UI expects.
 */
function success(lines: readonly string[]): TimestampTransformSuccess {
  const output = lines.join("\n");

  return { characterCount: output.length, ok: true, output };
}

/**
 * Wraps a message in the failure shape the converter UI expects.
 */
function fail(message: string): TimestampTransformFailure {
  return { message, ok: false };
}

/**
 * Turns a Unix timestamp (seconds or milliseconds) into readable dates.
 */
function timestampToDate(input: string, options: TimestampOptions): TimestampTransformResult {
  const text = input.trim();

  if (!text) {
    return fail("Enter a Unix timestamp to convert.");
  }

  if (!TIMESTAMP_PATTERN.test(text)) {
    return fail("Enter digits only, in seconds or milliseconds. Example: 1760000000");
  }

  const value = Number(text);
  const isMilliseconds = Math.abs(value) >= MILLISECONDS_THRESHOLD;
  const milliseconds = isMilliseconds ? value : value * MS_PER_SECOND;

  if (Math.abs(milliseconds) > MAX_DATE_MILLISECONDS) {
    return fail("That timestamp is outside the range a date can represent.");
  }

  const instant = new Date(milliseconds);
  const timeZone = options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone,
  }).format(instant);

  return success([
    `Detected unit: ${isMilliseconds ? "milliseconds" : "seconds"}`,
    `Seconds: ${Math.floor(milliseconds / MS_PER_SECOND)}`,
    `Milliseconds: ${milliseconds}`,
    `UTC: ${instant.toISOString()}`,
    `Local (${timeZone}): ${local}`,
  ]);
}

/**
 * Converts a time-zone designator ("Z", "+05:00", "-0330") to minutes east of UTC, or null.
 */
function offsetToMinutes(designator: string): number | null {
  if (designator.toUpperCase() === "Z") {
    return 0;
  }

  const match = OFFSET_PATTERN.exec(designator);

  if (!match) {
    return null;
  }

  const hours = Number(match[2]);
  const minutes = Number(match[3]);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return (match[1] === "-" ? -1 : 1) * (hours * 60 + minutes);
}

/**
 * Turns a date or date-time into Unix timestamps. Text with no time zone is read as UTC, so
 * the answer never depends on where the browser happens to be.
 */
function dateToTimestamp(input: string): TimestampTransformResult {
  const text = input.trim();

  if (!text) {
    return fail("Enter a date and time to convert.");
  }

  const match = DATE_TIME_PATTERN.exec(text);

  if (!match) {
    return fail("Enter a date such as 2026-10-07 or 2026-10-07T12:30:00Z.");
  }

  const [, year = "", month = "", day = "", hour = "0", minute = "0", second = "0", fraction = "", zone = ""] =
    match;
  const calendarDate = parseIsoDate(`${year}-${month}-${day}`);
  const hours = Number(hour);
  const minutes = Number(minute);
  const seconds = Number(second);
  const offset = zone ? offsetToMinutes(zone) : 0;

  if (!calendarDate || hours > 23 || minutes > 59 || seconds > 59 || offset === null) {
    return fail("That date or time does not exist.");
  }

  const fractionMilliseconds = fraction ? Number(fraction.padEnd(3, "0")) : 0;
  const milliseconds =
    toEpochDay(calendarDate) * MS_PER_DAY +
    ((hours * 60 + minutes) * 60 + seconds) * MS_PER_SECOND +
    fractionMilliseconds -
    offset * MS_PER_MINUTE;

  if (Math.abs(milliseconds) > MAX_DATE_MILLISECONDS) {
    return fail("That date is outside the range a timestamp can represent.");
  }

  const lines = [
    `Seconds: ${Math.floor(milliseconds / MS_PER_SECOND)}`,
    `Milliseconds: ${milliseconds}`,
    `UTC: ${new Date(milliseconds).toISOString()}`,
  ];

  return success(zone ? lines : [...lines, "Note: no time zone was given, so it was read as UTC."]);
}

/**
 * Converts between Unix timestamps and dates in either direction.
 */
export function transformUnixTimestamp(
  input: string,
  mode: UnixTimestampMode,
  options: TimestampOptions = {},
): TimestampTransformResult {
  return mode === "toDate" ? timestampToDate(input, options) : dateToTimestamp(input);
}

/**
 * Async wrapper with the signature the shared two-way converter expects.
 */
export async function runUnixTimestampTransform(
  input: string,
  mode: UnixTimestampMode,
): Promise<TimestampTransformResult> {
  return transformUnixTimestamp(input, mode);
}
