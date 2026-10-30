/* Playwright globalTeardown: give the shared heavy-job lock back the moment the run ends (see coord-lock.ts) */
import { dropLock } from './coord-lock';

export default async function globalTeardown(): Promise<void> {
  dropLock();
}
