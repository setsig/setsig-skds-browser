import type { CameraCaptureOptions, ForensicSnapshot } from "./types.js";
/**
 * Helper to manage video streams and capture forensic liveness snapshots on web/kiosk devices.
 */
export declare class SetsigCamera {
    private stream;
    private videoEl;
    /**
     * Initializes the media stream and attaches it to an HTMLVideoElement.
     */
    start(videoElement: HTMLVideoElement, options?: CameraCaptureOptions): Promise<void>;
    /**
     * Captures an instant forensic frame from the video stream onto an off-screen canvas.
     */
    captureSnapshot(): Promise<ForensicSnapshot>;
    /**
     * Stops all active camera tracks and detaches stream from video element.
     */
    stop(): void;
}
//# sourceMappingURL=camera.d.ts.map