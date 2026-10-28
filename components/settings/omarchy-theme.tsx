"use client";
/**
 * THE OMARCHY THEME, CLIENT SIDE (2026-10-26) — everything the fork adds to
 * the Appearance machinery lives here, so appearance.tsx and
 * appearance-section.tsx carry only one-line hooks into this file.
 *
 * With appearance.theme = "omarchy" the palette comes from the desktop's
 * theme file (GET /api/theme/omarchy, shape in core/system-theme.ts)
 * instead of the background derivation — every palette token, the mode
 * included: a light Omarchy theme drops the dark class. "theme-changed"
 * (the server's watch on that file) refetches it, so an Omarchy theme switch
 * retints open windows live. Selected but no file = the app's own palette.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
	systemThemeVars,
	sanitizeSystemTheme,
	type AppearanceSettings,
	type AppearanceTheme,
	type SystemTheme,
} from "@/src/core";
import { useServerEvent, useServerResync } from "@/components/server-events";
import { SettingsRow, ThinSelect } from "./controls.tsx";

/** The palette in effect: the Omarchy theme when it is selected AND its
 *  file was read, otherwise null (the app's own palette). Pure. */
export function activeSystemTheme(
	choice: AppearanceTheme | undefined,
	systemTheme: SystemTheme | null,
): SystemTheme | null {
	return choice === "omarchy" ? systemTheme : null;
}

/** The base CSS vars with an active Omarchy palette laid over them. Every
 *  derived-palette token is also a theme token, so the theme fully replaces
 *  the background derivation; type and emphasis vars pass through. Pure. */
export function withSystemTheme(
	vars: Record<string, string>,
	choice: AppearanceTheme | undefined,
	systemTheme: SystemTheme | null,
): Record<string, string> {
	const theme = activeSystemTheme(choice, systemTheme);
	return theme === null ? vars : { ...vars, ...systemThemeVars(theme) };
}

/** The Omarchy theme file: read on load, re-read whenever the server's
 *  watch reports a change (and after a reconnect, which may have missed
 *  one). A failed read keeps the last palette rather than flashing back. */
export function useSystemThemeFile(): SystemTheme | null {
	const [systemTheme, setSystemTheme] = useState<SystemTheme | null>(null);
	const load = useCallback(() => {
		fetch("/api/theme/omarchy")
			.then((r) => r.json())
			.then((body: { theme?: unknown }) => setSystemTheme(sanitizeSystemTheme(body.theme)))
			.catch(() => {/* keep the last palette */});
	}, []);
	useEffect(load, [load]);
	useServerEvent("theme-changed", load);
	useServerResync(load);
	return systemTheme;
}

/** The file's palette for the settings UI; null outside the provider. */
export const SystemThemeContext = createContext<SystemTheme | null>(null);

/** The one thing the vars can't reach: Tailwind's dark variant keys off
 *  <html class="dark">, so a light Omarchy theme has to drop the class. */
export function useSystemThemeClass(active: SystemTheme | null): void {
	const light = active?.mode === "light";
	useEffect(() => {
		document.documentElement.classList.toggle("dark", !light);
	}, [light]);
}

/** The Theme row of the Appearance section. The Omarchy option only appears
 *  once its file exists (or while it is the stored choice, so the select
 *  never shows a value it can't name). */
export function ThemeRow({
	appearance,
	onSectionChange,
}: {
	appearance: AppearanceSettings | undefined;
	onSectionChange: (next: AppearanceSettings) => void;
}) {
	const systemTheme = useContext(SystemThemeContext);
	const choice = appearance?.theme ?? "default";
	const hint = choice === "omarchy" && systemTheme === null ? "Omarchy theme file not found" : undefined;
	return (
		<SettingsRow label="Theme" hint={hint} testid="row-theme">
			<ThinSelect
				value={choice}
				ariaLabel="theme"
				testid="select-theme"
				onChange={(v) => onSectionChange({ ...appearance, theme: v as AppearanceTheme })}
			>
				<option value="default">LearnHarness</option>
				{(systemTheme !== null || choice === "omarchy") && <option value="omarchy">Omarchy</option>}
			</ThinSelect>
		</SettingsRow>
	);
}
