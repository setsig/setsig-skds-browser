/**
 * Helper to manage video streams and capture forensic liveness snapshots on web/kiosk devices.
 */
export class SetsigCamera {
    stream = null;
    videoEl = null;
    /**
     * Initializes the media stream and attaches it to an HTMLVideoElement.
     */
    async start(videoElement, options = {}) {
        this.videoEl = videoElement;
        const constraints = {
            video: {
                width: { ideal: options.width ?? 1280 },
                height: { ideal: options.height ?? 720 },
                facingMode: options.facingMode ?? "user",
            },
            audio: false,
        };
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("getUserMedia is not supported by this browser environment");
        }
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.videoEl.srcObject = this.stream;
        await this.videoEl.play();
    }
    /**
     * Captures an instant forensic frame from the video stream onto an off-screen canvas.
     */
    async captureSnapshot() {
        if (!this.videoEl || !this.stream) {
            throw new Error("Camera stream is not active. Call start() first.");
        }
        const width = this.videoEl.videoWidth || 1280;
        const height = this.videoEl.videoHeight || 720;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Could not acquire 2D rendering context from canvas");
        }
        ctx.drawImage(this.videoEl, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b) => {
                if (b)
                    resolve(b);
                else
                    reject(new Error("Failed to serialize canvas to Blob"));
            }, "image/jpeg", 0.9);
        });
        return {
            blob,
            dataUrl,
            capturedAt: new Date().toISOString(),
            dimensions: { width, height },
        };
    }
    /**
     * Stops all active camera tracks and detaches stream from video element.
     */
    stop() {
        if (this.stream) {
            for (const track of this.stream.getTracks()) {
                track.stop();
            }
            this.stream = null;
        }
        if (this.videoEl) {
            this.videoEl.srcObject = null;
            this.videoEl = null;
        }
    }
}
//# sourceMappingURL=camera.js.map