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

---

## Ticket VAL-202: Date of Birth Validation

**Reporter:** Maria Garcia  
**Priority:** Critical

### Bug Summary
The signup form accepted any date as a date of birth — including future dates and dates that make the user under 18. This creates compliance risk (accepting minors).

### Root Cause
The `dateOfBirth` field only had a `required` check. There was no validation for:
- Future dates (e.g., year 2025 when current year is 2024)
- Age minimum (user must be 18+)

### Fix
Added a `validate` function to the `dateOfBirth` field in `app/signup/page.tsx`:
1. **Future date check** — rejects if the entered date is after today.
2. **Age calculation** — computes the user's age (accounting for month/day) and rejects if under 18, displaying: *"You must be at least 18 years old"*.
3. **HTML `max` attribute** — set to today's date so the date picker itself prevents selecting a future date.

### Preventive Measures
- Always pair `required` with domain-specific validation rules for sensitive fields (age, dates, financial data).
- Add server-side validation as a second layer — client-side checks alone can be bypassed.
- Include edge-case test cases (future dates, boundary ages like exactly 18) in QA checklists.
