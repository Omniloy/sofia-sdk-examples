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
}

export interface PatientData {
  extraData: Record<string, string>;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
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
    };
  }
}

export {};
