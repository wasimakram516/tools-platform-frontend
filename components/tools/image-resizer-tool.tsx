"use client";

import DownloadIcon from "@mui/icons-material/Download";
import FlipIcon from "@mui/icons-material/Flip";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import { Alert, Box, Button, Chip, IconButton, MenuItem, Skeleton, Slider, Stack, TextField, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnchorPicker } from "@/components/tools/anchor-picker";
import { CalculatorLayout } from "@/components/tools/calculator-layout";
import { ChooseFileButton } from "@/components/tools/choose-file-button";
import { CropBox } from "@/components/tools/crop-box";
import { FileDropZone } from "@/components/tools/file-drop-zone";
import { NumberField } from "@/components/tools/form-fields";
import { ModeToggle } from "@/components/tools/mode-toggle";
import { OptionSwitch } from "@/components/tools/option-switch";
import { ResetButton } from "@/components/tools/reset-button";
import { ToolFooter, ToolWorkspace } from "@/components/tools/tool-workspace";
import { BusyOverlay } from "@/components/ui/busy-overlay";
import { FieldHint } from "@/components/ui/field-hint";
import { downloadBlob } from "@/lib/tools/download";
import {
  applyCrop,
  ASPECT_OPTIONS,
  clampCrop,
  cropToRatio,
  fullCrop,
  ratioFor,
  type CropRect,
} from "@/lib/tools/image/crop";
import {
  heightForWidth,
  NO_ROTATION,
  orientedSize,
  planResize,
  rotateBy,
  widthForHeight,
  type CropAnchor,
  type Orientation,
  type ResizeFit,
  type ResizeSpec,
  type Rotation,
} from "@/lib/tools/image/dimensions";
import {
  ACCEPTED_IMAGE_TYPES,
  formatById,
  formatBytes,
  IMAGE_FORMATS,
  outputFileName,
  type ImageFormatId,
} from "@/lib/tools/image/format";
import {
  browserImageProcessor,
  type ImageProcessor,
  type LoadedImage,
  type RenderedImage,
} from "@/lib/tools/image/image-processing";
import { presetById, SIZE_PRESETS } from "@/lib/tools/image/presets";
import { CONTROL_RADIUS, SURFACE_RADIUS } from "@/theme/surface";

const DEBOUNCE_MS = 200;
/** The longest side of the picture the crop box is drawn on. */
const CROP_PICTURE_SIDE = 900;
const DEFAULT_QUALITY = 90;
const SIZE_MODES = [
  { label: "Pixels", tooltip: "Set an exact width and height", value: "pixels" },
  { label: "Percent", tooltip: "Scale by a percentage", value: "percent" },
] as const;
const FIT_OPTIONS = [
  { label: "Fill and crop", tooltip: "Fill the whole size and cut off what does not fit", value: "cover" },
  { label: "Fit inside", tooltip: "Keep the whole image inside the size", value: "contain" },
  { label: "Stretch", tooltip: "Squash or stretch to the exact size", value: "stretch" },
] as const;

type SizeMode = (typeof SIZE_MODES)[number]["value"];

interface ImageResizerToolProps {
  download?: (blob: Blob, fileName: string) => void;
  processor?: ImageProcessor;
}

interface Preview {
  image: RenderedImage;
  /** The settings this preview was made with. It is current only while they match the page's. */
  key: string;
  url: string;
}

/**
 * Resizes, crops, rotates, and flips one image, with a live preview of the result. Sizes can be
 * set in pixels, as a percentage, or from a list of common social and web sizes.
 */
export function ImageResizerTool({
  download = downloadBlob,
  processor = browserImageProcessor,
}: ImageResizerToolProps = {}): ReactNode {
  const [source, setSource] = useState<LoadedImage | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>(NO_ROTATION);
  const [sizeMode, setSizeMode] = useState<SizeMode>("pixels");
  const [presetId, setPresetId] = useState("");
  const [cropOn, setCropOn] = useState(false);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [aspectId, setAspectId] = useState("free");
  const [customSize, setCustomSize] = useState(false);
  const [cropPicture, setCropPicture] = useState<{ key: string; url: string } | null>(null);
  const [widthText, setWidthText] = useState("");
  const [heightText, setHeightText] = useState("");
  const [percentText, setPercentText] = useState("50");
  const [keepProportions, setKeepProportions] = useState(true);
  const [fit, setFit] = useState<ResizeFit>("cover");
  const [anchor, setAnchor] = useState<CropAnchor>("center");
  const [format, setFormat] = useState<ImageFormatId>("jpeg");
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [background, setBackground] = useState("#ffffff");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [renderProblem, setRenderProblem] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const previewUrl = useRef<string | null>(null);
  const cropPictureUrl = useRef<string | null>(null);
  const turned = source ? orientedSize({ height: source.height, width: source.width }, orientation.rotation) : null;

  const spec: ResizeSpec =
    sizeMode === "percent"
      ? { mode: "percent", percent: Number(percentText) }
      : {
          anchor,
          fit: keepProportions ? "stretch" : fit,
          height: heightText === "" ? null : Number(heightText),
          mode: "pixels",
          width: widthText === "" ? null : Number(widthText),
        };
  const activeCrop = turned ? (cropOn && crop ? clampCrop(crop, turned) : fullCrop(turned)) : null;
  const croppedPlan = activeCrop ? planResize({ height: activeCrop.height, width: activeCrop.width }, spec) : null;
  const plan = croppedPlan && activeCrop && !("ok" in croppedPlan) ? applyCrop(croppedPlan, activeCrop) : croppedPlan;
  const aspect = ASPECT_OPTIONS.find((option) => option.id === aspectId) ?? ASPECT_OPTIONS[0];
  const ratio = turned && aspect ? ratioFor(aspect, turned) : null;
  const cropPictureKey = JSON.stringify([source?.url, orientation]);
  const planProblem = plan && "ok" in plan ? plan.message : null;
  const readyPlan = plan && !("ok" in plan) ? plan : null;
  const planKey = readyPlan ? JSON.stringify(readyPlan) : "";
  const renderKey = JSON.stringify([source?.url, planKey, orientation, format, quality, format === "jpeg" ? background : null]);
  const isLoading = Boolean(source && readyPlan && !renderProblem && preview?.key !== renderKey);

  useEffect(() => {
    return () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }

      if (cropPictureUrl.current) {
        URL.revokeObjectURL(cropPictureUrl.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!cropOn || !source || !turned) {
      return undefined;
    }

    let cancelled = false;
    const shown = Math.min(1, CROP_PICTURE_SIDE / Math.max(turned.width, turned.height));
    const output = {
      height: Math.max(1, Math.round(turned.height * shown)),
      width: Math.max(1, Math.round(turned.width * shown)),
    };

    void (async () => {
      const result = await processor.render(source, {
        background: null,
        format: "png",
        orientation,
        plan: { output, source: { height: turned.height, width: turned.width, x: 0, y: 0 } },
        quality: 1,
      });

      if (cancelled || !result.ok) {
        return;
      }

      const url = URL.createObjectURL(result.image.blob);

      if (cropPictureUrl.current) {
        URL.revokeObjectURL(cropPictureUrl.current);
      }

      cropPictureUrl.current = url;
      setCropPicture({ key: cropPictureKey, url });
    })();

    return () => {
      cancelled = true;
    };
    // Only the picture and its turning matter here, so the size is read from them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropOn, source, orientation, processor, cropPictureKey]);

  useEffect(() => {
    if (!source || !readyPlan) {
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        const result = await processor.render(source, {
          background: format === "jpeg" ? background : null,
          format,
          orientation,
          plan: readyPlan,
          quality: quality / 100,
        });

        if (cancelled) {
          return;
        }

        if (!result.ok) {
          setRenderProblem(result.message);
          return;
        }

        const url = URL.createObjectURL(result.image.blob);

        if (previewUrl.current) {
          URL.revokeObjectURL(previewUrl.current);
        }

        previewUrl.current = url;
        setRenderProblem(null);
        setPreview({ image: result.image, key: renderKey, url });
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // The plan is compared by its content, so typing the same size again does not redraw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, planKey, renderKey, orientation, format, quality, background, processor]);

  /**
   * Loads the chosen image and starts with its own size.
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
    setPresetId("");
    setCropOn(false);
    setCrop(null);
    setAspectId("free");
    setCustomSize(false);
    setCropPicture(null);
    setOrientation(NO_ROTATION);
    setWidthText(String(loaded.image.width));
    setHeightText(String(loaded.image.height));
    setKeepProportions(true);
    setSizeMode("pixels");
    setPreview(null);
    setStatusMessage(`${file.name} added.`);
  }

  /**
   * Changes the width, and the height with it when proportions are kept.
   */
  function handleWidthChange(value: string): void {
    setPresetId("");
    setCustomSize(true);
    setWidthText(value);

    if (keepProportions && activeCrop && Number(value) >= 1) {
      setHeightText(String(heightForWidth(activeCrop, Number(value))));
    }
  }

  /**
   * Changes the height, and the width with it when proportions are kept.
   */
  function handleHeightChange(value: string): void {
    setPresetId("");
    setCustomSize(true);
    setHeightText(value);

    if (keepProportions && activeCrop && Number(value) >= 1) {
      setWidthText(String(widthForHeight(activeCrop, Number(value))));
    }
  }

  /**
   * Fills in a common size and switches to filling and cropping so the shape comes out right.
   */
  function handlePreset(id: string): void {
    const preset = presetById(id);

    if (!preset) {
      return;
    }

    setPresetId(id);
    setCustomSize(true);
    setSizeMode("pixels");
    setKeepProportions(false);
    setFit("cover");
    setWidthText(String(preset.width));
    setHeightText(String(preset.height));
  }

  /**
   * Turns the image a quarter turn and swaps the width and height so the size follows it.
   */
  function handleRotate(direction: "clockwise" | "counterclockwise"): void {
    const next: Rotation = rotateBy(orientation.rotation, direction);

    setPresetId("");
    setOrientation((current) => ({ ...current, rotation: next }));
    resetCropFor(source ? orientedSize({ height: source.height, width: source.width }, next) : null, true);
  }

  /**
   * Turns the image over, which also starts the crop again because the picture has moved.
   */
  function handleFlip(axis: "flipHorizontal" | "flipVertical"): void {
    setOrientation((current) => ({ ...current, [axis]: !current[axis] }));
    resetCropFor(turned, false);
  }

  /**
   * Starts the crop again over the whole picture, and follows the new shape in the size fields
   * unless the person has set their own size. A turn swaps the sides of a size they chose.
   */
  function resetCropFor(size: { height: number; width: number } | null, swapsSides: boolean): void {
    setCrop(null);

    if (!size) {
      return;
    }

    if (!customSize) {
      setWidthText(String(size.width));
      setHeightText(String(size.height));
    } else if (swapsSides) {
      setWidthText(heightText);
      setHeightText(widthText);
    }
  }

  /**
   * Takes a new crop. The size fields follow it unless the person chose their own size, and
   * then, with proportions kept, only the height follows so the shape stays right.
   */
  function handleCropChange(next: CropRect): void {
    if (!turned) {
      return;
    }

    const clamped = clampCrop(next, turned);

    setCrop(clamped);

    if (sizeMode !== "pixels") {
      return;
    }

    if (!customSize) {
      setWidthText(String(clamped.width));
      setHeightText(String(clamped.height));
    } else if (keepProportions && Number(widthText) >= 1) {
      setHeightText(String(heightForWidth(clamped, Number(widthText))));
    }
  }

  /**
   * Turns the crop on or off. Turning it off brings back the whole picture.
   */
  function handleCropSwitch(on: boolean): void {
    setCropOn(on);

    if (turned && activeCrop && !on) {
      if (!customSize) {
        setWidthText(String(turned.width));
        setHeightText(String(turned.height));
      } else if (keepProportions && Number(widthText) >= 1) {
        setHeightText(String(heightForWidth(turned, Number(widthText))));
      }
    } else if (on && turned && !crop) {
      setCrop(fullCrop(turned));
    }
  }

  /**
   * Changes the shape of the crop, shrinking the box to fit it.
   */
  function handleAspectChange(id: string): void {
    const option = ASPECT_OPTIONS.find((entry) => entry.id === id);

    setAspectId(id);

    if (option && turned && activeCrop) {
      handleCropChange(cropToRatio(activeCrop, ratioFor(option, turned), turned));
    }
  }

  /**
   * Changes one number of the crop, keeping the shape when a ratio is locked.
   */
  function handleCropField(field: keyof CropRect, value: string): void {
    const number = Number(value);

    if (!activeCrop || value === "" || !Number.isFinite(number)) {
      return;
    }

    const next = { ...activeCrop, [field]: number };

    if (ratio !== null && field === "width") {
      next.height = number / ratio;
    } else if (ratio !== null && field === "height") {
      next.width = number * ratio;
    }

    handleCropChange(next);
  }

  /**
   * Brings back the image's own size and removes any turning or flipping.
   */
  function handleReset(): void {
    if (source) {
      setWidthText(String(source.width));
      setHeightText(String(source.height));
    }

    setPresetId("");
    setCropOn(false);
    setCrop(null);
    setAspectId("free");
    setCustomSize(false);
    setOrientation(NO_ROTATION);
    setSizeMode("pixels");
    setKeepProportions(true);
    setFit("cover");
    setAnchor("center");
    setFormat("jpeg");
    setQuality(DEFAULT_QUALITY);
    setBackground("#ffffff");
    setStatusMessage("");
  }

  const extension = preview ? formatById(preview.image.format).extension : "";
  const downloadName =
    source && preview ? outputFileName(source.file.name, extension, `-${preview.image.width}x${preview.image.height}`) : "";

  return (
    <ToolWorkspace
      label="Image resizer and cropper workspace"
      secondaryActions={source ? <ResetButton onClick={handleReset} /> : null}
    >
      {!source ? (
        <Stack sx={{ gap: 2 }}>
          {problem ? <Alert severity="warning">{problem}</Alert> : null}
          <FileDropZone
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            hint="PNG, JPEG, WebP, GIF, BMP, AVIF, or SVG, up to 50 MB. Nothing is uploaded."
            id="resize-file"
            label="Choose an image"
            onFiles={(files) => void handleFiles(files)}
          />
        </Stack>
      ) : (
        <CalculatorLayout
          inputs={
            <>
              <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                <Tooltip arrow describeChild title="Turn left">
                  <IconButton aria-label="Rotate left" onClick={() => handleRotate("counterclockwise")}>
                    <Rotate90DegreesCcwIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip arrow describeChild title="Turn right">
                  <IconButton aria-label="Rotate right" onClick={() => handleRotate("clockwise")}>
                    <Rotate90DegreesCwIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip arrow describeChild title="Mirror left to right">
                  <IconButton
                    aria-label="Flip horizontally"
                    aria-pressed={orientation.flipHorizontal}
                    color={orientation.flipHorizontal ? "primary" : "default"}
                    onClick={() => handleFlip("flipHorizontal")}
                  >
                    <FlipIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip arrow describeChild title="Mirror top to bottom">
                  <IconButton
                    aria-label="Flip vertically"
                    aria-pressed={orientation.flipVertical}
                    color={orientation.flipVertical ? "primary" : "default"}
                    onClick={() => handleFlip("flipVertical")}
                    sx={{ transform: "rotate(90deg)" }}
                  >
                    <FlipIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <OptionSwitch
                checked={cropOn}
                label="Crop the image"
                onChange={handleCropSwitch}
                tooltip="Choose any part of the picture to keep. Resizing then works from that part."
              />
              {cropOn && activeCrop ? (
                <Stack sx={{ gap: 1.5 }}>
                  <TextField
                    fullWidth
                    id="crop-shape"
                    label="Crop shape"
                    onChange={(event) => handleAspectChange(event.target.value)}
                    select
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={aspectId}
                  >
                    {ASPECT_OPTIONS.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "repeat(2, 1fr)" }}>
                    <NumberField id="crop-x" label="Left (px)" min={0} onChange={(value) => handleCropField("x", value)} value={String(activeCrop.x)} />
                    <NumberField id="crop-y" label="Top (px)" min={0} onChange={(value) => handleCropField("y", value)} value={String(activeCrop.y)} />
                    <NumberField id="crop-width" label="Crop width (px)" min={1} onChange={(value) => handleCropField("width", value)} value={String(activeCrop.width)} />
                    <NumberField id="crop-height" label="Crop height (px)" min={1} onChange={(value) => handleCropField("height", value)} value={String(activeCrop.height)} />
                  </Box>
                  <Button
                    color="inherit"
                    onClick={() => {
                      setAspectId("free");
                      if (turned) {
                        handleCropChange(fullCrop(turned));
                      }
                    }}
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Reset the crop
                  </Button>
                </Stack>
              ) : null}

              <ModeToggle fullWidth label="Resize by" onChange={setSizeMode} options={SIZE_MODES} value={sizeMode} />

              {sizeMode === "pixels" ? (
                <>
                  <TextField
                    fullWidth
                    helperText={<FieldHint>Fills in a size and crops to fit it.</FieldHint>}
                    id="resize-preset"
                    label="Common sizes"
                    onChange={(event) => handlePreset(event.target.value)}
                    select
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={presetId}
                  >
                    {SIZE_PRESETS.map((preset) => (
                      <MenuItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Stack direction="row" sx={{ gap: 1.5 }}>
                    <NumberField id="resize-width" label="Width (px)" max={16384} min={1} onChange={handleWidthChange} value={widthText} />
                    <NumberField id="resize-height" label="Height (px)" max={16384} min={1} onChange={handleHeightChange} value={heightText} />
                  </Stack>
                  <OptionSwitch
                    checked={keepProportions}
                    label="Keep proportions"
                    onChange={(checked) => {
                      setPresetId("");
                      setKeepProportions(checked);
                    }}
                    tooltip="Change the height automatically when the width changes, and the reverse"
                  />
                  {!keepProportions ? (
                    <Stack sx={{ gap: 1.5 }}>
                      <ModeToggle fullWidth label="How to fit" onChange={setFit} options={FIT_OPTIONS} value={fit} />
                      {fit === "cover" ? <AnchorPicker onChange={setAnchor} value={anchor} /> : null}
                    </Stack>
                  ) : null}
                </>
              ) : (
                <NumberField
                  helperText="From 1 to 1000. 50 makes the image half as wide and half as tall."
                  id="resize-percent"
                  label="Scale (%)"
                  max={1000}
                  min={1}
                  onChange={setPercentText}
                  value={percentText}
                />
              )}

              <ModeToggle
                fullWidth
                label="Save as"
                onChange={setFormat}
                options={IMAGE_FORMATS.map((entry) => ({ label: entry.label, value: entry.id }))}
                value={format}
              />
              <Stack sx={{ gap: 0.5 }}>
                <Typography id="resize-quality-label" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                  Quality: {quality}%
                </Typography>
                <Slider
                  aria-labelledby="resize-quality-label"
                  disabled={format === "png"}
                  max={100}
                  min={10}
                  onChange={(_event, value) => setQuality(Array.isArray(value) ? (value[0] ?? quality) : value)}
                  step={5}
                  value={quality}
                />
              </Stack>
              {format === "jpeg" ? (
                <TextField
                  fullWidth
                  helperText={<FieldHint>JPEG cannot be transparent, so empty areas get this colour.</FieldHint>}
                  id="resize-background"
                  label="Fill transparent areas with"
                  onChange={(event) => setBackground(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="color"
                  value={background}
                />
              ) : null}
            </>
          }
          result={
            <Stack sx={{ gap: 2 }}>
              {cropOn && turned && activeCrop ? (
                <Stack sx={{ gap: 1 }}>
                  <Typography component="h2" sx={{ fontSize: "0.92rem", fontWeight: 700 }}>
                    Drag to choose the crop area
                  </Typography>
                  {cropPicture?.key === cropPictureKey ? (
                    <CropBox
                      imageUrl={cropPicture.url}
                      onChange={handleCropChange}
                      ratio={ratio}
                      size={turned}
                      value={activeCrop}
                    />
                  ) : (
                    <Skeleton animation="wave" height={300} sx={{ borderRadius: CONTROL_RADIUS }} variant="rounded" />
                  )}
                </Stack>
              ) : null}
              <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Chip label={`Original ${source.width} × ${source.height} · ${formatBytes(source.file.size)}`} variant="outlined" />
                {cropOn && activeCrop ? <Chip label={`Crop ${activeCrop.width} × ${activeCrop.height}`} variant="outlined" /> : null}
                {isLoading ? (
                  <Skeleton animation="wave" height={32} sx={{ borderRadius: 4 }} width={190} />
                ) : preview ? (
                  <Chip
                    color="primary"
                    label={`New ${preview.image.width} × ${preview.image.height} · ${formatBytes(preview.image.blob.size)}`}
                  />
                ) : null}
              </Stack>
              {planProblem || renderProblem ? <Alert severity="error">{planProblem ?? renderProblem}</Alert> : null}
              {preview?.image.fellBack ? (
                <Alert severity="info">This browser cannot save that format, so the image was saved as PNG.</Alert>
              ) : null}
              <BusyOverlay busy={isLoading} label="Updating the preview">
              <Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "action.hover",
                  backgroundImage:
                    "linear-gradient(45deg, rgba(128,128,128,.18) 25%, transparent 25%, transparent 75%, rgba(128,128,128,.18) 75%), linear-gradient(45deg, rgba(128,128,128,.18) 25%, transparent 25%, transparent 75%, rgba(128,128,128,.18) 75%)",
                  backgroundPosition: "0 0, 8px 8px",
                  backgroundSize: "16px 16px",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: SURFACE_RADIUS,
                  display: "flex",
                  justifyContent: "center",
                  minHeight: 240,
                  overflow: "hidden",
                  p: 1,
                }}
              >
                {preview ? (
                  <Box
                    alt="Preview of the resized image"
                    component="img"
                    src={preview.url}
                    sx={{ display: "block", maxHeight: 460, maxWidth: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <Typography color="text.secondary">Preparing the preview…</Typography>
                )}
              </Box>
              </BusyOverlay>
              <Stack direction="row" sx={{ gap: 1.5 }}>
                <Button
                  disabled={!preview || isLoading}
                  onClick={() => preview && download(preview.image.blob, downloadName)}
                  startIcon={<DownloadIcon />}
                  variant="contained"
                >
                  Download
                </Button>
                <ChooseFileButton accept={ACCEPTED_IMAGE_TYPES.join(",")} label="Choose a different image" onFiles={(files) => void handleFiles(files)} />
              </Stack>
            </Stack>
          }
        />
      )}
      <ToolFooter message={statusMessage || "Choose an image, set a size, and download the result. Images are processed on this device."} />
    </ToolWorkspace>
  );
}
