/* Playwright globalSetup: take the shared heavy-job lock before any test runs (see coord-lock.ts) */
import { takeLock } from './coord-lock';

export default async function globalSetup(): Promise<void> {
  await takeLock('playwright ' + process.argv.slice(2).filter((a) => a.startsWith('--project') || a.startsWith('--shard')).join(' '));
}
