# Auth redesign notes

## Removed

- Particle fields, ECG traces, neural-network overlays, animated status readouts, decorative grids, glow orbs, cursor tracking, tilt, rotating borders, scanning lines, shimmer buttons, filler cards, and the full-screen `PremiumLoader` overlay.
- The three-step signup wizard and repeated social/trust metric decoration.

These effects competed with the form and added motion without communicating a user state. The shell now gives the product video one clear visual role and keeps the form easy to scan.

## Added

- A single responsive signup form with a keyboard-accessible segmented role selector. Doctor and admin fields render only when relevant.
- Semantic labels, autocomplete metadata, visible focus rings, safe-area mobile padding, dark-mode classes, and calm inline errors.
- Debounced typo suggestions for common email-domain mistakes.
- Live confirm-password validation, paste-friendly password inputs, caps-lock feedback on login, and an entropy-informed strength score alongside requirement checks.
- Purposeful idle, loading, and success button states with fixed content width and short route transitions.
- Reduced-motion handling for non-essential entrance and role-field transitions.

## Why

- Speed: one signup surface, fewer transitions, reliable autofill, and inline fixes reduce backtracking.
- Clarity: labels, role-specific fields, and actionable validation make the next action obvious.
- Trust: restrained visual hierarchy, explicit privacy language, accessible controls, and visible state changes make the healthcare context feel dependable.

The repository currently has no authentication service connected to these pages, so the existing local validation and demo route behavior remain in place. Server-side errors and passkey enrollment need a backend contract before they can be implemented honestly.
