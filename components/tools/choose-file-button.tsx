"use client";

import { Button } from "@mui/material";
import type { ReactNode } from "react";
import { useRef } from "react";

interface ChooseFileButtonProps {
  /** File types the picker offers. */
  accept: string;
  /** The button's text, which is also its accessible name. */
  label: string;
  onFiles: (files: File[]) => void;
}

/**
 * A compact button that opens the file picker, for choosing a different file once one is open.
 */
export function ChooseFileButton({ accept, label, onFiles }: ChooseFileButtonProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        accept={accept}
        aria-label={`${label} (file picker)`}
        hidden
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      <Button color="inherit" onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </>
  );
}
