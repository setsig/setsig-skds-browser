/**
 * Configuration options for the Setsig browser / kiosk display client.
 */
export interface KioskConfig {
  venueId: string;
  apiKey: string;
  baseUrl?: string;
  refreshIntervalSeconds?: number;
  container: HTMLElement | string;
  theme?: "dark" | "light";
  onTokenGenerated?: (token: GeneratedKioskToken) => void;
  onError?: (error: Error) => void;
}

export interface GeneratedKioskToken {
  tokenId: string;
  venueId: string;
  dynamicCode: string;
  expiresAt: string;
  qrSvg?: string;
  payload: string;
}

export interface CameraCaptureOptions {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
}

export interface ForensicSnapshot {
  blob: Blob;
  dataUrl: string;
  capturedAt: string;
  dimensions: {
    width: number;
    height: number;
  };
}

