# @setsig/browser

Official Browser & Kiosk Display SDK for [setsig.com](https://setsig.com) — Physical Presence & Verification Infrastructure-as-a-Service (PaaS/IaaS).

[![npm version](https://badge.fury.io/js/@setsig%2Fbrowser.svg)](https://www.npmjs.com/package/@setsig/browser)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

Lightweight, zero-dependency client library and CDN script for physical kiosks, tablets, and web check-in terminals.

---

## Installation

```bash
npm install @setsig/browser
```

Or via CDN directly in your HTML:

```html
<script src="https://cdn.setsig.com/kiosk/setsig-kiosk.js"></script>
```

---

## Usage

### 1. Kiosk Display (Automatic Dynamic TOTP Refresh & Countdown Ring)

Mount a self-refreshing dynamic QR kiosk terminal into any HTML container:

```typescript
import { SetsigKiosk } from "@setsig/browser";

const kiosk = new SetsigKiosk({
  container: "#kiosk-container",
  venueId: "ven_ist_headquarters",
  apiKey: "pk_live_...",
  refreshIntervalSeconds: 60,
  theme: "dark",
  onTokenGenerated: (token) => {
    console.log("New dynamic code displayed:", token.dynamicCode);
  },
  onError: (err) => {
    console.error("Kiosk display error:", err);
  },
});

// To clean up and unmount:
// kiosk.destroy();
```

---

### 2. Standalone Embed via Script Tag (No Build Tools Required)

```html
<div id="setsig-kiosk"></div>

<script
  src="https://cdn.setsig.com/kiosk/setsig-kiosk.js"
  data-venue="ven_ist_headquarters"
  data-api-key="pk_live_..."
  data-container="#setsig-kiosk"
  data-theme="dark"
></script>
```

---

### 3. Forensic Camera & Liveness Capture Helper

For web check-in terminals or tablet verification stations:

```typescript
import { SetsigCamera } from "@setsig/browser";

const camera = new SetsigCamera();
const videoElement = document.querySelector<HTMLVideoElement>("#preview-video")!;

// Start camera stream
await camera.start(videoElement, {
  width: 1280,
  height: 720,
  facingMode: "user",
});

// Capture forensic snapshot for visual verification
const snapshot = await camera.captureSnapshot();
console.log("Captured at:", snapshot.capturedAt);
console.log("Blob size:", snapshot.blob.size);

// Stop stream when finished
camera.stop();
```

---

## Features

- **Zero 3rd-Party Dependencies:** 100% vanilla browser APIs (Fetch, Canvas, MediaDevices, SVG).
- **Auto-Refreshing TOTP Engine:** Automatically generates dynamic codes and synchronizes with setsig token clocks.
- **Visual Countdown Progress Ring:** Animated SVG circular timer visualizing code validity.
- **Dual CDN & NPM Distribution:** Works seamlessly in React / Next.js / Vue as well as static HTML files.

---

## License

Apache-2.0 License. Commercial verification engine intellectual property held by AVCI Ventures.

