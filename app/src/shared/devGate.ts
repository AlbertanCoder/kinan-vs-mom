/**
 * Developer-tooling gate (Milestone 1 quarantine).
 *
 * Old 3D entry points and production debug unlocks are disabled everywhere
 * except when BOTH conditions hold: an explicit `?devtools=1` flag is present
 * AND the page is served from a local host. This keeps developer tooling
 * explicit, local, and non-production: a shared link or the live GitHub Pages
 * site can never enable it.
 *
 * The same policy is inlined in the legacy `index.html` reference build; the
 * e2e legacy-quarantine specs verify both sides against the real files.
 */

export interface DevGateContext {
  /** location.search, including the leading "?" (or an empty string) */
  readonly search: string;
  /** location.hostname */
  readonly hostname: string;
}

export const DEVTOOLS_FLAG = 'devtools';

const LOCAL_HOSTNAMES = /^(localhost|127\.0\.0\.1|\[::1\])$/;

export function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTNAMES.test(hostname);
}

export function hasDevToolsFlag(search: string): boolean {
  return new URLSearchParams(search).get(DEVTOOLS_FLAG) === '1';
}

/** Explicit + local + non-production. Never true on a deployed host. */
export function isDevToolsEnabled(ctx: DevGateContext): boolean {
  return hasDevToolsFlag(ctx.search) && isLocalHost(ctx.hostname);
}

/**
 * The quarantined legacy 3D experiment (galaxy3d*.js) may load only for
 * local developer reference — never in production, never via shared links.
 */
export function isLegacy3DAllowed(ctx: DevGateContext): boolean {
  return isDevToolsEnabled(ctx);
}
