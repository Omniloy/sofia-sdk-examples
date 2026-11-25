export interface AppConfig {
  patientId: string;
  userId: string;
  /** Optional. Omniloy tells you whether your key needs it. */
  baseUrl: string;
  apiKey: string;
  templateId: string;
  language?: string;
  isOpen: boolean;
  patientData?: PatientData;
  /** Optional (SDK 1.0.9+). Doctor's medical specialty, attached to tracked events for analytics. */
  userMedicalSpecialty?: string;
  /** Optional (SDK 1.0.13+). Version of your HIS/EMR, sent as the `x-his-version` header. */
  hisVersion?: string;
}

/**
 * Activity event delivered to `onEvent` (SDK 1.0.11+). Payloads are PHI-free:
 * only enums, booleans and numbers — never clinical text or identifiers.
 */
export interface SdkEvent {
  /** e.g. 'recording.started', 'report.settled', 'activity.typing' */
  name: string;
  family: 'recording' | 'activity' | 'report' | 'lifecycle';
  level: 'info' | 'warn' | 'error';
  /** ISO-8601 timestamp */
  ts: string;
  /** Monotonic per page load */
  seq: number;
  sdkVersion: string;
  sessionId: string | null;
  payload: Record<string, unknown>;
}

export interface PatientData {
  extraData: Record<string, string>;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  /**
   * Drives the consent indicator in the SDK header (enabled per API key by
   * Omniloy). `aiUse: 'refused'` (SDK 1.0.10+) blocks recording and reports.
   */
  signedConsent?: {
    signed: boolean;
    date: string;
    aiUse?: 'accepted' | 'refused' | 'pending';
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'sofia-sdk': HTMLElement & {
      readonly shadowRoot?: ShadowRoot;
      handleReport: (report: unknown) => void;
      setGetLastReport: (fn: () => Promise<unknown>) => void;
      setIsOpen: (newState: boolean | ((prevState: boolean) => boolean)) => void;
      // Insertion preview modal — receives the curated report on Apply (falls back to handleReport when disabled)
      onReportApply: (curated: unknown) => void;
      // EMR pre-fill — returns existing field content keyed by template property id
      updateTemplate: () =>
        | Record<string, unknown>
        | null
        | undefined
        | Promise<Record<string, unknown> | null | undefined>;
      // Optional class-name overrides for the insertion preview modal (shadow DOM)
      insertionPreviewClassNames: Record<string, string>;
      // Extras (SDK 1.0.9) — per-category action buttons; receives the extracted
      // items for the clicked category exactly as the schema produced them
      handleExtras: (extras: Array<Record<string, unknown>>) => void;
      // Activity stream (SDK 1.0.11+) — only delivers what `event-subscriptions` asks for
      onEvent: (event: SdkEvent) => void;
    };
  }
}

export {};
