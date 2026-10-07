"use client";

import { Box } from "@mui/material";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useRef } from "react";
import { clampCrop, dragCrop, type CropHandle, type CropRect } from "@/lib/tools/image/crop";
import type { Size } from "@/lib/tools/image/dimensions";

const HANDLE_SIZE = 14;
const NUDGE = 1;
const BIG_NUDGE = 10;

/** Where each handle sits on the box, as a share of its width and height. */
const HANDLES: readonly { handle: CropHandle; label: string; left: string; top: string; cursor: string }[] = [
  { cursor: "nwse-resize", handle: "nw", label: "top left", left: "0%", top: "0%" },
  { cursor: "ns-resize", handle: "n", label: "top", left: "50%", top: "0%" },
  { cursor: "nesw-resize", handle: "ne", label: "top right", left: "100%", top: "0%" },
  { cursor: "ew-resize", handle: "e", label: "right", left: "100%", top: "50%" },
  { cursor: "nwse-resize", handle: "se", label: "bottom right", left: "100%", top: "100%" },
  { cursor: "ns-resize", handle: "s", label: "bottom", left: "50%", top: "100%" },
  { cursor: "nesw-resize", handle: "sw", label: "bottom left", left: "0%", top: "100%" },
  { cursor: "ew-resize", handle: "w", label: "left", left: "0%", top: "50%" },
];

interface CropBoxProps {
  /** The picture to crop, already turned the way it will be saved. */
  imageUrl: string | null;
  onChange: (crop: CropRect) => void;
  /** Width divided by height to keep, or null for a free crop. */
  ratio: number | null;
  /** The size of the picture, in pixels, that the crop is measured in. */
  size: Size;
  value: CropRect;
}

interface DragState {
  handle: CropHandle;
  startCrop: CropRect;
  startX: number;
  startY: number;
}

/**
 * A picture with a crop rectangle on it. Drag inside to move it, drag a corner or edge to resize
 * it, or focus it and use the arrow keys (Shift for bigger steps). The rectangle is measured in
 * the picture's own pixels, whatever size it is shown at.
 */
export function CropBox({ imageUrl, onChange, ratio, size, value }: CropBoxProps): ReactNode {
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  /**
   * Starts a drag and keeps receiving the pointer even when it leaves the handle.
   */
  function handlePointerDown(event: PointerEvent<HTMLElement>, handle: CropHandle): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { handle, startCrop: value, startX: event.clientX, startY: event.clientY };
  }

  /**
   * Turns the pointer's movement on screen into pixels of the picture and applies it.
   */
  function handlePointerMove(event: PointerEvent<HTMLElement>): void {
    const state = drag.current;
    const frame = frameRef.current?.getBoundingClientRect();

    if (!state || !frame || frame.width === 0 || frame.height === 0) {
      return;
    }

    const deltaX = ((event.clientX - state.startX) / frame.width) * size.width;
    const deltaY = ((event.clientY - state.startY) / frame.height) * size.height;

    onChange(dragCrop(state.startCrop, state.handle, deltaX, deltaY, size, ratio));
  }

  /**
   * Ends the drag.
   */
  function handlePointerUp(): void {
    drag.current = null;
  }

  /**
   * Moves the whole box with the arrow keys.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    const step = event.shiftKey ? BIG_NUDGE : NUDGE;
    const moves: Record<string, [number, number]> = {
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
    };
    const move = moves[event.key];

    if (move) {
      event.preventDefault();
      onChange(clampCrop({ ...value, x: value.x + move[0], y: value.y + move[1] }, size));
    }
  }

  const percent = (part: number, whole: number): string => `${(part / whole) * 100}%`;
  const isLocked = ratio !== null;

  return (
    <Box
      ref={frameRef}
      sx={{
        aspectRatio: `${size.width} / ${size.height}`,
        backgroundColor: "action.hover",
        borderRadius: 1.5,
        lineHeight: 0,
        margin: "0 auto",
        maxHeight: 420,
        maxWidth: "100%",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        width: `min(100%, ${(420 * size.width) / size.height}px)`,
      }}
    >
      {imageUrl ? (
        <Box alt="The image to crop" component="img" draggable={false} src={imageUrl} sx={{ display: "block", height: "100%", width: "100%" }} />
      ) : null}
      {/* The dimming lives in its own layer that clips to the picture, so it can never spill over the page. */}
      <Box aria-hidden="true" sx={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "absolute" }}>
        <Box
          sx={{
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            height: percent(value.height, size.height),
            left: percent(value.x, size.width),
            position: "absolute",
            top: percent(value.y, size.height),
            width: percent(value.width, size.width),
          }}
        />
      </Box>
      <Box
        aria-label={`Crop area: ${value.width} by ${value.height} pixels, starting ${value.x} across and ${value.y} down. Use the arrow keys to move it.`}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => handlePointerDown(event, "move")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="group"
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          boxSizing: "border-box",
          cursor: "move",
          height: percent(value.height, size.height),
          left: percent(value.x, size.width),
          outlineOffset: 2,
          position: "absolute",
          top: percent(value.y, size.height),
          width: percent(value.width, size.width),
        }}
        tabIndex={0}
      >
        {HANDLES.filter((entry) => !isLocked || entry.handle.length === 2).map((entry) => (
          <Box
            aria-label={`Resize from the ${entry.label}`}
            key={entry.handle}
            onPointerDown={(event) => handlePointerDown(event, entry.handle)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="presentation"
            sx={{
              bgcolor: "background.paper",
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 0.5,
              cursor: entry.cursor,
              height: HANDLE_SIZE,
              left: entry.left,
              position: "absolute",
              top: entry.top,
              transform: "translate(-50%, -50%)",
              width: HANDLE_SIZE,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
