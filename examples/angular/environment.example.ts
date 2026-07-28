export const environment = {
  production: false,
  sdk: {
    baseUrl: '',                     // optional — leave empty unless Omniloy tells you your key needs it
    apiKey: 'YOUR_API_KEY',          // authentication key from Omniloy
    userId: 'YOUR_DEFAULT_USER_ID',
    patientId: 'YOUR_DEFAULT_PATIENT_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    userMedicalSpecialty: '',        // optional (SDK 1.0.9+) — attached to tracked events for analytics
    language: 'es',
    isOpen: true,
    debug: true
  }
};
