/**
 * THE APPEARANCE THEME CHOICE (Omarchy theme, 2026-10-26): which palette
 * source the Appearance section uses — the app's own, or the desktop's theme
 * file (core/system-theme.ts). It lives in its own dependency-free module so
 * the shared settings files (settings.ts, settings-body.ts) only carry
 * one-line hooks into it.
 */

export const APPEARANCE_THEMES = ["default", "omarchy"] as const;
export type AppearanceTheme = (typeof APPEARANCE_THEMES)[number];

export function isAppearanceTheme(value: unknown): value is AppearanceTheme {
	return typeof value === "string" && (APPEARANCE_THEMES as readonly string[]).includes(value);
}

/** The settings-body check for the `theme` field. */
export function parseAppearanceTheme(
	value: unknown,
): { ok: true; theme: AppearanceTheme } | { ok: false; error: string } {
	if (!isAppearanceTheme(value)) {
		return { ok: false, error: `theme must be one of ${APPEARANCE_THEMES.map((t) => `"${t}"`).join(", ")}` };
	}
	return { ok: true, theme: value };
}
