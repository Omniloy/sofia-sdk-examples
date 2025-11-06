export interface AppConfig {
  patientId: string;
  userId: string;
  baseUrl: string;
  wssUrl: string;
  apiKey: string;
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
      toast?: {
        title: string;
        message: string;
        visible: string;
        variation: string;
      };
    };
  }
}


export {};