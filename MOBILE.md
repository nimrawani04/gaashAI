# KashmirBot mobile app — version 1

The phone app is a native shell around the live KashmirBot site, so anything you
change and publish on the web shows up in the app too.

App name: **KashmirBot**. App ID: `app.lovable.f10d8ce1204b4d419dbb3725d39495e3`.
Version `1.0.0` (build 1).

## What is already in this project

- `resources/icon.png`, `resources/splash.png`, `resources/splash-dark.png` —
  the editable source artwork (deep green + gold chinar leaf).
- `android/` — a complete Android Studio project, icons and splash included.
- `ios/` — a complete Xcode project, icons and splash included.

## One-time setup on your computer

1. Export this project to GitHub, then clone it.
2. `npm install`
3. `npm run build`
4. `npx cap sync`

## Build the installable files

**Android (Windows, Mac or Linux — Android Studio)**

1. `npx cap open android`
2. Build → Generate Signed Bundle / APK.
   - Choose **APK** for a file you can sideload and share for testing.
   - Choose **Android App Bundle (.aab)** for the Google Play Console.
3. Create a signing key when asked, and keep it safe — every future update must
   use the same key.

**iPhone (Mac with Xcode only)**

1. `npx cap open ios`
2. Pick your Apple Developer team under Signing & Capabilities.
3. Product → Archive → Distribute App → App Store Connect (or TestFlight for
   testers). Apple does not allow direct download links; iPhone installs go
   through TestFlight or the App Store.

## Changing the artwork later

Replace the files in `resources/`, then run:

```
npx @capacitor/assets generate --iconBackgroundColor '#0f5132' --splashBackgroundColor '#0f5132'
npx cap sync
```

## After changing the website

Publish the site — the app picks up the new version automatically. You only need
`npx cap sync` again if icons, the app name, or plugins change.
