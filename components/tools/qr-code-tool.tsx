"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { Alert, Box, Button, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { FieldHint } from "@/components/ui/field-hint";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { downloadBlob } from "@/lib/tools/download";
import {
  adviseOnColors,
  createQrCode,
  ERROR_CORRECTION_LEVELS,
  MAX_QUIET_ZONE,
  pngLayout,
  qrToSvg,
  RECOMMENDED_QUIET_ZONE,
  type ErrorCorrection,
  type QrCode,
} from "@/lib/tools/generators/qr";
import {
  contactPayload,
  emailPayload,
  phonePayload,
  smsPayload,
  textPayload,
  urlPayload,
  whatsappPayload,
  wifiPayload,
  type ContactFields,
  type EmailFields,
  type MessageFields,
  type PayloadResult,
  type WifiFields,
} from "@/lib/tools/generators/qr-payloads";
import { renderQrPng, type PngOptions } from "@/lib/tools/generators/qr-render";
import { FONT_MONO } from "@/theme/typography";

type Kind = "url" | "text" | "wifi" | "contact" | "email" | "phone" | "sms" | "whatsapp";

const KINDS: readonly { label: string; value: Kind }[] = [
  { label: "Web address", value: "url" },
  { label: "Text", value: "text" },
  { label: "Wi-Fi network", value: "wifi" },
  { label: "Contact card", value: "contact" },
  { label: "Email", value: "email" },
  { label: "Phone number", value: "phone" },
  { label: "Text message (SMS)", value: "sms" },
  { label: "WhatsApp message", value: "whatsapp" },
];

const SECURITY_OPTIONS = [
  { label: "WPA, WPA2, or WPA3", value: "WPA" },
  { label: "WEP", value: "WEP" },
  { label: "No password", value: "nopass" },
] as const;

const MIN_PNG = 256;
const MAX_PNG = 2048;
const PNG_STEP = 64;
const DEFAULT_PNG = 512;
const DEFAULT_FOREGROUND = "#000000";
const DEFAULT_BACKGROUND = "#ffffff";

interface Fields {
  contact: ContactFields;
  email: EmailFields;
  phone: string;
  sms: MessageFields;
  text: string;
  url: string;
  whatsapp: MessageFields;
  wifi: WifiFields;
}

const INITIAL_FIELDS: Fields = {
  contact: { email: "", firstName: "", lastName: "", organization: "", phone: "", title: "", website: "" },
  email: { body: "", subject: "", to: "" },
  phone: "",
  sms: { message: "", number: "" },
  text: "",
  url: "",
  whatsapp: { message: "", number: "" },
  wifi: { hidden: false, password: "", security: "WPA", ssid: "" },
};

interface QrCodeToolProps {
  /** Saves a file; replaced in tests so nothing is downloaded. */
  download?: (blob: Blob, fileName: string) => void;
  /** Draws the PNG; replaced in tests because jsdom has no canvas. */
  renderPng?: (code: QrCode, options: PngOptions) => Promise<Blob | null>;
}

/**
 * Builds the text a code should hold from what was typed for the chosen kind of code.
 */
function buildPayload(kind: Kind, fields: Fields): PayloadResult {
  switch (kind) {
    case "url":
      return urlPayload(fields.url);
    case "text":
      return textPayload(fields.text);
    case "wifi":
      return wifiPayload(fields.wifi);
    case "contact":
      return contactPayload(fields.contact);
    case "email":
      return emailPayload(fields.email);
    case "phone":
      return phonePayload(fields.phone);
    case "sms":
      return smsPayload(fields.sms);
    case "whatsapp":
      return whatsappPayload(fields.whatsapp);
  }
}

/**
 * Makes QR codes for web addresses, text, Wi-Fi networks, contact cards, email, phone numbers,
 * and messages, live as you type, and downloads them as PNG or SVG. Nothing is uploaded.
 */
export function QrCodeTool({ download = downloadBlob, renderPng = renderQrPng }: QrCodeToolProps = {}): ReactNode {
  const [kind, setKind] = useState<Kind>("url");
  const [fields, setFields] = useState<Fields>(INITIAL_FIELDS);
  const [level, setLevel] = useState<ErrorCorrection>("M");
  const [quietZone, setQuietZone] = useState(RECOMMENDED_QUIET_ZONE);
  const [pngSize, setPngSize] = useState(DEFAULT_PNG);
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [statusMessage, setStatusMessage] = useState("");

  const payload = buildPayload(kind, fields);
  const made = payload.ok ? createQrCode(payload.text, level) : null;
  const code = made?.ok ? made.code : null;
  const svg = code ? qrToSvg(code, { background, foreground, quietZone }) : "";
  const layout = code ? pngLayout(code, quietZone, pngSize) : null;
  const advice = adviseOnColors(foreground, background);
  const levelInfo = ERROR_CORRECTION_LEVELS.find((entry) => entry.value === level);

  /**
   * Changes one kind's fields without touching the others, so switching kinds keeps your typing.
   */
  function setField<K extends keyof Fields>(key: K, value: Fields[K]): void {
    setFields((current) => ({ ...current, [key]: value }));
    setStatusMessage("");
  }

  /**
   * Starts again with empty fields and the default look.
   */
  function handleReset(): void {
    setFields(INITIAL_FIELDS);
    setLevel("M");
    setQuietZone(RECOMMENDED_QUIET_ZONE);
    setPngSize(DEFAULT_PNG);
    setForeground(DEFAULT_FOREGROUND);
    setBackground(DEFAULT_BACKGROUND);
    setStatusMessage("");
  }

  /**
   * Saves the code as an SVG, which stays sharp at any size.
   */
  function handleDownloadSvg(): void {
    download(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
    setStatusMessage("SVG downloaded.");
  }

  /**
   * Saves the code as a PNG at the size chosen, rounded to whole pixels a module.
   */
  async function handleDownloadPng(): Promise<void> {
    const blob = code ? await renderPng(code, { background, foreground, quietZone, requestedPixels: pngSize }) : null;

    if (!blob) {
      setStatusMessage("This browser could not make the PNG. Download the SVG instead.");
      return;
    }

    download(blob, "qr-code.png");
    setStatusMessage("PNG downloaded.");
  }

  /**
   * Copies the text the code holds, which is handy for checking a Wi-Fi or contact code.
   */
  async function handleCopy(): Promise<void> {
    if (payload.ok) {
      setStatusMessage((await copyToClipboard(payload.text)) ? "Contents copied." : copyBlockedMessage("text"));
    }
  }

  return (
    <ToolWorkspace
      label="QR code generator workspace"
      options={
        <TextField
          id="qr-kind"
          label="Make a code for"
          onChange={(event) => setKind(event.target.value as Kind)}
          select
          size="small"
          sx={{ minWidth: 240 }}
          value={kind}
        >
          {KINDS.map((entry) => (
            <MenuItem key={entry.value} value={entry.value}>
              {entry.label}
            </MenuItem>
          ))}
        </TextField>
      }
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            {kind === "url" ? (
              <TextField
                fullWidth
                helperText={<FieldHint>https:// is added for you if you leave it out.</FieldHint>}
                id="qr-url"
                label="Web address"
                onChange={(event) => setField("url", event.target.value)}
                placeholder="example.com"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fields.url}
              />
            ) : null}
            {kind === "text" ? (
              <TextField
                fullWidth
                id="qr-text"
                label="Text"
                minRows={4}
                multiline
                onChange={(event) => setField("text", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                value={fields.text}
              />
            ) : null}
            {kind === "wifi" ? <WifiFieldsForm onChange={(value) => setField("wifi", value)} value={fields.wifi} /> : null}
            {kind === "contact" ? <ContactFieldsForm onChange={(value) => setField("contact", value)} value={fields.contact} /> : null}
            {kind === "email" ? (
              <>
                <Field id="qr-email-to" label="To" onChange={(to) => setField("email", { ...fields.email, to })} value={fields.email.to} />
                <Field id="qr-email-subject" label="Subject" onChange={(subject) => setField("email", { ...fields.email, subject })} value={fields.email.subject} />
                <Field id="qr-email-body" label="Message" multiline onChange={(body) => setField("email", { ...fields.email, body })} value={fields.email.body} />
              </>
            ) : null}
            {kind === "phone" ? (
              <Field id="qr-phone" label="Phone number" onChange={(value) => setField("phone", value)} placeholder="+92 300 1234567" value={fields.phone} />
            ) : null}
            {kind === "sms" ? (
              <>
                <Field id="qr-sms-number" label="Phone number" onChange={(number) => setField("sms", { ...fields.sms, number })} placeholder="+92 300 1234567" value={fields.sms.number} />
                <Field id="qr-sms-message" label="Message (optional)" multiline onChange={(message) => setField("sms", { ...fields.sms, message })} value={fields.sms.message} />
              </>
            ) : null}
            {kind === "whatsapp" ? (
              <>
                <Field
                  hint="With the country code, for example 92 300 1234567."
                  id="qr-whatsapp-number"
                  label="WhatsApp number"
                  onChange={(number) => setField("whatsapp", { ...fields.whatsapp, number })}
                  placeholder="+92 300 1234567"
                  value={fields.whatsapp.number}
                />
                <Field id="qr-whatsapp-message" label="Message (optional)" multiline onChange={(message) => setField("whatsapp", { ...fields.whatsapp, message })} value={fields.whatsapp.message} />
              </>
            ) : null}

            <Stack sx={{ gap: 1 }}>
              <Typography component="h2" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                Error correction
              </Typography>
              <ModeToggle
                fullWidth
                label="Error correction level"
                onChange={setLevel}
                options={ERROR_CORRECTION_LEVELS.map((entry) => ({ label: entry.label, tooltip: entry.description, value: entry.value }))}
                value={level}
              />
              <Typography color="text.secondary" component="div" sx={{ fontSize: "0.8rem" }}>
                <FieldHint>{levelInfo?.description} Higher levels still scan when the code is scratched or partly covered.</FieldHint>
              </Typography>
            </Stack>

            <Stack sx={{ gap: 0.5 }}>
              <Typography id="qr-quiet-label" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                Blank border: {quietZone} modules
              </Typography>
              <Slider
                aria-labelledby="qr-quiet-label"
                max={MAX_QUIET_ZONE}
                min={0}
                onChange={(_event, value) => setQuietZone(Array.isArray(value) ? (value[0] ?? quietZone) : value)}
                value={quietZone}
              />
              <Typography color="text.secondary" component="div" sx={{ fontSize: "0.8rem" }}>
                <FieldHint>{RECOMMENDED_QUIET_ZONE} is the standard. A thinner border can stop some scanners finding the code.</FieldHint>
              </Typography>
            </Stack>

            <Stack direction="row" sx={{ gap: 1.5 }}>
              <TextField
                fullWidth
                id="qr-foreground"
                label="Code colour"
                onChange={(event) => setForeground(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                type="color"
                value={foreground}
              />
              <TextField
                fullWidth
                id="qr-background"
                label="Background"
                onChange={(event) => setBackground(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                type="color"
                value={background}
              />
            </Stack>
            {advice.warning ? <Alert severity="warning">{advice.warning}</Alert> : null}

            <Stack sx={{ gap: 0.5 }}>
              <Typography id="qr-png-label" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                PNG size: about {pngSize} px
              </Typography>
              <Slider
                aria-labelledby="qr-png-label"
                max={MAX_PNG}
                min={MIN_PNG}
                onChange={(_event, value) => setPngSize(Array.isArray(value) ? (value[0] ?? pngSize) : value)}
                step={PNG_STEP}
                value={pngSize}
              />
            </Stack>
          </>
        }
        result={
          <Stack sx={{ gap: 2 }}>
            {!payload.ok ? <Alert severity="info">{payload.message}</Alert> : null}
            {made && !made.ok ? <Alert severity="error">{made.message}</Alert> : null}
            {code && layout ? (
              <>
                <Box
                  sx={{
                    alignItems: "center",
                    bgcolor: background,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2.5,
                    display: "flex",
                    justifyContent: "center",
                    p: 2,
                  }}
                >
                  <Box
                    alt="Your QR code"
                    component="img"
                    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
                    sx={{ display: "block", height: "auto", imageRendering: "pixelated", maxWidth: 360, width: "100%" }}
                  />
                </Box>
                <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                  Version {code.version} · {code.size} × {code.size} modules · PNG {layout.pixels} × {layout.pixels} px
                </Typography>
                <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1.5 }}>
                  <Button onClick={() => void handleDownloadPng()} startIcon={<DownloadIcon />} variant="contained">
                    Download PNG
                  </Button>
                  <Button onClick={handleDownloadSvg} startIcon={<DownloadIcon />} variant="outlined">
                    Download SVG
                  </Button>
                  <Button color="inherit" onClick={() => void handleCopy()} startIcon={<ContentCopyIcon />}>
                    Copy contents
                  </Button>
                </Stack>
                {payload.ok ? (
                  <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, p: 2 }}>
                    <Typography component="h3" sx={{ fontSize: "0.9rem", fontWeight: 700, mb: 0.5 }}>
                      What this code contains
                    </Typography>
                    <Box component="pre" sx={{ fontFamily: FONT_MONO, fontSize: "0.8rem", m: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                      {payload.text}
                    </Box>
                  </Box>
                ) : null}
                <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                  Always scan a code with a phone before printing it. QR Code is a registered trademark of DENSO WAVE INCORPORATED.
                </Typography>
              </>
            ) : null}
          </Stack>
        }
      />
      <ToolFooter
        message={statusMessage || "Fill in the details and the code updates as you type. Nothing is uploaded or saved."}
      />
    </ToolWorkspace>
  );
}

interface FieldProps {
  hint?: string;
  id: string;
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

/**
 * A labelled text field for one detail of a code.
 */
function Field({ hint, id, label, multiline = false, onChange, placeholder, value }: FieldProps): ReactNode {
  return (
    <TextField
      fullWidth
      helperText={hint ? <FieldHint>{hint}</FieldHint> : undefined}
      id={id}
      label={label}
      minRows={multiline ? 3 : undefined}
      multiline={multiline}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{ htmlInput: { maxLength: 500 }, inputLabel: { shrink: true } }}
      value={value}
    />
  );
}

interface FormProps<T> {
  onChange: (value: T) => void;
  value: T;
}

/**
 * The fields for a Wi-Fi code.
 */
function WifiFieldsForm({ onChange, value }: FormProps<WifiFields>): ReactNode {
  return (
    <>
      <Field id="qr-wifi-ssid" label="Network name (SSID)" onChange={(ssid) => onChange({ ...value, ssid })} value={value.ssid} />
      <TextField
        fullWidth
        id="qr-wifi-security"
        label="Security"
        onChange={(event) => onChange({ ...value, security: event.target.value as WifiFields["security"] })}
        select
        slotProps={{ inputLabel: { shrink: true } }}
        value={value.security}
      >
        {SECURITY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {value.security !== "nopass" ? (
        <Field
          hint="Shown here so you can check it. It stays on this device."
          id="qr-wifi-password"
          label="Password"
          onChange={(password) => onChange({ ...value, password })}
          value={value.password}
        />
      ) : null}
      <OptionSwitch checked={value.hidden} label="Hidden network" onChange={(hidden) => onChange({ ...value, hidden })} />
    </>
  );
}

/**
 * The fields for a contact card.
 */
function ContactFieldsForm({ onChange, value }: FormProps<ContactFields>): ReactNode {
  const set = (key: keyof ContactFields) => (next: string) => onChange({ ...value, [key]: next });

  return (
    <>
      <Stack direction="row" sx={{ gap: 1.5 }}>
        <Field id="qr-contact-first" label="First name" onChange={set("firstName")} value={value.firstName} />
        <Field id="qr-contact-last" label="Last name" onChange={set("lastName")} value={value.lastName} />
      </Stack>
      <Field id="qr-contact-org" label="Organisation" onChange={set("organization")} value={value.organization} />
      <Field id="qr-contact-title" label="Job title" onChange={set("title")} value={value.title} />
      <Field id="qr-contact-phone" label="Phone" onChange={set("phone")} value={value.phone} />
      <Field id="qr-contact-email" label="Email" onChange={set("email")} value={value.email} />
      <Field id="qr-contact-website" label="Website" onChange={set("website")} value={value.website} />
    </>
  );
}
