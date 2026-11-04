(function (global) {
  'use strict';

  function SetsigKiosk(config) {
    this.config = config;
    this.currentTtl = config.refreshIntervalSeconds || 60;
    this.secondsRemaining = this.currentTtl;
    this.timerId = null;
    this.isDestroyed = false;

    if (typeof config.container === 'string') {
      var el = document.querySelector(config.container);
      if (!el) {
        throw new Error('SetsigKiosk: container element not found: ' + config.container);
      }
      this.containerEl = el;
    } else {
      this.containerEl = config.container;
    }

    this.initLayout();
    this.refreshToken();
  }

  SetsigKiosk.prototype.initLayout = function () {
    var isDark = (this.config.theme || 'dark') === 'dark';
    var bg = isDark ? '#09090b' : '#ffffff';
    var fg = isDark ? '#f4f4f5' : '#09090b';
    var border = isDark ? '#27272a' : '#e4e4e7';

    this.containerEl.innerHTML =
      '<div class="setsig-kiosk-card" style="' +
      'background:' + bg + ';color:' + fg + ';border:1px solid ' + border + ';' +
      'border-radius:16px;padding:24px;max-width:380px;margin:0 auto;' +
      'font-family:system-ui,-apple-system,sans-serif;text-align:center;' +
      'box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">' +
      '<div style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#a1a1aa;margin-bottom:8px;">' +
      'Proof of Physical Presence' +
      '</div>' +
      '<div id="setsig-qr-target" style="' +
      'min-height:240px;display:flex;align-items:center;justify-content:center;' +
      'background:' + (isDark ? '#18181b' : '#f4f4f5') + ';border-radius:12px;padding:16px;margin:16px 0;">' +
      '<div style="font-size:13px;color:#71717a;">Loading dynamic presence token...</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding:0 8px;">' +
      '<div style="text-align:left;">' +
      '<div style="font-size:11px;color:#71717a;text-transform:uppercase;">Dynamic Code</div>' +
      '<div id="setsig-dynamic-code" style="font-family:monospace;font-size:20px;font-weight:700;letter-spacing:2px;">------</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
      '<svg width="36" height="36" viewBox="0 0 36 36" style="transform:rotate(-90deg);">' +
      '<circle cx="18" cy="18" r="15" fill="none" stroke="' + (isDark ? '#27272a' : '#e4e4e7') + '" stroke-width="3"></circle>' +
      '<circle id="setsig-progress-circle" cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="94.25" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear;"></circle>' +
      '</svg>' +
      '<span id="setsig-timer-text" style="font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;">' +
      this.secondsRemaining + 's' +
      '</span>' +
      '</div>' +
      '</div>' +
      '</div>';
  };

  SetsigKiosk.prototype.refreshToken = function () {
    if (this.isDestroyed) return;
    var self = this;
    var baseUrl = (this.config.baseUrl || 'https://api.setsig.com').replace(/\/$/, '');

    fetch(baseUrl + '/v1/tokens/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        venue_id: this.config.venueId,
        ttl: this.currentTtl,
        format: 'svg'
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (envelope) {
        var data = envelope.data;
        var qrTarget = self.containerEl.querySelector('#setsig-qr-target');
        var codeEl = self.containerEl.querySelector('#setsig-dynamic-code');

        if (qrTarget && data.qr_svg) qrTarget.innerHTML = data.qr_svg;
        if (codeEl) codeEl.textContent = data.dynamic_code;

        self.secondsRemaining = self.currentTtl;
        self.startCountdown();

        if (typeof self.config.onTokenGenerated === 'function') {
          self.config.onTokenGenerated(data);
        }
      })
      .catch(function (err) {
        if (typeof self.config.onError === 'function') {
          self.config.onError(err);
        }
        self.secondsRemaining = 5;
        self.startCountdown();
      });
  };

  SetsigKiosk.prototype.startCountdown = function () {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    var self = this;
    var circle = this.containerEl.querySelector('#setsig-progress-circle');
    var text = this.containerEl.querySelector('#setsig-timer-text');
    var circumference = 94.25;

    this.timerId = setInterval(function () {
      if (self.isDestroyed) return;

      self.secondsRemaining--;
      if (text) text.textContent = Math.max(0, self.secondsRemaining) + 's';
      if (circle) {
        var fraction = Math.max(0, self.secondsRemaining) / self.currentTtl;
        circle.style.strokeDashoffset = String(circumference * (1 - fraction));
      }

      if (self.secondsRemaining <= 0) {
        clearInterval(self.timerId);
        self.timerId = null;
        self.refreshToken();
      }
    }, 1000);
  };

  SetsigKiosk.prototype.destroy = function () {
    this.isDestroyed = true;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.containerEl.innerHTML = '';
  };

  SetsigKiosk.mount = function (container, options) {
    return new SetsigKiosk(Object.assign({ container: container }, options));
  };

  // Auto-initialize from script tag data attributes if present
  if (typeof document !== 'undefined') {
    var currentScript = document.currentScript;
    if (currentScript) {
      var venueId = currentScript.getAttribute('data-venue');
      var apiKey = currentScript.getAttribute('data-api-key');
      var containerSelector = currentScript.getAttribute('data-container');
      if (venueId && apiKey && containerSelector) {
        document.addEventListener('DOMContentLoaded', function () {
          SetsigKiosk.mount(containerSelector, {
            venueId: venueId,
            apiKey: apiKey,
            baseUrl: currentScript.getAttribute('data-base-url') || undefined,
            theme: currentScript.getAttribute('data-theme') || 'dark'
          });
        });
      }
    }
  }

  global.SetsigKiosk = SetsigKiosk;
})(typeof window !== 'undefined' ? window : globalThis);

