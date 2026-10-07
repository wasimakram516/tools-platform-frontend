/**
 * Shape and depth tokens shared by the whole app, so cards, panels, and controls agree.
 *
 * Surfaces (cards, the tool workspace, result panels) are rounder than controls (buttons and
 * inputs), which stay a little tighter so they feel precise. The elevation colours live in CSS
 * variables in globals.css, one set for light and one for dark, so a component can use them in
 * any `sx` without a theme callback, from server or client code.
 */
export const RADIUS = { control: 12, surface: 18 } as const;

export const SURFACE_RADIUS = `${RADIUS.surface}px`;
export const CONTROL_RADIUS = `${RADIUS.control}px`;

/** The soft shadow a card or panel rests in, and the deeper one it lifts to on hover. */
export const SURFACE_SHADOW = "var(--surface-shadow)";
export const SURFACE_SHADOW_HOVER = "var(--surface-shadow-hover)";

/**
 * Hover and focus behaviour for a card that is a link: it lifts a little, deepens its shadow,
 * and picks up the brand colour on its edge. Motion is removed for people who ask for less of it.
 */
export const CARD_HOVER_SX = {
  transition: "box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease",
  "&:hover, &:focus-within": {
    borderColor: "primary.main",
    boxShadow: SURFACE_SHADOW_HOVER,
    transform: "translateY(-3px)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&:hover, &:focus-within": { transform: "none" },
  },
} as const;
