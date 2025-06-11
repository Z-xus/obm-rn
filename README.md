````markdown
# OMB Ambulance App (React Native with Expo + Firebase)

This project is built using **Expo (Bare Workflow)** and integrates **React Native Firebase** modules for native Firebase support.

---

## Prerequisites

- Node.js (v18+ recommended)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or an Android device with USB debugging enabled
- Firebase project with Android app configured
- Required files:
  - `google-services.json` in project root

---

## Running the App

### Initial Setup (or when dependencies/configs change)

```bash
npx expo prebuild
npx expo run:android
```

This generates native Android/iOS directories and compiles with native Firebase modules.

> ⚠️ **Expo Go will not work** with this project because it requires native Firebase code.

### Daily Development (no config changes)

```bash
npx expo run:android
```

Avoid `prebuild` unless you modify `app.json` or install native modules.

---

## Notes

* For Firebase to function, the app **must be run via a custom development client** (`expo run:android`), not Expo Go.
* Avoid unnecessary cleans or reinstalls to save build time.
* Make sure Android SDK & Emulator or physical device is properly set up.

