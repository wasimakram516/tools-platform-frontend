"use client";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { Box, Stack, Typography } from "@mui/material";
import type { ChangeEvent, DragEvent, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

interface FileDropZoneProps {
  /** File types the picker offers, such as "image/*" or a list of MIME types. */
  accept: string;
  /** What kinds of file and what limits apply, shown under the prompt. */
  hint: string;
  id: string;
  /** Accessible name for the file picker. */
  label: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}

/**
 * A large area that takes files three ways: click anywhere on it (or press Enter or Space) to
 * open the file picker, drop files onto it, or paste an image from the clipboard. The files are
 * passed to the tool and never uploaded.
 */
export function FileDropZone({ accept, hint, id, label, multiple = false, onFiles }: FileDropZoneProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    /**
     * Takes files pasted anywhere on the page. Pasting text is left alone.
     */
    function handlePaste(event: ClipboardEvent): void {
      const pasted = Array.from(event.clipboardData?.files ?? []);

      if (pasted.length > 0) {
        event.preventDefault();
        onFiles(multiple ? pasted : pasted.slice(0, 1));
      }
    }

    document.addEventListener("paste", handlePaste);

    return () => document.removeEventListener("paste", handlePaste);
  }, [multiple, onFiles]);

  /**
   * Passes on chosen files, keeping only one when the tool takes a single file.
   */
  function accepted(files: FileList | null): void {
    const list = Array.from(files ?? []);

    if (list.length > 0) {
      onFiles(multiple ? list : list.slice(0, 1));
    }
  }

  /**
   * Handles files chosen in the picker, and lets the same file be chosen again afterwards.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    accepted(event.target.files);
    event.target.value = "";
  }

  /**
   * Handles files dropped on the area.
   */
  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    accepted(event.dataTransfer.files);
  }

  /**
   * Opens the picker from the keyboard, as a button would.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <Box
      aria-label={`${label}. You can also drop or paste files here.`}
      onClick={() => inputRef.current?.click()}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role="button"
      sx={{
        bgcolor: isDragging ? "action.hover" : "transparent",
        border: "2px dashed",
        borderColor: isDragging ? "primary.main" : "divider",
        borderRadius: 3,
        cursor: "pointer",
        outlineOffset: 2,
        p: { xs: 3, md: 5 },
        textAlign: "center",
        transition: "border-color 150ms ease, background-color 150ms ease",
        "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
      }}
      tabIndex={0}
    >
      <input
        accept={accept}
        aria-label={label}
        hidden
        id={id}
        multiple={multiple}
        onChange={handleChange}
        onClick={(event) => event.stopPropagation()}
        ref={inputRef}
        type="file"
      />
      <Stack sx={{ alignItems: "center", gap: 1.5 }}>
        <CloudUploadOutlinedIcon aria-hidden="true" color="primary" sx={{ fontSize: 44 }} />
        <Typography sx={{ fontWeight: 700 }}>
          {multiple ? "Drop images here, or click to choose" : "Drop an image here, or click to choose"}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
          {hint}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
          You can also paste an image from the clipboard.
        </Typography>
      </Stack>
    </Box>
  );
}
