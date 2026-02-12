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

---

## Ticket SEC-301: SSN Storage

**Reporter:** Security Audit Team  
**Priority:** Critical

### Bug Summary
Social Security Numbers were stored as plaintext in the database and returned in full in API responses — a severe privacy and compliance risk.

### Root Cause
1. The signup mutation spread `...input` directly into the DB insert, storing the raw SSN string.
2. API responses returned the full user object (minus password) without redacting the SSN field.

### Fix
Created `utils/encryption.ts` with:
- **`encryptSSN()`** — encrypts using AES-256-GCM (IV + auth tag + ciphertext stored as a single hex string).

Changes in `server/routers/auth.ts`:
- **Signup**: SSN is encrypted via `encryptSSN()` before DB insert.
- **API responses**: SSN is excluded — only `password` was being omitted before; now neither sensitive field is exposed.

### Preventive Measures
- Never store (SSN, government IDs) in plaintext — always encrypt at rest.
- Never return sensitive fields in API responses — mask or omit them.
- Store encryption keys in a secure key management service (e.g., AWS KMS), not in code or env files.
- Add automated security scans to catch plaintext in DB columns.

---

## Ticket VAL-206: Card Number Validation

**Reporter:** David Brown  
**Priority:** Critical

### Bug Summary
The system accepted invalid card numbers (any 16 digits starting with `4` or `5`), leading to failed transactions.

### Root Cause
The card validation only checked the first digit prefix — no checksum validation. Any fabricated 16-digit number starting with `4` or `5` would pass.

### Fix
Replaced the prefix check with the **Luhn algorithm** in `FundingModal.tsx`:
- Validates the card number's checksum digit — the industry standard used by all major card networks.
- Also added a `useEffect` to clear the `accountNumber` error when the user switches between Card and Bank funding types.

### Preventive Measures
- Use industry-standard algorithms (Luhn) for financial input validation.
- Clear field-level errors when the context of a form field changes (e.g., switching input types).

---

## Ticket VAL-208: Weak Password Requirements

**Reporter:** Security Team  
**Priority:** Critical

### Bug Summary
Password validation only enforced minimum length (8 chars) and at least one number. Weak passwords like `abcdefg1` were accepted.

### Root Cause
- Client-side: `passwordValidation` in `utils/validations.ts` only checked length, common passwords, and one number.
- Server-side: Zod schema in `auth.ts` only enforced `min(8)` — no complexity rules at all.

### Fix
**Client-side** (`utils/validations.ts`):
- Added checks for **uppercase**, **lowercase**, **number**, and **special character**.
- Expanded the common passwords blocklist.

**Server-side** (`server/routers/auth.ts`):
- Added matching `.regex()` Zod validators for uppercase, lowercase, number, and special character — ensures rules can't be bypassed.

### Preventive Measures
- Always enforce password complexity on both client and server.
- Keep the common passwords list updated (consider using a larger dataset like the Have I Been Pwned list).
- Display password requirements clearly to the user before they submit.

---

## Ticket PERF-406: Balance Calculation

**Reporter:** Finance Team  
**Priority:** Critical

### Bug Summary
Account balances became incorrect after multiple transactions, causing financial discrepancies.

### Root Cause
Two bugs in the `fundAccount` mutation (`server/routers/account.ts`):
1. **Broken return value**: Instead of returning `account.balance + amount`, the code looped 100 times adding `amount / 100` — introducing **floating-point precision errors** with every iteration.
2. **Mismatch**: The DB was updated with `account.balance + amount` (correct), but the value returned to the client used the faulty loop calculation, so the UI displayed a wrong balance.

### Fix
- Replaced the loop with simple addition: `account.balance + amount`.
- Wrapped in `Math.round(... * 100) / 100` to avoid floating-point drift on currency values.
- The same `newBalance` is now used for both the DB update and the API response — no mismatch.

### Preventive Measures
- Never use iterative loops for simple arithmetic — they accumulate floating-point errors.
- Always round currency values to 2 decimal places (`Math.round(x * 100) / 100`).
- Ensure the value stored in DB and the value returned to the client come from the same source.

---

## Ticket PERF-401: Account Creation Error

**Reporter:** Support Team  
**Priority:** Critical

### Bug Summary
Newly created accounts sometimes displayed a $100 balance instead of $0.

### Root Cause
After inserting a new account (with `balance: 0`), the code fetched it back from the DB. If the fetch returned `null`, a **hardcoded fallback object** was returned with `balance: 100` and `status: "pending"` — silently showing incorrect data instead of surfacing the error.

### Fix
Changed the fallback object's `balance` from `100` to `0` in `server/routers/account.ts`, so if the DB fetch after insert fails, the returned balance matches the inserted value.

---

## Ticket PERF-405: Missing Transactions

**Reporter:** Multiple Users  
**Priority:** Critical

### Bug Summary
Not all transactions appeared in the transaction history after multiple funding events.

### Root Cause
After a successful funding, the `onSuccess` callback in `app/dashboard/page.tsx` called `refetchAccounts()` to refresh balances, but **never invalidated the `getTransactions` query**. The `TransactionList` component kept showing stale cached data.

### Fix
Added `utils.account.getTransactions.invalidate()` to the funding `onSuccess` callback in `app/dashboard/page.tsx`, using tRPC's `useUtils()`. This forces the transactions query to refetch after every funding event, so the list always shows the latest transactions.

---

## Ticket VAL-205: Zero Amount Funding

**Reporter:** Lisa Johnson  
**Priority:** High

### Bug Summary
Users were able to submit a funding request for $0.00, creating unnecessary transaction records.

### Root Cause
In the FundingModal's amount validation, `min: { value: 0.0 }` allowed $0.00 to pass — the error message said "at least $0.01" but the actual check allowed zero.

### Fix
Changed `min` value from `0.0` to `0.01` in `components/FundingModal.tsx`.

---

## Ticket VAL-207: Routing Number Optional

**Reporter:** Support Team  
**Priority:** High

### Bug Summary
Bank transfers were being submitted without routing numbers, causing failed ACH transfers.

### Root Cause
The server-side Zod schema in `server/routers/account.ts` had `routingNumber: z.string().optional()`, allowing bank transfers to be submitted without a routing number. While the client had a required check, direct API calls could bypass it.

### Fix
Added a `.refine()` to the server-side `fundingSource` schema that requires a valid 9-digit routing number when `type` is `"bank"`. This enforces the validation server-side regardless of the client.