import { fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextLink } from "@/components/ui/next-link";

const received = vi.hoisted(() => ({ prefetch: [] as unknown[] }));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    prefetch,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode; href: string; prefetch?: unknown }) => {
    received.prefetch.push(prefetch);

    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

beforeEach(() => {
  received.prefetch = [];
});

/**
 * The prefetch value the link was most recently rendered with.
 */
function latestPrefetch(): unknown {
  return received.prefetch.at(-1);
}

describe("NextLink", () => {
  it("does not prefetch a link just because it is on the page", () => {
    render(<NextLink href="/tools/json-formatter">JSON Formatter</NextLink>);

    expect(screen.getByRole("link", { name: "JSON Formatter" })).toHaveAttribute("href", "/tools/json-formatter");
    expect(latestPrefetch()).toBe(false);
  });

  it.each([
    ["hovers", (link: HTMLElement) => fireEvent.mouseEnter(link)],
    ["touches", (link: HTMLElement) => fireEvent.touchStart(link)],
    ["focuses", (link: HTMLElement) => fireEvent.focus(link)],
  ])("prefetches once someone %s it", (_name, act) => {
    render(<NextLink href="/tools/json-formatter">JSON Formatter</NextLink>);
    act(screen.getByRole("link"));

    // null is the framework's default, which prefetches the page.
    expect(latestPrefetch()).toBeNull();
  });

  it("still calls the handlers it is given", () => {
    const onMouseEnter = vi.fn();

    render(
      <NextLink href="/tools/json-formatter" onMouseEnter={onMouseEnter}>
        JSON Formatter
      </NextLink>,
    );
    fireEvent.mouseEnter(screen.getByRole("link"));

    expect(onMouseEnter).toHaveBeenCalledOnce();
  });

  it("respects a prefetch value that the caller chooses", () => {
    render(
      <NextLink href="/tools/json-formatter" prefetch>
        JSON Formatter
      </NextLink>,
    );

    expect(latestPrefetch()).toBe(true);
  });
});
