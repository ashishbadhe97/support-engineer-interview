# Bug Fix Documentation

---

## Ticket UI-101: Dark Mode Text Visibility

**Reporter:** Sarah Chen  
**Priority:** Medium

### Bug Summary
In dark mode, text typed into form inputs was white on a white background — making it invisible.

### Root Cause
The app had no mechanism to detect the user's OS theme preference and propagate it across components. Without this, input fields retained their default light-mode styling (white background) while some text colors were overridden to white, causing the white-on-white issue.

### Fix
Created a `ThemeProvider` component using React Context API:
- Detects the OS color scheme via `window.matchMedia("(prefers-color-scheme: dark)")` and listens for changes.
- Stores the current theme (`light` / `dark`) in context, making it available app-wide.
- Toggles a `.dark` class on `<html>`, which activates dark-mode CSS variables (`--background`, `--foreground`) in `globals.css`, ensuring all elements — including inputs — use the correct colors.

### Preventive Measures
- Use CSS variables (design tokens) for all colors instead of hardcoded values.
- Always test form elements in both light and dark modes before release.
- Rely on the centralized `ThemeProvider` for theme logic; avoid ad-hoc per-component overrides.
