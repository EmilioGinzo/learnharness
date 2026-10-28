# Syncing with the official repository

The Omarchy theme exists only on this fork. It is built so that pulling `origin/main` stays a plain merge.

## Pull upstream

```sh
git fetch origin
git merge origin/main      # merge, don't rebase: rerere replays earlier resolutions
```

`git config rerere.enabled true` is set for this clone; keep it on.

## What the theme owns (new files, upstream never touches them)

- `src/core/system-theme.ts`, `src/core/appearance-theme.ts`
- `src/server/system-theme.ts` (also defines `SYSTEM_THEME_FILE`)
- `app/api/theme/omarchy/route.ts`
- `components/settings/omarchy-theme.tsx` (fetch hook, overlay, dark-class toggle, `ThemeRow`)
- `tests/system-theme.test.ts`, `contrib/omarchy/`

## The only edits inside upstream files (all small and additive)

| File | Edit |
| --- | --- |
| `src/core/settings.ts` | import, `theme?` on `AppearanceSettings`, `theme` in `FactorySettings.appearance` and `FACTORY_SETTINGS.appearance`, one line in `sanitizeAppearance` |
| `src/core/settings-resolution.ts` | `theme:` line in `resolveSettings` |
| `src/server/settings-body.ts` | import, 5-line `theme` block in `parseAppearanceSettingsBody` |
| `src/core/events.ts` | `"theme-changed"` in `ServerEvents` and `SERVER_EVENT_TYPES` |
| `components/settings/appearance.tsx` | import, `useSystemThemeFile`/`withSystemTheme`/`useSystemThemeClass` in `AppearanceProvider`, `SystemThemeContext.Provider` around the return |
| `components/settings/appearance-section.tsx` | import and `<ThemeRow … />` |

If a merge conflicts, it is in one of these. Keep upstream's side and re-add the edit above.

## After every merge

```sh
npx tsc --noEmit
NODE_ENV=test npx tsx --test tests/system-theme.test.ts tests/render-settings.test.tsx tests/settings-body.test.ts tests/settings-pure.test.ts
```
