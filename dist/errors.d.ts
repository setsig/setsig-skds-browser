export declare class SetsigError extends Error {
    readonly code: string;
    readonly statusCode?: number;
    readonly details?: unknown;
    constructor(message: string, code?: string, statusCode?: number, details?: unknown);
}
export declare class AuthenticationError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class InsufficientCreditsError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class PaywallBlockedError extends SetsigError {
    readonly paywallUrl?: string;
    readonly currentBalance?: number;
    readonly requiredMinTopup?: number;
    constructor(message?: string, details?: unknown);
}
export declare class CrossBorderCreditRequiredError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class PaywallTierRequiredError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class AttestationFailedError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class VisualProofRequiredError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class StaleVisualProofError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class InvalidImageHashError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class ReplayAttackError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
export declare class GeofenceOutOfBoundsError extends SetsigError {
    constructor(message?: string, details?: unknown);
}
//# sourceMappingURL=errors.d.ts.map