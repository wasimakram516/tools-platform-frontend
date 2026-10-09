"use client";

import DownloadIcon from "@mui/icons-material/Download";
import { Alert, Box, Button, CircularProgress, Slider, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { FileDropZone } from "@/components/tools/file-drop-zone";
import { NumberField } from "@/components/tools/form-fields";
import { ImageResultCard } from "@/components/tools/image-result-card";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { FieldHint } from "@/components/ui/field-hint";
import { downloadBlob } from "@/lib/tools/download";
import {
  resizeForMaxWidth,
  resolveFormat,
  shouldKeepOriginal,
  type FormatSetting,
} from "@/lib/tools/image/compress-plan";
import { NO_ROTATION, planResize } from "@/lib/tools/image/dimensions";
import {
  ACCEPTED_IMAGE_TYPES,
  formatBytes,
  formatById,
  MAX_BATCH_FILES,
  outputFileName,
  percentSaved,
  type ImageFormatId,
  uniqueFileNames,
} from "@/lib/tools/image/format";
import { browserImageProcessor, type ImageProcessor, type LoadedImage } from "@/lib/tools/image/image-processing";
import { createZip } from "@/lib/tools/image/zip";

const DEBOUNCE_MS = 250;
const DEFAULT_QUALITY = 80;
const FORMAT_OPTIONS = [
  { label: "Keep format", tooltip: "Save each image in its own format", value: "keep" },
  { label: "JPEG", tooltip: "Small photos, no transparency", value: "jpeg" },
  { label: "PNG", tooltip: "Lossless, keeps transparency", value: "png" },
  { label: "WebP", tooltip: "Small files, keeps transparency", value: "webp" },
] as const;

interface Source {
  id: string;
  loaded: LoadedImage;
}

interface Outcome {
  blob?: Blob;
  /** The settings this result was made with. It is current only while they match the page's. */
  key?: string;
  format?: ImageFormatId;
  height?: number;
  name?: string;
  note?: string;
  problem?: string;
  size?: number;
  url?: string;
  width?: number;
}

interface ImageCompressorToolProps {
  /** Saves a file; replaced in tests so nothing is downloaded. */
  download?: (blob: Blob, fileName: string) => void;
  /** Reads and writes images; replaced in tests because jsdom has no canvas. */
  processor?: ImageProcessor;
}

let nextId = 0;

/**
 * Compresses and converts several images at once between JPEG, PNG, and WebP. It shows the size
 * before and after for each file, can limit the width, and downloads one file or a zip.
 */
export function ImageCompressorTool({
  download = downloadBlob,
  processor = browserImageProcessor,
}: ImageCompressorToolProps = {}): ReactNode {
  const [sources, setSources] = useState<Source[]>([]);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [rejected, setRejected] = useState<string[]>([]);
  const [format, setFormat] = useState<FormatSetting>("webp");
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [maxWidth, setMaxWidth] = useState("");
  const [keepSmaller, setKeepSmaller] = useState(true);
  const [background, setBackground] = useState("#ffffff");
  const [statusMessage, setStatusMessage] = useState("");
  const urls = useRef(new Set<string>());
  const widthLimit = maxWidth === "" ? null : Number(maxWidth);
  const settingsKey = JSON.stringify([format, quality, widthLimit, keepSmaller, background]);

  useEffect(() => {
    const created = urls.current;

    return () => {
      created.forEach((url) => URL.revokeObjectURL(url));
      created.clear();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    /**
     * Makes every image again with the current settings, one after another.
     */
    async function run(): Promise<void> {
      for (const source of sources) {
        if (cancelled) {
          return;
        }

        const { file, height, width } = source.loaded;
        const resolved = resolveFormat(file.type, format);
        const plan = planResize({ height, width }, resizeForMaxWidth({ height, width }, widthLimit));

        if ("ok" in plan) {
          setOutcomes((current) => ({ ...current, [source.id]: { key: settingsKey, problem: plan.message } }));
          continue;
        }

        const result = await processor.render(source.loaded, {
          background: resolved.format === "jpeg" ? background : null,
          format: resolved.format,
          orientation: NO_ROTATION,
          plan,
          quality: quality / 100,
        });

        if (cancelled) {
          return;
        }

        if (!result.ok) {
          setOutcomes((current) => ({ ...current, [source.id]: { key: settingsKey, problem: result.message } }));
          continue;
        }

        const rendered = result.image;
        const ownFormat = resolveFormat(file.type, "keep");
        const keepOriginal = shouldKeepOriginal({
          keepSmaller,
          newBytes: rendered.blob.size,
          originalBytes: file.size,
          sameFormat: !ownFormat.usedFallback && ownFormat.format === rendered.format && widthLimit === null,
        });
        const finalBlob = keepOriginal ? file : rendered.blob;
        const finalFormat = keepOriginal ? ownFormat.format : rendered.format;
        const extension = keepOriginal ? null : formatById(finalFormat).extension;
        const sameExtension = file.name.toLowerCase().endsWith(`.${extension}`);
        const url = URL.createObjectURL(finalBlob);
        const notes = [
          keepOriginal ? "Kept the original because re-saving did not make it smaller." : "",
          resolved.usedFallback ? "This type cannot be saved as itself, so it was saved as PNG." : "",
          rendered.fellBack && !resolved.usedFallback
            ? `This browser cannot save ${formatById(format === "keep" ? resolved.format : format).label}, so it was saved as PNG.`
            : "",
        ].filter(Boolean);

        urls.current.add(url);
        setOutcomes((current) => {
          const previous = current[source.id]?.url;

          if (previous) {
            URL.revokeObjectURL(previous);
            urls.current.delete(previous);
          }

          return {
            ...current,
            [source.id]: {
              blob: finalBlob,
              format: finalFormat,
              height: rendered.height,
              key: settingsKey,
              name: extension ? outputFileName(file.name, extension, sameExtension ? "-compressed" : "") : file.name,
              note: notes.join(" "),
              size: finalBlob.size,
              url,
              width: rendered.width,
            },
          };
        });
      }
    }

    const timer = window.setTimeout(() => void run(), DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [sources, format, quality, widthLimit, keepSmaller, background, processor, settingsKey]);

  /**
   * Reads the chosen files, keeps the ones that load, and lists the ones that do not.
   */
  async function handleFiles(files: File[]): Promise<void> {
    const room = MAX_BATCH_FILES - sources.length;
    const added: Source[] = [];
    const problems: string[] = files.length > room ? [`Only ${MAX_BATCH_FILES} images can be added at a time.`] : [];

    for (const file of files.slice(0, Math.max(room, 0))) {
      const loaded = await processor.load(file);

      if (loaded.ok) {
        added.push({ id: `image-${(nextId += 1)}`, loaded: loaded.image });
      } else {
        problems.push(loaded.message);
      }
    }

    setSources((current) => [...current, ...added]);
    setRejected(problems);
    setStatusMessage(added.length > 0 ? `${added.length} ${added.length === 1 ? "image" : "images"} added.` : "");
  }

  /**
   * Removes one image and frees what it was using.
   */
  function handleRemove(id: string): void {
    const source = sources.find((entry) => entry.id === id);
    const url = outcomes[id]?.url;

    if (source) {
      processor.release(source.loaded);
    }

    if (url) {
      URL.revokeObjectURL(url);
      urls.current.delete(url);
    }

    setSources((current) => current.filter((entry) => entry.id !== id));
    setOutcomes((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
  }

  /**
   * Removes every image and puts the settings back to how they started.
   */
  function handleReset(): void {
    sources.forEach((source) => processor.release(source.loaded));
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current.clear();
    setSources([]);
    setOutcomes({});
    setRejected([]);
    setFormat("webp");
    setQuality(DEFAULT_QUALITY);
    setMaxWidth("");
    setKeepSmaller(true);
    setBackground("#ffffff");
    setStatusMessage("");
  }

  const isCurrent = (id: string): boolean => outcomes[id]?.key === settingsKey;
  const settled = sources.filter((source) => isCurrent(source.id));
  const finished = settled.filter((source) => outcomes[source.id]?.blob);
  const totalBefore = finished.reduce((sum, source) => sum + source.loaded.file.size, 0);
  const totalAfter = finished.reduce((sum, source) => sum + (outcomes[source.id]?.size ?? 0), 0);

  /**
   * Downloads every finished image in one zip file, with unique names.
   */
  async function handleDownloadAll(): Promise<void> {
    const names = uniqueFileNames(finished.map((source) => outcomes[source.id]?.name ?? "image"));
    const entries = await Promise.all(
      finished.map(async (source, index) => ({
        data: new Uint8Array((await outcomes[source.id]?.blob?.arrayBuffer()) ?? new ArrayBuffer(0)),
        name: names[index] ?? "image",
      })),
    );
    const zip = createZip(entries);

    if (!zip) {
      setStatusMessage("These images are too large for one zip. Download them one at a time.");
      return;
    }

    download(new Blob([zip.buffer as ArrayBuffer], { type: "application/zip" }), "images.zip");
    setStatusMessage("Zip downloaded.");
  }

  return (
    <ToolWorkspace
      label="Image compressor and converter workspace"
      secondaryActions={<ResetButton onClick={handleReset} />}
    >
      <CalculatorLayout
        inputs={
          <>
            <Stack sx={{ gap: 1 }}>
              <Typography component="h2" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                Save as
              </Typography>
              <ModeToggle
                fullWidth
                label="Output format"
                onChange={setFormat}
                options={FORMAT_OPTIONS}
                value={format}
              />
            </Stack>
            <Stack sx={{ gap: 0.5 }}>
              <Typography id="quality-label" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                Quality: {quality}%
              </Typography>
              <Slider
                aria-labelledby="quality-label"
                disabled={format === "png"}
                max={100}
                min={10}
                onChange={(_event, value) => setQuality(Array.isArray(value) ? (value[0] ?? quality) : value)}
                step={5}
                value={quality}
              />
              <Typography color="text.secondary" component="div" sx={{ fontSize: "0.8rem" }}>
                <FieldHint>
                  {format === "png"
                    ? "PNG is lossless, so quality does not apply. Choose WebP or JPEG for smaller files."
                    : "Lower quality gives smaller files. Around 80 looks the same to most eyes."}
                </FieldHint>
              </Typography>
            </Stack>
            <NumberField
              helperText="Optional. Wider images are scaled down. Narrower ones are left alone."
              id="image-max-width"
              label="Maximum width (px)"
              max={16384}
              min={1}
              onChange={setMaxWidth}
              value={maxWidth}
            />
            <TextField
              fullWidth
              helperText={<FieldHint>Used for JPEG, which cannot be transparent.</FieldHint>}
              id="image-background"
              label="Fill transparent areas with"
              onChange={(event) => setBackground(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              type="color"
              value={background}
            />
            <OptionSwitch
              checked={keepSmaller}
              label="Keep the original if the new file is not smaller"
              onChange={setKeepSmaller}
              tooltip="Avoids making a file bigger when you keep the same format"
            />
          </>
        }
        result={
          <Stack sx={{ gap: 2 }}>
            <FileDropZone
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              hint={`PNG, JPEG, WebP, GIF, BMP, AVIF, or SVG. Up to ${MAX_BATCH_FILES} images of 50 MB. Nothing is uploaded.`}
              id="image-files"
              label="Choose images"
              multiple
              onFiles={(files) => void handleFiles(files)}
            />
            {rejected.length > 0 ? (
              <Alert severity="warning">
                {rejected.map((message) => (
                  <div key={message}>{message}</div>
                ))}
              </Alert>
            ) : null}
            {sources.length > 0 ? (
              <>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between" }}
                >
                  <Typography aria-live="polite" role="status" sx={{ fontWeight: 600 }}>
                    {settled.length === sources.length ? (
                      finished.length === 0
                        ? "These images could not be processed."
                        : `${finished.length} ${finished.length === 1 ? "image" : "images"}: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} (${percentSaved(totalBefore, totalAfter)}% smaller)`
                    ) : (
                      <Stack component="span" direction="row" sx={{ alignItems: "center", gap: 1 }}>
                        <CircularProgress aria-label="Updating images" size={16} />
                        Updating images…
                      </Stack>
                    )}
                  </Typography>
                  {finished.length > 1 ? (
                    <Button onClick={() => void handleDownloadAll()} startIcon={<DownloadIcon />} variant="contained">
                      Download all (.zip)
                    </Button>
                  ) : null}
                </Stack>
                <Box sx={{ display: "grid", gap: 1.25 }}>
                  {sources.map((source) => {
                    const outcome = outcomes[source.id];

                    return (
                      <ImageResultCard
                        key={source.id}
                        loading={!isCurrent(source.id)}
                        newBytes={outcome?.size ?? null}
                        note={outcome?.note}
                        onDownload={() => outcome?.blob && outcome.name && download(outcome.blob, outcome.name)}
                        onRemove={() => handleRemove(source.id)}
                        originalBytes={source.loaded.file.size}
                        originalName={source.loaded.file.name}
                        problem={outcome?.problem}
                        result={
                          outcome?.blob && outcome.name
                            ? { height: outcome.height ?? 0, name: outcome.name, width: outcome.width ?? 0 }
                            : undefined
                        }
                        thumbnailUrl={outcome?.url}
                      />
                    );
                  })}
                </Box>
              </>
            ) : null}
          </Stack>
        }
      />
      <ToolFooter
        message={
          statusMessage ||
          "Add images, choose a format and quality, and download the results. Images are processed on this device."
        }
      />
    </ToolWorkspace>
  );
}
