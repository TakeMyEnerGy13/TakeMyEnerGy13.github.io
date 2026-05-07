import { createContext, useContext } from 'react';

export type LensRegistry = {
  register: (el: HTMLElement) => () => void;
};

export const LensContext = createContext<LensRegistry | null>(null);

export function useLensRegistry() {
  const ctx = useContext(LensContext);
  if (!ctx) {
    throw new Error('useLensRegistry must be used within <LensProvider>');
  }
  return ctx;
}
