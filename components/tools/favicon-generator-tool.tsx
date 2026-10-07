"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { Alert, Box, Button, Skeleton, Slider, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnchorPicker } from "@/components/tools/anchor-picker";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { ChooseFileButton } from "@/components/tools/choose-file-button";
import { FileDropZone } from "@/components/tools/file-drop-zone";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { FieldHint } from "@/components/ui/field-hint";
import { copyBlockedMessage, copyToClipboard } from "@/lib/tools/clipboard";
import { downloadBlob } from "@/lib/tools/download";
import type { CropAnchor } from "@/lib/tools/image/dimensions";
import {
  buildHtmlSnippet,
  buildManifest,
  FAVICON_FILES,
  ICO_FILE_NAME,
  ICO_SIZES,
  MANIFEST_FILE_NAME,
  MAX_SITE_NAME_CHARACTERS,
} from "@/lib/tools/image/favicon-files";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/tools/image/format";
import { createIco } from "@/lib/tools/image/ico";
import { browserImageProcessor, type ImageProcessor, type LoadedImage } from "@/lib/tools/image/image-processing";
import { createZip } from "@/lib/tools/image/zip";
import { FONT_MONO } from "@/theme/typography";
import { CONTROL_RADIUS, SURFACE_RADIUS } from "@/theme/surface";

const DEBOUNCE_MS = 250;
const DEFAULT_PADDING = 8;
const FIT_OPTIONS = [
  { label: "Fit whole picture", tooltip: "Keep the whole picture inside the square", value: "contain" },
  { label: "Crop to square", tooltip: "Fill the square and cut off what does not fit", value: "cover" },
] as const;
const BACKGROUND_OPTIONS = [
  { label: "Transparent", tooltip: "Leave the area around the picture empty", value: "transparent" },
  { label: "Colour", tooltip: "Fill the area around the picture", value: "color" },
] as const;

type BackgroundMode = (typeof BACKGROUND_OPTIONS)[number]["value"];

interface FaviconGeneratorToolProps {
  download?: (blob: Blob, fileName: string) => void;
  processor?: ImageProcessor;
}

interface MadeIcon {
  blob: Blob;
  url: string;
}

/**
 * Makes a complete favicon set from one image: every PNG size browsers and phones ask for, a
 * real favicon.ico, a web manifest, and the tags to paste into a page, ready as one zip.
 */
export function FaviconGeneratorTool({
  download = downloadBlob,
  processor = browserImageProcessor,
}: FaviconGeneratorToolProps = {}): ReactNode {
  const [source, setSource] = useState<LoadedImage | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [anchor, setAnchor] = useState<CropAnchor>("center");
  const [padding, setPadding] = useState(DEFAULT_PADDING);
  const [corners, setCorners] = useState(0);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("transparent");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [siteName, setSiteName] = useState("");
  const [themeColor, setThemeColor] = useState("#ffffff");
  const [icons, setIcons] = useState<Record<number, MadeIcon>>({});
  const [iconsKey, setIconsKey] = useState("");
  const [renderProblem, setRenderProblem] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const urls = useRef(new Set<string>());
  const snippet = buildHtmlSnippet();
  const settingsKey = JSON.stringify([source?.url, fit, anchor, padding, corners, backgroundMode, backgroundColor]);
  const isLoading = Boolean(source && !renderProblem && iconsKey !== settingsKey);

  useEffect(() => {
    const created = urls.current;

    return () => {
      created.forEach((url) => URL.revokeObjectURL(url));
      created.clear();
    };
  }, []);

  useEffect(() => {
    if (!source) {
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        const made: Record<number, MadeIcon> = {};

        for (const file of FAVICON_FILES) {
          const result = await processor.renderIcon(source, {
            anchor,
            background: backgroundMode === "color" ? backgroundColor : null,
            cornerRadiusPercent: corners,
            fit,
            paddingPercent: padding,
            size: file.size,
          });

          if (cancelled) {
            return;
          }

          if (!result.ok) {
            setRenderProblem(result.message);
            return;
          }

          const url = URL.createObjectURL(result.image.blob);

          urls.current.add(url);
          made[file.size] = { blob: result.image.blob, url };
        }

        setRenderProblem(null);
        setIconsKey(settingsKey);
        setIcons((current) => {
          Object.values(current).forEach((old) => {
            URL.revokeObjectURL(old.url);
            urls.current.delete(old.url);
          });

          return made;
        });
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [source, fit, anchor, padding, corners, backgroundMode, backgroundColor, processor, settingsKey]);

  /**
   * Loads the chosen image.
   */
  async function handleFiles(files: File[]): Promise<void> {
    const file = files[0];

    if (!file) {
      return;
    }

    const loaded = await processor.load(file);

    if (!loaded.ok) {
      setProblem(loaded.message);
      return;
    }

    if (source) {
      processor.release(source);
    }

    setProblem(null);
    setSource(loaded.image);
    setIcons({});
    setStatusMessage(`${file.name} added.`);
  }

  /**
   * Brings every setting back to how it started.
   */
  function handleReset(): void {
    setFit("contain");
    setAnchor("center");
    setPadding(DEFAULT_PADDING);
    setCorners(0);
    setBackgroundMode("transparent");
    setBackgroundColor("#ffffff");
    setSiteName("");
    setThemeColor("#ffffff");
    setStatusMessage("");
  }

  /**
   * Reads a finished PNG's bytes.
   */
  async function bytesOf(size: number): Promise<Uint8Array> {
    return new Uint8Array((await icons[size]?.blob.arrayBuffer()) ?? new ArrayBuffer(0));
  }

  /**
   * Builds favicon.ico from the 16, 32, and 48 pixel icons.
   */
  async function buildIco(): Promise<Uint8Array<ArrayBuffer> | null> {
    const images = await Promise.all(ICO_SIZES.map(async (size) => ({ png: await bytesOf(size), size })));

    return createIco(images) as Uint8Array<ArrayBuffer> | null;
  }

  /**
   * Downloads favicon.ico.
   */
  async function handleDownloadIco(): Promise<void> {
    const ico = await buildIco();

    if (ico) {
      download(new Blob([ico], { type: "image/x-icon" }), ICO_FILE_NAME);
      setStatusMessage("favicon.ico downloaded.");
    }
  }

  /**
   * Downloads every icon, favicon.ico, and the manifest as one zip.
   */
  async function handleDownloadAll(): Promise<void> {
    const ico = await buildIco();
    const encoder = new TextEncoder();
    const entries = [
      ...(await Promise.all(FAVICON_FILES.map(async (file) => ({ data: await bytesOf(file.size), name: file.fileName })))),
      ...(ico ? [{ data: ico, name: ICO_FILE_NAME }] : []),
      { data: encoder.encode(buildManifest(siteName, themeColor, backgroundMode === "color" ? backgroundColor : "#ffffff")), name: MANIFEST_FILE_NAME },
    ];
    const zip = createZip(entries);

    if (zip) {
      download(new Blob([zip.buffer as ArrayBuffer], { type: "application/zip" }), "favicons.zip");
      setStatusMessage("favicons.zip downloaded. Put its files in your site's root folder.");
    }
  }

  /**
   * Copies the tags for the page head.
   */
  async function handleCopySnippet(): Promise<void> {
    setStatusMessage((await copyToClipboard(snippet)) ? "Tags copied." : copyBlockedMessage("tags", true));
  }

  const ready = !isLoading && FAVICON_FILES.every((file) => icons[file.size]);

  return (
    <ToolWorkspace
      label="Favicon generator workspace"
      secondaryActions={source ? <ResetButton onClick={handleReset} /> : null}
    >
      {!source ? (
        <Stack sx={{ gap: 2 }}>
          {problem ? <Alert severity="warning">{problem}</Alert> : null}
          <FileDropZone
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            hint="Use a square logo if you can, at least 512 × 512. PNG, JPEG, WebP, or SVG. Nothing is uploaded."
            id="favicon-file"
            label="Choose an image"
            onFiles={(files) => void handleFiles(files)}
          />
        </Stack>
      ) : (
        <CalculatorLayout
          inputs={
            <>
              <ModeToggle fullWidth label="How to fit the picture" onChange={setFit} options={FIT_OPTIONS} value={fit} />
              {fit === "cover" ? <AnchorPicker onChange={setAnchor} value={anchor} /> : null}
              <Stack sx={{ gap: 0.5 }}>
                <Typography id="favicon-padding-label" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                  Space around the picture: {padding}%
                </Typography>
                <Slider
                  aria-labelledby="favicon-padding-label"
                  max={30}
                  min={0}
                  onChange={(_event, value) => setPadding(Array.isArray(value) ? (value[0] ?? padding) : value)}
                  value={padding}
                />
              </Stack>
              <Stack sx={{ gap: 0.5 }}>
                <Typography id="favicon-corners-label" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                  Corners: {corners === 0 ? "square" : corners === 50 ? "circle" : `${corners}% rounded`}
                </Typography>
                <Slider
                  aria-labelledby="favicon-corners-label"
                  max={50}
                  min={0}
                  onChange={(_event, value) => setCorners(Array.isArray(value) ? (value[0] ?? corners) : value)}
                  value={corners}
                />
              </Stack>
              <ModeToggle
                fullWidth
                label="Background"
                onChange={setBackgroundMode}
                options={BACKGROUND_OPTIONS}
                value={backgroundMode}
              />
              {backgroundMode === "color" ? (
                <TextField
                  fullWidth
                  id="favicon-background"
                  label="Background colour"
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="color"
                  value={backgroundColor}
                />
              ) : null}
              <TextField
                fullWidth
                helperText={<FieldHint>Optional. Goes into the web manifest.</FieldHint>}
                id="favicon-site-name"
                label="Site name"
                onChange={(event) => setSiteName(event.target.value)}
                slotProps={{ htmlInput: { maxLength: MAX_SITE_NAME_CHARACTERS }, inputLabel: { shrink: true } }}
                value={siteName}
              />
              <TextField
                fullWidth
                helperText={<FieldHint>The browser bar colour on Android. Goes into the manifest.</FieldHint>}
                id="favicon-theme-color"
                label="Theme colour"
                onChange={(event) => setThemeColor(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                type="color"
                value={themeColor}
              />
            </>
          }
          result={
            <Stack sx={{ gap: 2 }}>
              {renderProblem ? <Alert severity="error">{renderProblem}</Alert> : null}
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
                {FAVICON_FILES.map((file) => {
                  const made = icons[file.size];

                  return (
                    <Box key={file.fileName} sx={{ border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, p: 1.5 }}>
                      <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            alignItems: "center",
                            backgroundColor: "action.hover",
                            backgroundImage:
                              "linear-gradient(45deg, rgba(128,128,128,.18) 25%, transparent 25%, transparent 75%, rgba(128,128,128,.18) 75%), linear-gradient(45deg, rgba(128,128,128,.18) 25%, transparent 25%, transparent 75%, rgba(128,128,128,.18) 75%)",
                            backgroundPosition: "0 0, 6px 6px",
                            backgroundSize: "12px 12px",
                            borderRadius: CONTROL_RADIUS,
                            display: "flex",
                            flexShrink: 0,
                            height: 84,
                            justifyContent: "center",
                            width: 84,
                          }}
                        >
                          {made && !isLoading ? (
                            <Box
                              alt={`${file.size} by ${file.size} icon preview`}
                              component="img"
                              src={made.url}
                              sx={{ height: Math.min(file.size, 72), imageRendering: file.size < 48 ? "pixelated" : "auto", width: Math.min(file.size, 72) }}
                            />
                          ) : (
                            <Skeleton animation="wave" height={72} variant="rounded" width={72} />
                          )}
                        </Box>
                        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700 }}>
                            {file.size} × {file.size}
                          </Typography>
                          <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {file.description}
                          </Typography>
                          <Button
                            disabled={!made || isLoading}
                            onClick={() => made && download(made.blob, file.fileName)}
                            size="small"
                            startIcon={<DownloadIcon />}
                            sx={{ alignSelf: "flex-start", mt: 0.5 }}
                          >
                            {file.fileName}
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
              <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1.5 }}>
                <Button disabled={!ready} onClick={() => void handleDownloadAll()} startIcon={<DownloadIcon />} variant="contained">
                  Download all (.zip)
                </Button>
                <Button disabled={!ready} onClick={() => void handleDownloadIco()} startIcon={<DownloadIcon />} variant="outlined">
                  Download favicon.ico
                </Button>
                <ChooseFileButton
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  label="Choose a different image"
                  onFiles={(files) => void handleFiles(files)}
                />
              </Stack>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: SURFACE_RADIUS, p: 2 }}>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography component="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    Add these tags to your page&apos;s head
                  </Typography>
                  <Button onClick={() => void handleCopySnippet()} size="small" startIcon={<ContentCopyIcon />}>
                    Copy tags
                  </Button>
                </Stack>
                <Box
                  component="pre"
                  sx={{ fontFamily: FONT_MONO, fontSize: "0.8rem", m: 0, overflowX: "auto", whiteSpace: "pre" }}
                >
                  {snippet}
                </Box>
                <Typography color="text.secondary" sx={{ fontSize: "0.8rem", mt: 1 }}>
                  Put the downloaded files in your site&apos;s root folder, so /favicon.ico loads from your domain.
                </Typography>
              </Box>
            </Stack>
          }
        />
      )}
      <ToolFooter
        message={statusMessage || "Choose an image, adjust it, and download the set. Images are processed on this device."}
      />
    </ToolWorkspace>
  );
}
