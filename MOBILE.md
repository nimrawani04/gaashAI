# KashmirBot mobile app — version 1

The phone app is a native shell around the live KashmirBot site, so anything you
change and publish on the web shows up in the app too.

## One-time setup on your own computer

1. Export this project to GitHub, then clone it to your computer.
2. Install dependencies: `npm install`
3. Create the native projects:
   - Android: `npx cap add android`
   - iPhone: `npx cap add ios` (needs a Mac with Xcode)
4. Sync: `npx cap sync`

## Running it

- Android: `npx cap run android` (needs Android Studio)
- iPhone: `npx cap run ios` (needs Xcode on a Mac)

## Releasing version 1

App version is `1.0.0` (build 1).

- Android: in Android Studio choose Build → Generate Signed Bundle, upload the
  `.aab` to the Google Play Console.
- iPhone: in Xcode choose Product → Archive, then upload to App Store Connect.

App name: **KashmirBot**. App ID: `app.lovable.f10d8ce1204b4d419dbb3725d39495e3`.

## After changing the website

Publish the site — the app picks up the new version automatically. You only need
`npx cap sync` again if app icons, the app name, or plugins change.
