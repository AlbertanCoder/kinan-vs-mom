// Small math helpers shared by every module.
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
// Frame-rate independent smoothing: move a toward b, "rate" ~ 1/seconds.
export const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
export const approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));
export const TAU = Math.PI * 2;
export function wrapAngle(a) {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
}
export const angleDiff = (a, b) => wrapAngle(b - a);
export function dampAngle(a, b, rate, dt) {
  return a + angleDiff(a, b) * (1 - Math.exp(-rate * dt));
}
// Deterministic pseudo random (so levels look the same every load).
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
export const easeOutBack = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
