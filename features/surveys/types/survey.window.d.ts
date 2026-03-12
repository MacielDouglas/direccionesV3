export {};

declare global {
  interface Window {
    __surveyAction: (action: "confirm" | "cancel", pinId: string) => void;
    __removeLocalPin: (tmpId: string) => void;
  }
}
