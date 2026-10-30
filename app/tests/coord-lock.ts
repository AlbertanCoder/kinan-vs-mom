/* Shared-laptop rule (Shad, 2026-10-29): Playwright runs are heavy jobs, so every run takes the machine's heavy-job lock
   (~/claude-coord/coord.js, written by the physics-v2 session) before it starts and gives it back when it ends. While
   someone else holds it, or the CPU is at 90 C or more, or memory is under the floor, coord.js refuses and the run waits
   (a reading a minute). Each copy of the repo locks under its own name (kinan-<KVM_PORT>), so two of our own runs take
   turns too. No ~/claude-coord on this machine (or CI): nothing happens. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const COORD = join(homedir(), 'claude-coord', 'coord.js');
const LOCK_FILE = join(homedir(), 'claude-coord', 'heavy.lock');
export const coordName = (): string => 'kinan-' + (process.env.KVM_PORT || '4174');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/* the lock file names us? (coord.js's lock is not atomic: two takers in the same second both got "LOCK" on 2026-10-29
   23:15:19 and the second overwrote the first, so after taking it we read it back before running) */
const lockIsOurs = (): boolean => { try { return JSON.parse(readFileSync(LOCK_FILE, 'utf8')).who === coordName(); } catch { return false; } };

export async function takeLock(task: string, minutes = 30, maxWaitMin = 90): Promise<void> {
  if (!existsSync(COORD)) return;
  const until = Date.now() + maxWaitMin * 60_000;
  for (;;) {
    let why = '';
    try {
      execFileSync('node', [COORD, 'lock', coordName(), task, String(minutes)], { stdio: 'pipe' });
      await sleep(1500);
      if (lockIsOurs()) return;
      why = 'another run took the lock in the same moment';
    } catch (e) { why = String((e as { stdout?: Buffer }).stdout || '').trim().split('\n')[0]; }
    if (Date.now() > until) throw new Error(`coord lock not granted in ${maxWaitMin} min: ${why}`);
    console.log(`[coord] waiting for the heavy-job lock: ${why}`);
    await sleep(60_000 + Math.floor(Math.random() * 20_000));   /* a little random, so two waiting runs don't retry in step */
  }
}
export function dropLock(): void {
  if (!existsSync(COORD)) return;
  try { execFileSync('node', [COORD, 'unlock', coordName()], { stdio: 'pipe' }); } catch { /* not ours / already free */ }
}
