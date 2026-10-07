import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { HashGeneratorTool } from "@/components/tools/hash-generator-tool";
import type { HashResult } from "@/lib/tools/hash-generator";

vi.mock("@mui/material-nextjs/v16-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: PropsWithChildren) => children,
}));

const FAKE_HASHES: HashResult = {
  hashes: {
    "SHA-1": "aaaa",
    "SHA-256": "bbbb",
    "SHA-384": "cccc",
    "SHA-512": "dddd",
  },
  ok: true,
};

/**
 * Renders the tool with a stand-in hash function so no Web Crypto is needed.
 */
function renderTool(hash = vi.fn().mockResolvedValue(FAKE_HASHES)) {
  render(
    <AppThemeProvider>
      <HashGeneratorTool hash={hash} />
    </AppThemeProvider>,
  );

  return hash;
}

/**
 * Types into the text box and waits for the hashes to appear.
 */
async function typeText(text: string): Promise<void> {
  fireEvent.change(screen.getByLabelText("Text to hash"), { target: { value: text } });
  await screen.findByTestId("hash-SHA-256");
}

describe("HashGeneratorTool", () => {
  it("shows every hash once there is text", async () => {
    const hash = renderTool();

    expect(screen.queryByTestId("hash-SHA-256")).not.toBeInTheDocument();

    await typeText("hello");

    expect(hash).toHaveBeenCalledWith("hello", "");
    expect(screen.getByTestId("hash-SHA-1")).toHaveTextContent("aaaa");
    expect(screen.getByTestId("hash-SHA-512")).toHaveTextContent("dddd");
  });

  it("switches the letter case without hashing again", async () => {
    const hash = renderTool();

    await typeText("hello");
    fireEvent.click(screen.getByLabelText("Uppercase"));

    expect(screen.getByTestId("hash-SHA-256")).toHaveTextContent("BBBB");
    expect(hash).toHaveBeenCalledTimes(1);
  });

  it("says whether a pasted checksum matches", async () => {
    renderTool();

    await typeText("hello");
    fireEvent.change(screen.getByLabelText("Hash to check (optional)"), { target: { value: " BBBB " } });
    expect(screen.getByText("Matches the SHA-256 hash of this text.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Hash to check (optional)"), { target: { value: "ffff" } });
    expect(screen.getByText("Does not match any hash of this text.")).toBeInTheDocument();
  });

  it("copies one hash and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderTool();

    await typeText("hello");
    fireEvent.click(screen.getByRole("button", { name: "Copy SHA-256" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("bbbb"));
    expect(await screen.findByText("SHA-256 hash copied.")).toBeInTheDocument();
  });

  it("shows a hashing problem instead of results", async () => {
    renderTool(vi.fn().mockResolvedValue({ message: "The text could not be hashed. Try again.", ok: false }));

    fireEvent.change(screen.getByLabelText("Text to hash"), { target: { value: "hello" } });

    expect(await screen.findByText("The text could not be hashed. Try again.")).toBeInTheDocument();
    expect(screen.queryByTestId("hash-SHA-256")).not.toBeInTheDocument();
  });

  it("hashes again with the secret key and labels the results as HMACs", async () => {
    const hash = renderTool();

    await typeText("hello");
    fireEvent.change(screen.getByLabelText("Secret key (optional)"), { target: { value: "secret" } });

    await waitFor(() => expect(hash).toHaveBeenLastCalledWith("hello", "secret"));
    expect(screen.getByText("HMAC-SHA-256")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy HMAC-SHA-256" })).toBeInTheDocument();
  });

  it("clears the text, the checksum, and the hashes", async () => {
    renderTool();

    await typeText("hello");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Text to hash")).toHaveValue("");
    expect(screen.queryByTestId("hash-SHA-256")).not.toBeInTheDocument();
  });
});
