import type { ClerkRuntimeError } from "@clerk/types";

declare global {
  interface Window {
    Clerk?: any;
  }
}

export {};