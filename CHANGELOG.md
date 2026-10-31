# Changelog

All notable changes to QuickNote are documented here.

## [1.0.0] - 2026-10-31

### Added

- Created a lightweight Electron desktop sticky note for macOS and Windows.
- Added a multiline text editor with automatic local saving and restore on launch.
- Added a hover-to-copy button beside each non-empty logical line, with temporary copy feedback.
- Added a header pin toggle to keep the window always on top.
- Added secure Electron boundaries using context isolation, a sandboxed preload, and narrowly scoped IPC for storage, clipboard, and window pinning.
- Added macOS and Windows packaging configuration.

### Changed

- Set the default and minimum window size to 260 × 315 Electron points.
- Reserved header space for macOS window controls and positioned the copy button next to the hovered line.

### Known limitations

- Windows packaging is configured but requires validation on Windows.
- macOS signing and notarization are not configured.
