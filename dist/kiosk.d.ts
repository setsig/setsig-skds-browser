import type { KioskConfig } from "./types.js";
/**
 * Controller for rendering and orchestrating dynamic TOTP QR kiosk displays.
 */
export declare class SetsigKiosk {
    private config;
    private containerEl;
    private timerId;
    private secondsRemaining;
    private currentTtl;
    private isDestroyed;
    constructor(config: KioskConfig);
    private initLayout;
    private refreshToken;
    private updateDisplay;
    private startCountdown;
    /**
     * Destroys the kiosk instance, clears active interval timers, and empties container.
     */
    destroy(): void;
}
//# sourceMappingURL=kiosk.d.ts.map