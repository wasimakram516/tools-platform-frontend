"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyIcon from "@mui/icons-material/Key";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PinOutlinedIcon from "@mui/icons-material/PinOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SubjectIcon from "@mui/icons-material/Subject";
import { Alert, Button, Chip, Link, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { CopyableValueRow } from "@/components/tools/copyable-value-row";
import { NumberField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { FieldHint } from "@/components/ui/field-hint";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import {
  generatePassphrases,
  generatePasswords,
  generatePins,
  generateTokens,
  MAX_GENERATED,
  MAX_PASSPHRASE_WORDS,
  MAX_PASSWORD_LENGTH,
  MAX_PIN_LENGTH,
  MAX_TOKEN_LENGTH,
  MIN_PASSPHRASE_WORDS,
  MIN_PASSWORD_LENGTH,
  MIN_PIN_LENGTH,
  MIN_TOKEN_LENGTH,
  strengthOf,
  type GenerationResult,
  type PassphraseOptions,
  type PasswordOptions,
  type PinOptions,
  type TokenAlphabet,
  type TokenOptions,
} from "@/lib/tools/generators/password";
import type { Uint32Source } from "@/lib/tools/generators/random";

type Mode = "password" | "passphrase" | "pin" | "token";

const MODE_OPTIONS = [
  { icon: <LockOutlinedIcon />, label: "Password", tooltip: "Random letters, numbers, and symbols", value: "password" },
  { icon: <SubjectIcon />, label: "Passphrase", tooltip: "Random words, easy to type and remember", value: "passphrase" },
  { icon: <PinOutlinedIcon />, label: "PIN", tooltip: "Random digits", value: "pin" },
  { icon: <KeyIcon />, label: "Token", tooltip: "Random keys for apps and APIs", value: "token" },
] as const;

const ALPHABET_OPTIONS = [
  { label: "Hex", tooltip: "0-9 and a-f", value: "hex" },
  { label: "Letters and digits", tooltip: "0-9, a-z, and A-Z", value: "base62" },
  { label: "URL-safe", tooltip: "Letters, digits, - and _", value: "base64url" },
] as const;

const SEPARATORS = [
  { label: "Dash ( - )", value: "-" },
  { label: "Space", value: " " },
  { label: "Dot ( . )", value: "." },
  { label: "Underscore ( _ )", value: "_" },
  { label: "None", value: "" },
] as const;

const NOUN: Readonly<Record<Mode, string>> = {
  passphrase: "Passphrase",
  password: "Password",
  pin: "PIN",
  token: "Token",
};

interface Settings {
  count: number;
  mode: Mode;
  passphrase: PassphraseOptions;
  password: PasswordOptions;
  pin: PinOptions;
  token: TokenOptions;
}

const INITIAL_SETTINGS: Settings = {
  count: 5,
  mode: "password",
  passphrase: { capitalize: false, includeNumber: false, separator: "-", words: 5 },
  password: {
    digits: true,
    excludeAmbiguous: false,
    excludeCharacters: "",
    length: 16,
    lowercase: true,
    requireEachKind: true,
    symbols: true,
    uppercase: true,
  },
  pin: { avoidPatterns: true, length: 6 },
  token: { alphabet: "hex", length: 32 },
};

interface PasswordGeneratorToolProps {
  /** Supplies random numbers; replaced in tests so the output is predictable. */
  source?: Uint32Source;
}

/**
 * Makes the values for the current settings.
 */
function generate(settings: Settings, source?: Uint32Source): GenerationResult {
  switch (settings.mode) {
    case "password":
      return generatePasswords(settings.password, settings.count, source);
    case "passphrase":
      return generatePassphrases(settings.passphrase, settings.count, source);
    case "pin":
      return generatePins(settings.pin, settings.count, source);
    case "token":
      return generateTokens(settings.token, settings.count, source);
  }
}

/**
 * Generates random passwords, passphrases, PINs, and tokens with the browser's secure random
 * numbers. Everything happens on this device, and nothing is sent or stored.
 */
export function PasswordGeneratorTool({ source }: PasswordGeneratorToolProps = {}): ReactNode {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Random values are made only in the browser, so the server and the browser cannot disagree.
    // Setting state here once after mounting is the point: it is how the browser's random source
    // reaches the page without a mismatch with the server's output.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(generate(INITIAL_SETTINGS, source));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Applies a change to the settings and makes new values with them straight away.
   */
  function update(change: Partial<Settings>): void {
    const next = { ...settings, ...change };

    setSettings(next);
    setResult(generate(next, source));
    setStatusMessage("");
  }

  /**
   * Makes new values with the same settings.
   */
  function handleGenerateAgain(): void {
    setResult(generate(settings, source));
    setStatusMessage("");
  }

  /**
   * Copies one value, or all of them, and says so.
   */
  async function handleCopy(text: string, what: string): Promise<void> {
    setStatusMessage((await copyToClipboard(text)) ? `${what} copied.` : copyBlockedMessage("text"));
  }

  const { mode, password, passphrase, pin, token } = settings;
  const generated = result?.ok ? result : null;
  const strength = generated ? strengthOf(generated.entropyBits) : null;

  return (
    <ToolWorkspace
      actions={
        <Button onClick={handleGenerateAgain} startIcon={<RefreshIcon />} variant="contained">
          Generate again
        </Button>
      }
      label="Password generator workspace"
      options={
        <ModeToggle
          label="What to generate"
          onChange={(next) => update({ mode: next })}
          options={MODE_OPTIONS}
          value={mode}
        />
      }
    >
      <CalculatorLayout
        inputs={
          <>
            {mode === "password" ? (
              <>
                <LengthSlider
                  id="password-length"
                  label="Length"
                  max={MAX_PASSWORD_LENGTH}
                  min={MIN_PASSWORD_LENGTH}
                  onChange={(length) => update({ password: { ...password, length } })}
                  value={password.length}
                />
                <Stack sx={{ gap: 0.25 }}>
                  <OptionSwitch checked={password.lowercase} label="Lower case letters (a-z)" onChange={(lowercase) => update({ password: { ...password, lowercase } })} />
                  <OptionSwitch checked={password.uppercase} label="Capital letters (A-Z)" onChange={(uppercase) => update({ password: { ...password, uppercase } })} />
                  <OptionSwitch checked={password.digits} label="Numbers (0-9)" onChange={(digits) => update({ password: { ...password, digits } })} />
                  <OptionSwitch checked={password.symbols} label="Symbols (!@#$…)" onChange={(symbols) => update({ password: { ...password, symbols } })} />
                </Stack>
                <OptionSwitch
                  checked={password.requireEachKind}
                  label="Use every chosen kind at least once"
                  onChange={(requireEachKind) => update({ password: { ...password, requireEachKind } })}
                  tooltip="Many sites insist on a capital, a number, and a symbol"
                />
                <OptionSwitch
                  checked={password.excludeAmbiguous}
                  label="Avoid look-alike characters"
                  onChange={(excludeAmbiguous) => update({ password: { ...password, excludeAmbiguous } })}
                  tooltip="Leaves out I, l, 1, |, O, 0, and o, which are easy to mix up"
                />
                <TextField
                  fullWidth
                  helperText={<FieldHint>Optional. Characters that must never appear.</FieldHint>}
                  id="password-exclude"
                  label="Leave out these characters"
                  onChange={(event) => update({ password: { ...password, excludeCharacters: event.target.value } })}
                  slotProps={{ htmlInput: { maxLength: 100, spellCheck: false }, inputLabel: { shrink: true } }}
                  value={password.excludeCharacters}
                />
              </>
            ) : null}

            {mode === "passphrase" ? (
              <>
                <LengthSlider
                  id="passphrase-words"
                  label="Words"
                  max={MAX_PASSPHRASE_WORDS}
                  min={MIN_PASSPHRASE_WORDS}
                  onChange={(words) => update({ passphrase: { ...passphrase, words } })}
                  value={passphrase.words}
                />
                <TextField
                  fullWidth
                  id="passphrase-separator"
                  label="Separator"
                  onChange={(event) => update({ passphrase: { ...passphrase, separator: event.target.value } })}
                  select
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={passphrase.separator}
                >
                  {SEPARATORS.map((separator) => (
                    <MenuItem key={separator.label} value={separator.value}>
                      {separator.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack sx={{ gap: 0.25 }}>
                  <OptionSwitch checked={passphrase.capitalize} label="Capitalise each word" onChange={(capitalize) => update({ passphrase: { ...passphrase, capitalize } })} />
                  <OptionSwitch checked={passphrase.includeNumber} label="Add a number at the end" onChange={(includeNumber) => update({ passphrase: { ...passphrase, includeNumber } })} />
                </Stack>
              </>
            ) : null}

            {mode === "pin" ? (
              <>
                <LengthSlider
                  id="pin-length"
                  label="Digits"
                  max={MAX_PIN_LENGTH}
                  min={MIN_PIN_LENGTH}
                  onChange={(length) => update({ pin: { ...pin, length } })}
                  value={pin.length}
                />
                <OptionSwitch
                  checked={pin.avoidPatterns}
                  label="Avoid easy patterns"
                  onChange={(avoidPatterns) => update({ pin: { ...pin, avoidPatterns } })}
                  tooltip="Refuses PINs such as 1111, 1234, and 9876"
                />
              </>
            ) : null}

            {mode === "token" ? (
              <>
                <ModeToggle
                  fullWidth
                  label="Characters to use"
                  onChange={(alphabet: TokenAlphabet) => update({ token: { ...token, alphabet } })}
                  options={ALPHABET_OPTIONS}
                  value={token.alphabet}
                />
                <LengthSlider
                  id="token-length"
                  label="Length"
                  max={MAX_TOKEN_LENGTH}
                  min={MIN_TOKEN_LENGTH}
                  onChange={(length) => update({ token: { ...token, length } })}
                  value={token.length}
                />
              </>
            ) : null}

            <NumberField
              id="generate-count"
              label="How many"
              max={MAX_GENERATED}
              min={1}
              onChange={(value) => update({ count: value === "" ? 1 : Number(value) })}
              value={String(settings.count)}
            />
          </>
        }
        result={
          <Stack sx={{ gap: 2 }}>
            {result && !result.ok ? <Alert severity="error">{result.message}</Alert> : null}
            {generated && strength ? (
              <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                <Chip color={strength.tone} label={`${strength.label} · about ${generated.entropyBits} bits`} />
                <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                  Each extra bit doubles the number of guesses needed.
                </Typography>
              </Stack>
            ) : null}
            {generated ? (
              <>
                <Stack sx={{ gap: 1.25 }}>
                  {generated.values.map((value, index) => (
                    <CopyableValueRow
                      id={`${mode}-${index + 1}`}
                      key={`${index}-${value}`}
                      onCopy={() => void handleCopy(value, `${NOUN[mode]} ${generated.values.length > 1 ? index + 1 : ""}`.trim())}
                      title={generated.values.length > 1 ? `${NOUN[mode]} ${index + 1}` : NOUN[mode]}
                      value={value}
                    />
                  ))}
                </Stack>
                {generated.values.length > 1 ? (
                  <Button
                    onClick={() => void handleCopy(generated.values.join("\n"), "All values")}
                    startIcon={<ContentCopyIcon />}
                    sx={{ alignSelf: "flex-start" }}
                    variant="outlined"
                  >
                    Copy all
                  </Button>
                ) : null}
              </>
            ) : null}
            {mode === "passphrase" ? (
              <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                Words come from the{" "}
                <Link href="https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases" rel="noopener noreferrer" target="_blank">
                  EFF short word list
                </Link>{" "}
                (CC BY 3.0 US).
              </Typography>
            ) : null}
          </Stack>
        }
      />
      <ToolFooter
        message={
          statusMessage ||
          "Made on this device with your browser's secure random generator. Nothing is sent, saved, or logged."
        }
      />
    </ToolWorkspace>
  );
}

interface LengthSliderProps {
  id: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}

/**
 * A slider that shows its current value in its label, for lengths and counts.
 */
function LengthSlider({ id, label, max, min, onChange, value }: LengthSliderProps): ReactNode {
  return (
    <Stack sx={{ gap: 0.5 }}>
      <Typography id={`${id}-label`} sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
        {label}: {value}
      </Typography>
      <Slider
        aria-labelledby={`${id}-label`}
        max={max}
        min={min}
        onChange={(_event, next) => onChange(Array.isArray(next) ? (next[0] ?? value) : next)}
        value={value}
      />
    </Stack>
  );
}
