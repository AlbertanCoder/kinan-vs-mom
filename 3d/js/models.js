// Loads the approved character models (Kinan "braid1", the 6 family pets, Glitchy), the same files the World 12 map uses.
//  1. the real .glb (levels point at ../worlds/w12_assets/, which the local server and GitHub Pages serve)
//  2. if that fetch fails or returns something that is not a GLB (the claude.ai artifact preview cannot serve .glb files
//     or anything above 3d-levels/), assets/models.js: the same files packed as base64, loaded only when needed
//  3. null, and the caller builds its procedural stand-in (last resort only)
// After one .glb fetch fails, the rest go straight to the packed copy (no pile of failed requests).
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let loader = null, glbReachable = null, packP = null;
export const loadLog = {};            // name -> 'glb' | 'packed' | 'missing' (read by the tests)

async function fetchGLB(url) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), 10000) : 0;
  try {
    const r = await fetch(url, ctl ? { signal: ctl.signal } : undefined);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buf = await r.arrayBuffer();
    if (buf.byteLength < 20 || new DataView(buf).getUint32(0, true) !== 0x46546c67) throw new Error('not a GLB file');
    return buf;
  } finally { clearTimeout(timer); }
}

function packed() {
  if (!packP) packP = import('../assets/models.js').then((m) => m.default).catch((e) => { console.warn('assets/models.js not loaded:', e && e.message); return null; });
  return packP;
}

function fromBase64(s) {
  const bin = atob(s), n = bin.length, u = new Uint8Array(n);
  for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}

// name: the packed key ('kinan', 'glitchy', 'pet_cat1', ...); url: where the real .glb lives (or null to skip the fetch)
export async function loadModel(name, url) {
  loader = loader || new GLTFLoader();
  // In the game (2026-10-27) the .glb files are not shipped (a plain or artifact host may not serve them):
  // the packed copy comes first and works offline; a model missing from it still tries its .glb.
  const pk = await packed();
  if (pk && pk[name]) url = null;
  if (url && glbReachable !== false) {
    try {
      const buf = await fetchGLB(url);
      const gltf = await loader.parseAsync(buf, '');
      glbReachable = true; loadLog[name] = 'glb';
      return { gltf, from: 'glb' };
    } catch (e) {
      glbReachable = false;
      console.warn(`${name}.glb not available (${e && e.message}); using the packed copy in assets/models.js`);
    }
  }
  const pack = await packed();
  if (pack && pack[name]) {
    try {
      const gltf = await loader.parseAsync(fromBase64(pack[name]), '');
      loadLog[name] = 'packed';
      return { gltf, from: 'packed' };
    } catch (e) { console.warn(`packed ${name} did not parse:`, e && e.message); }
  }
  loadLog[name] = 'missing';
  return null;
}

// the .glb address for a pet id from a level's assets.pets template, e.g. '../worlds/w12_assets/pet_{id}.glb'
export const petURL = (tpl, id) => (tpl ? tpl.replace('{id}', id) : null);
