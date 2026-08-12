# Deterministic startup and production configuration fix

## Goal
Make startup handoff independent of authentication, complete exactly two full chinar → bot → chinar cycles, and prevent missing backend configuration from crashing the app.

## Changes
- Replace the competing splash/auth booleans and fallback timers with one explicit startup reducer/state machine: `splash` → `entry`, while auth independently reports `loading`, `ready`, or `unavailable`.
- Drive splash completion from two observed CSS animation iterations, with the animation duration as the single source of truth. Unmount the splash immediately after the second completed cycle; do not gate this on session initialization.
- Remove the current effect lifecycle that can restart the splash after remounts and ensure reduced-motion users hand off immediately.
- Make backend configuration resolution non-throwing at the startup boundary. If configuration is unavailable, render the entry/guest UI with a recoverable sign-in message instead of mounting auth listeners against an invalid client.
- Rebind the managed backend environment and verify the public URL/key bindings used by the production build, without hardcoding credentials.
- Validate with browser automation: exactly two animation iterations, splash removal, auth/guest page visibility, no uncaught configuration error, and a production-mode route response.

## Technical notes
- Keep the managed generated client unchanged; use its existing `getSupabaseClient()` / configuration status API from app startup.
- Preserve guest mode and existing auth retry behavior, but retries will affect auth only and can never re-enter or prolong splash state.
