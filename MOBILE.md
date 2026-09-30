# KashmirBot mobile app — version 1

The phone app is a native shell around the live KashmirBot site, so anything you
change and publish on the web shows up in the app too.

App name: **KashmirBot**. App ID: `app.lovable.f10d8ce1204b4d419dbb3725d39495e3`.
Version `1.0.0` (build 1).

## What is already in this project

- `resources/icon.png`, `resources/splash.png`, `resources/splash-dark.png` —
  the editable source artwork (deep green + gold chinar leaf).
- `android/` — an Android Studio project with a leaf-only home icon and a static leaf launch image; the live app then plays the original SVG leaf-to-bot animation.
- `ios/` — an Xcode project with the same leaf-only icon and original SVG startup animation after launch.
- Completed Urdu and Kashmiri ready-made lesson quizzes are stored on-device and remain visible after restarting the app. They are not shared across devices.

## One-time setup on your computer

1. Export this project to GitHub, then clone it.
2. `npm install`
3. `npm run build` (Capacitor also needs this to create its local web assets; the app itself loads the published site.)
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

1. On a Mac with Xcode and an Apple Developer account, publish the latest website, then run `npm install`, `npm run build`, `npx cap sync ios`, and `npx cap open ios`.
2. In Xcode select the **App** target → **Signing & Capabilities** → your team; verify the bundle identifier, version and signing certificate. Connect your iPhone or select **Any iOS Device (arm64)** as the destination.
3. Choose **Product → Archive**. When Organizer opens, select the new archive and choose **Distribute App**.
4. For your own enrolled iPhone choose **Ad Hoc** (register its device ID in your Apple Developer account) or **Development**, then **Export** to create a signed `.ipa`. Install with Apple Configurator on your Mac; distribution certificates and provisioning profiles are required. For other testers choose **App Store Connect → Upload**, then invite them via TestFlight. An unsigned archive or `.ipa` cannot be installed on an iPhone.
5. Xcode archive/build and signing cannot run in this Linux workspace; the Xcode project is prepared here but the installable file must be created on a Mac.

## Changing the artwork later

Replace the files in `resources/`, then run:

```
npx @capacitor/assets generate --iconBackgroundColor '#0f5132' --splashBackgroundColor '#0f5132'
npx cap sync
```

## After changing the website

Publish the site — the app picks up the new version automatically. You only need
`npx cap sync` again if icons, the app name, or plugins change.
