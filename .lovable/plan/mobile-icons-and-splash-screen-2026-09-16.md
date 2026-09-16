# Mobile icons and splash screen

## Build
- Create a distinctive KashmirBot square source icon based on the existing chinar-leaf identity.
- Create a matching portrait splash source with safe central artwork for varied phone screens.
- Add the Capacitor asset generator and configuration needed to produce Android and iOS resource sets.
- Document the single command that regenerates and syncs native assets after the platform folders are created.

## Technical details
- Store editable source artwork under `resources/` and generate native Android/iOS assets through Capacitor Assets.
- Keep icon artwork inside platform-safe margins and use the existing deep green brand background.
- Configure the native splash plugin to use matching colors and hide automatically after startup.
- Verify source dimensions, configuration, and TypeScript checks.
