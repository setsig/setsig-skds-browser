/**
 * Controller for rendering and orchestrating dynamic TOTP QR kiosk displays.
 */
export class SetsigKiosk {
    config;
    containerEl;
    timerId = null;
    secondsRemaining = 60;
    currentTtl = 60;
    isDestroyed = false;
    constructor(config) {
        this.config = config;
        this.currentTtl = config.refreshIntervalSeconds ?? 60;
        this.secondsRemaining = this.currentTtl;
        if (typeof config.container === "string") {
            const el = document.querySelector(config.container);
            if (!el) {
                throw new Error(`Target container not found: ${config.container}`);
            }
            this.containerEl = el;
        }
        else {
            this.containerEl = config.container;
        }
        this.initLayout();
        void this.refreshToken();
    }
    initLayout() {
        const isDark = (this.config.theme ?? "dark") === "dark";
        const bg = isDark ? "#09090b" : "#ffffff";
        const fg = isDark ? "#f4f4f5" : "#09090b";
        const border = isDark ? "#27272a" : "#e4e4e7";
        this.containerEl.innerHTML = `
      <div class="setsig-kiosk-card" style="
        background: ${bg};
        color: ${fg};
        border: 1px solid ${border};
        border-radius: 16px;
        padding: 24px;
        max-width: 380px;
        margin: 0 auto;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      ">
        <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin-bottom: 8px;">
          Proof of Physical Presence
        </div>
        <div id="setsig-qr-target" style="
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${isDark ? "#18181b" : "#f4f4f5"};
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
        ">
          <div style="font-size: 13px; color: #71717a;">Loading dynamic presence token...</div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; padding: 0 8px;">
          <div style="text-align: left;">
            <div style="font-size: 11px; color: #71717a; text-transform: uppercase;">Dynamic Code</div>
            <div id="setsig-dynamic-code" style="font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 2px;">
              ------
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="36" height="36" viewBox="0 0 36 36" style="transform: rotate(-90deg);">
              <circle cx="18" cy="18" r="15" fill="none" stroke="${isDark ? "#27272a" : "#e4e4e7"}" stroke-width="3"></circle>
              <circle id="setsig-progress-circle" cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" stroke-width="3"
                stroke-dasharray="94.25" stroke-dashoffset="0" style="transition: stroke-dashoffset 1s linear;"></circle>
            </svg>
            <span id="setsig-timer-text" style="font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;">
              ${this.secondsRemaining}s
            </span>
          </div>
        </div>
      </div>
    `;
    }
    async refreshToken() {
        if (this.isDestroyed)
            return;
        const baseUrl = (this.config.baseUrl ?? "https://api.setsig.com").replace(/\/$/, "");
        try {
            const resp = await fetch(`${baseUrl}/v1/tokens/generate`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    venue_id: this.config.venueId,
                    ttl: this.currentTtl,
                    format: "svg",
                }),
            });
            if (!resp.ok) {
                throw new Error(`Failed to generate dynamic token: HTTP ${resp.status}`);
            }
            const envelope = (await resp.json());
            const data = envelope.data;
            const token = {
                tokenId: data.token_id,
                venueId: data.venue_id,
                dynamicCode: data.dynamic_code,
                expiresAt: data.expires_at,
                payload: data.payload,
            };
            if (data.qr_svg) {
                token.qrSvg = data.qr_svg;
            }
            this.updateDisplay(token);
            this.secondsRemaining = this.currentTtl;
            this.startCountdown();
            if (this.config.onTokenGenerated) {
                this.config.onTokenGenerated(token);
            }
        }
        catch (err) {
            if (this.config.onError && err instanceof Error) {
                this.config.onError(err);
            }
            // Retry in 5 seconds on failure
            this.secondsRemaining = 5;
            this.startCountdown();
        }
    }
    updateDisplay(token) {
        const qrTarget = this.containerEl.querySelector("#setsig-qr-target");
        const codeEl = this.containerEl.querySelector("#setsig-dynamic-code");
        if (qrTarget && token.qrSvg) {
            qrTarget.innerHTML = token.qrSvg;
        }
        if (codeEl) {
            codeEl.textContent = token.dynamicCode;
        }
    }
    startCountdown() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        const circle = this.containerEl.querySelector("#setsig-progress-circle");
        const text = this.containerEl.querySelector("#setsig-timer-text");
        const circumference = 94.25; // 2 * pi * 15
        const tick = () => {
            if (this.isDestroyed)
                return;
            this.secondsRemaining--;
            if (text) {
                text.textContent = `${Math.max(0, this.secondsRemaining)}s`;
            }
            if (circle) {
                const fraction = Math.max(0, this.secondsRemaining) / this.currentTtl;
                circle.style.strokeDashoffset = `${circumference * (1 - fraction)}`;
            }
            if (this.secondsRemaining <= 0) {
                if (this.timerId !== null) {
                    clearInterval(this.timerId);
                    this.timerId = null;
                }
                void this.refreshToken();
            }
        };
        this.timerId = window.setInterval(tick, 1000);
    }
    /**
     * Destroys the kiosk instance, clears active interval timers, and empties container.
     */
    destroy() {
        this.isDestroyed = true;
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.containerEl.innerHTML = "";
    }
}
//# sourceMappingURL=kiosk.js.map