export class SetsigError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code = "ERR_SETSIG_SDK", statusCode, details) {
        super(message);
        this.name = "SetsigError";
        this.code = code;
        if (statusCode !== undefined) {
            this.statusCode = statusCode;
        }
        if (details !== undefined) {
            this.details = details;
        }
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class AuthenticationError extends SetsigError {
    constructor(message = "Invalid or missing setsig API key", details) {
        super(message, "ERR_UNAUTHORIZED", 401, details);
        this.name = "AuthenticationError";
    }
}
export class InsufficientCreditsError extends SetsigError {
    constructor(message = "Insufficient prepaid balance for presence verification", details) {
        super(message, "ERR_INSUFFICIENT_CREDITS", 402, details);
        this.name = "InsufficientCreditsError";
    }
}
export class PaywallBlockedError extends SetsigError {
    paywallUrl;
    currentBalance;
    requiredMinTopup;
    constructor(message = "Verification services locked due to zero or depleted prepaid balance", details) {
        super(message, "ERR_PAYWALL_BLOCKED", 402, details);
        this.name = "PaywallBlockedError";
        if (details && typeof details === "object") {
            const d = details;
            if (typeof d.paywall_url === "string")
                this.paywallUrl = d.paywall_url;
            if (typeof d.current_balance === "number")
                this.currentBalance = d.current_balance;
            if (typeof d.required_min_topup === "number")
                this.requiredMinTopup = d.required_min_topup;
        }
    }
}
export class CrossBorderCreditRequiredError extends SetsigError {
    constructor(message = "Cross-border venue verification requires local currency credit or FX conversion", details) {
        super(message, "ERR_CROSS_BORDER_CREDIT_REQUIRED", 402, details);
        this.name = "CrossBorderCreditRequiredError";
    }
}
export class PaywallTierRequiredError extends SetsigError {
    constructor(message = "Feature requires a higher subscription tier level", details) {
        super(message, "ERR_PAYWALL_TIER_REQUIRED", 403, details);
        this.name = "PaywallTierRequiredError";
    }
}
export class AttestationFailedError extends SetsigError {
    constructor(message = "Hardware attestation failed: untrusted enclave or rooted device", details) {
        super(message, "ERR_ATTESTATION_FAILED", 403, details);
        this.name = "AttestationFailedError";
    }
}
export class VisualProofRequiredError extends SetsigError {
    constructor(message = "Venue policy strictly requires visual photo proof of presence", details) {
        super(message, "ERR_VISUAL_PROOF_REQUIRED", 422, details);
        this.name = "VisualProofRequiredError";
    }
}
export class StaleVisualProofError extends SetsigError {
    constructor(message = "Visual proof photo expired: must be taken within 10 seconds of scanning", details) {
        super(message, "ERR_STALE_VISUAL_PROOF", 400, details);
        this.name = "StaleVisualProofError";
    }
}
export class InvalidImageHashError extends SetsigError {
    constructor(message = "Visual proof SHA-256 hash mismatch: photo integrity compromised", details) {
        super(message, "ERR_INVALID_IMAGE_HASH", 400, details);
        this.name = "InvalidImageHashError";
    }
}
export class ReplayAttackError extends SetsigError {
    constructor(message = "Single-use token already consumed (replay attack detected)", details) {
        super(message, "ERR_REPLAY_DETECTED", 409, details);
        this.name = "ReplayAttackError";
    }
}
export class GeofenceOutOfBoundsError extends SetsigError {
    constructor(message = "Client coordinates outside authorized venue radius", details) {
        super(message, "ERR_GEOFENCE_OUT_OF_BOUNDS", 400, details);
        this.name = "GeofenceOutOfBoundsError";
    }
}
//# sourceMappingURL=errors.js.map