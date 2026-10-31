# QuickNote

QuickNote is a small Electron sticky note for keeping reusable text close by. Hover over a non-empty line and select its copy button to send exactly that newline-delimited line to the system clipboard.

## Requirements

- Node.js 20 or newer
- npm
- macOS or Windows for running the desktop app; packaging should be performed on the target OS

## Develop

```sh
npm install
npm run dev
```

This starts Vite, compiles Electron's main/preload process, and opens the desktop window.

The development command checks Electron's downloaded desktop binary before starting. If the binary download was interrupted during installation, it retries Electron's installer; this requires access to Electron's download host. If that repair fails, run `npm rebuild electron` after checking network or proxy access.

## Build and package

```sh
npm run typecheck
npm test
npm run build
npm run package:mac
npm run package:win
```

`package:mac` produces a DMG and ZIP; `package:win` produces an NSIS installer and portable executable. Electron Builder supports cross-target packaging in some environments, but a Windows artifact must be run on Windows before claiming Windows compatibility. macOS code signing and notarization are not configured.

## Data and security

The note is stored as `note.txt` in Electron's per-user application data directory, with atomic replacement after a short debounce. The renderer has no Node.js access. A context-isolated, sandboxed preload exposes only note load/save and clipboard copy calls.

## Current limitations

- One note window and one note are supported.
- Clipboard and persistence errors do not currently have detailed recovery UI.
- Windows packaging is configured but has not been validated on Windows.
