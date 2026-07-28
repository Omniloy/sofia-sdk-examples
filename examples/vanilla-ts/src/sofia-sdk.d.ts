// The SDK's package.json "exports" entry for "." has no "types" condition, so
// TypeScript (moduleResolution: bundler) cannot see dist/webcomponents.d.ts.
// Minimal local declaration until the package publishes one.
declare module '@omniloy/sofia-sdk' {
  export const SofiaSDK: CustomElementConstructor;
}
