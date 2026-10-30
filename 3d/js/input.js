// Keyboard + touch + gamepad input.
// Keyboard: WASD/arrows move, Space jump, Shift run (on ground) / butt slam (pressed in the air),
//           F or J = ACTION (grab, carry, throw, push/pull, confetti; in the air: butt slam), Q/E turn the camera.
// Touch (iPhone / tablet): left side = floating joystick (push far = run), JUMP button, ACTION button,
//           drag on the right side turns the camera.
// Gamepad (standard mapping): left stick / d-pad move (full tilt runs), right stick camera, A jump, B or X action,
//           LT / RT / Y butt slam, LB / RB turn the camera, Start pause.
// Mouse drag on the game also turns the camera on a laptop.
// SIDE MODE (2.5D level, setSide(true)): left/right run, up/down climb (keys are not mixed into one direction),
//           no camera turning; on touch the floating joystick is replaced by the 2D game's see-through buttons:
//           ◀ ▶ with ▲ ▼ bottom-left (slide a thumb between them; hold ◀ or ▶ a moment = run), JUMP + ACTION bottom-right.
import { clamp } from './util.js';

const MOVE_KEYS = {
  KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0],
};
const BLOCK = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);
const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

export class Input {
  constructor(root) {
    this.keys = new Set();
    this.pressed = new Set();      // pressed since last frame (edge)
    this.move = { x: 0, y: 0 };    // x = right, y = forward, length 0..1
    this.camDX = 0; this.camDY = 0; // camera drag this frame (pixels)
    this.touchJump = false; this.touchJumpEdge = false;
    this.touchActionEdge = false;
    this.usingTouch = false; this.usingPad = false;
    this.anyEdge = false;          // any key/button this frame (used to dismiss cards)
    this.enabled = true;
    this.pad = { held: new Array(17).fill(false), edge: new Array(17).fill(false), lx: 0, ly: 0, rx: 0, ry: 0, on: false };
    this.side = false; this.sideHeld = { left: false, right: false, up: false, down: false }; this.sideRunFrom = 0;

    window.addEventListener('keydown', (e) => {
      if (BLOCK.has(e.code)) e.preventDefault();
      if (!e.repeat) { this.pressed.add(e.code); this.anyEdge = true; }
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => { this.keys.delete(e.code); });
    window.addEventListener('blur', () => { this.keys.clear(); });

    this._setupTouch(root);
    // phones and tablets: show the touch controls (and the touch how-to card) straight away
    try { if (matchMedia('(pointer: coarse)').matches && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)) { this.usingTouch = true; document.body.classList.add('touch'); } } catch (e) { /* old browser */ }
  }

  _setupTouch(root) {
    const stick = document.getElementById('stick');
    const knob = document.getElementById('stick-knob');
    const jumpBtn = document.getElementById('btn-jump');
    const actBtn = document.getElementById('btn-action');
    this.stickId = null; this.camId = null;
    this.stickOrigin = { x: 0, y: 0 }; this.stickVec = { x: 0, y: 0 };
    const R = 62;

    const showTouchUI = () => {
      if (!this.usingTouch) { this.usingTouch = true; document.body.classList.add('touch'); }
    };
    const btn = (el, down, up) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); showTouchUI(); try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } el.classList.add('down'); down(); this.anyEdge = true; });
      const end = () => { el.classList.remove('down'); up && up(); };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
    };
    btn(jumpBtn, () => { this.touchJump = true; this.touchJumpEdge = true; }, () => { this.touchJump = false; });
    btn(actBtn, () => { this.touchActionEdge = true; });

    this._showTouchUI = showTouchUI;
    root.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') showTouchUI();
      this.anyEdge = true;
      if (this.side) return;   // 2.5D: no joystick and no camera drag (the side pad has its own buttons)
      const w = window.innerWidth;
      if (e.pointerType === 'touch' && e.clientX < w * 0.45 && this.stickId === null) {
        this.stickId = e.pointerId;
        this.stickOrigin = { x: e.clientX, y: e.clientY };
        this.stickVec = { x: 0, y: 0 };
        if (stick) { stick.style.left = e.clientX + 'px'; stick.style.top = e.clientY + 'px'; stick.classList.add('on'); }
        if (knob) knob.style.transform = 'translate(-50%,-50%)';
      } else if (this.camId === null) {
        this.camId = e.pointerId; this.camLast = { x: e.clientX, y: e.clientY };
      }
      try { root.setPointerCapture && root.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    });
    root.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.stickId) {
        let dx = e.clientX - this.stickOrigin.x, dy = e.clientY - this.stickOrigin.y;
        const d = Math.hypot(dx, dy);
        if (d > R) { dx *= R / d; dy *= R / d; }
        this.stickVec = { x: dx / R, y: -dy / R };
        if (knob) knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      } else if (e.pointerId === this.camId) {
        this.camDX += e.clientX - this.camLast.x; this.camDY += e.clientY - this.camLast.y;
        this.camLast = { x: e.clientX, y: e.clientY };
      }
    });
    const end = (e) => {
      if (e.pointerId === this.stickId) {
        this.stickId = null; this.stickVec = { x: 0, y: 0 };
        if (stick) stick.classList.remove('on');
      }
      if (e.pointerId === this.camId) this.camId = null;
    };
    root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
    // Stop iOS from scrolling/zooming the page.
    document.addEventListener('touchmove', (e) => { if (e.target.closest && e.target.closest('#game,#touch')) e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  // 2.5D side mode: swap the joystick for the side pad and say so on the title / pause cards
  setSide(on) {
    this.side = !!on;
    if (!this.side) return;
    document.body.classList.add('side');
    this.stickId = null; this.camId = null;
    const KEYS = '<b>A D / &larr; &rarr;</b><span>run left and right &middot; SHIFT runs faster</span><b>W S / &uarr; &darr;</b><span>climb up and down</span><b>SPACE</b><span>jump &middot; again in the air = DOUBLE JUMP</span><b>F (or J)</b><span>ACTION: KICK, lift, throw, grab &middot; in the air: BUTT SLAM &middot; P pause &middot; M music</span>';
    const TOUCH = '<b>&#9664; &#9654;</b><span>run (hold a moment = run fast)</span><b>&#9650; &#9660;</b><span>climb up and down</span><b>JUMP</b><span>jump &middot; tap again in the air = DOUBLE JUMP</span><b>ACTION</b><span>KICK, lift, throw, grab &middot; in the air: BUTT SLAM</span>';
    for (const sel of ['#titlecard .keys.key-only', '#pause .keys.key-only']) { const el = document.querySelector(sel); if (el) el.innerHTML = KEYS; }
    for (const sel of ['#titlecard .keys.touch-only', '#pause .keys.touch-only']) { const el = document.querySelector(sel); if (el) el.innerHTML = TOUCH; }
    const touch = document.getElementById('touch');
    if (!touch || document.getElementById('sidepad')) return;
    const pad = document.createElement('div');
    pad.id = 'sidepad';
    pad.innerHTML = '<button type="button" class="sbtn" data-k="left" aria-label="Move left">&#9664;</button>'
      + '<button type="button" class="sbtn" data-k="right" aria-label="Move right">&#9654;</button>'
      + '<div class="sp-ud"><button type="button" class="sbtn sm" data-k="up" aria-label="Climb up">&#9650;</button>'
      + '<button type="button" class="sbtn sm" data-k="down" aria-label="Climb down">&#9660;</button></div>';
    touch.appendChild(pad);
    const btns = [...pad.querySelectorAll('[data-k]')];
    // the nearest button under each finger (a thumb can slide from ◀ to ▶ without lifting)
    const nearest = (x, y) => {
      let best = null, bd = Infinity;
      for (const el of btns) {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) - r.width / 2;
        if (d < bd) { bd = d; best = el; }
      }
      return best && bd < 36 ? best.dataset.k : null;
    };
    const fingers = new Map();
    const refresh = () => {
      const was = this.sideHeld.left || this.sideHeld.right;
      for (const k of Object.keys(this.sideHeld)) this.sideHeld[k] = false;
      for (const k of fingers.values()) if (k) this.sideHeld[k] = true;
      for (const el of btns) el.classList.toggle('down', !!this.sideHeld[el.dataset.k]);
      const now = this.sideHeld.left || this.sideHeld.right;
      if (now && !was) this.sideRunFrom = performance.now();
    };
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation(); this._showTouchUI && this._showTouchUI();
      try { pad.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      fingers.set(e.pointerId, nearest(e.clientX, e.clientY)); refresh(); this.anyEdge = true;
    });
    pad.addEventListener('pointermove', (e) => { if (fingers.has(e.pointerId)) { fingers.set(e.pointerId, nearest(e.clientX, e.clientY)); refresh(); } });
    const end = (e) => { if (fingers.delete(e.pointerId)) refresh(); };
    pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end); pad.addEventListener('lostpointercapture', end);
  }

  _pollPad() {
    const P = this.pad;
    P.edge.fill(false);
    let gp = null;
    try {
      const list = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const g of list) if (g && g.connected !== false && g.buttons && g.buttons.length) { gp = g; break; }
    } catch (e) { gp = null; }
    if (!gp) { if (P.on) { P.on = false; P.held.fill(false); P.lx = P.ly = P.rx = P.ry = 0; } return; }
    P.on = true;
    let any = false;
    for (let i = 0; i < P.held.length; i++) {
      const b = gp.buttons[i];
      const v = !!(b && (b.pressed || b.value > 0.5));
      if (v && !P.held[i]) { P.edge[i] = true; any = true; }
      P.held[i] = v;
    }
    const ax = gp.axes || [];
    const dz = (v) => (Math.abs(v || 0) < 0.18 ? 0 : v);
    P.lx = dz(ax[0]); P.ly = dz(ax[1]); P.rx = dz(ax[2]); P.ry = dz(ax[3]);
    if (any || P.lx || P.ly) {
      this.anyEdge = this.anyEdge || any;
      if (!this.usingPad) { this.usingPad = true; document.body.classList.add('pad'); }
    }
  }

  update() {
    this._pollPad();
    const P = this.pad;
    let x = 0, y = 0;
    for (const k of this.keys) { const m = MOVE_KEYS[k]; if (m) { x += m[0]; y += m[1]; } }
    if (P.held[PAD.LEFT]) x -= 1; if (P.held[PAD.RIGHT]) x += 1; if (P.held[PAD.UP]) y += 1; if (P.held[PAD.DOWN]) y -= 1;
    const kl = Math.hypot(x, y);
    if (this.side) {
      // 2.5D: left/right and up/down are separate (holding up while running must not slow him down)
      const H = this.sideHeld;
      x = clamp(x + (H.right ? 1 : 0) - (H.left ? 1 : 0), -1, 1); y = clamp(y + (H.up ? 1 : 0) - (H.down ? 1 : 0), -1, 1);
      if (P.on && (P.lx || P.ly)) { x = clamp(P.lx * 1.1, -1, 1); y = clamp(-P.ly * 1.1, -1, 1); }
      this.move.x = x; this.move.y = y;
      return;
    }
    if (kl > 0) { x /= kl; y /= kl; }
    // keyboard: full tilt is "walk"; Shift turns it into a run (handled by player via runHeld)
    if (this.stickId !== null) {
      const sl = Math.hypot(this.stickVec.x, this.stickVec.y);
      const dz = 0.14;
      if (sl > dz) {
        const m = clamp((sl - dz) / (1 - dz), 0, 1);
        x = this.stickVec.x / sl * m; y = this.stickVec.y / sl * m;
      }
    }
    if (P.on && (P.lx || P.ly)) {
      const l = Math.min(1, Math.hypot(P.lx, P.ly));
      const m = clamp((l - 0.05) / 0.95, 0, 1);
      x = P.lx / (Math.hypot(P.lx, P.ly) || 1) * m; y = -P.ly / (Math.hypot(P.lx, P.ly) || 1) * m;
    }
    this.move.x = x; this.move.y = y;
    if (P.on) { this.camDX += P.rx * 9; this.camDY += P.ry * 5; }
  }

  get stickMag() { return Math.hypot(this.move.x, this.move.y); }
  get jumpPressed() { return this.enabled && (this.pressed.has('Space') || this.pressed.has('KeyK') || this.touchJumpEdge || this.pad.edge[PAD.A]); }
  get jumpHeld() { return this.enabled && (this.keys.has('Space') || this.keys.has('KeyK') || this.touchJump || this.pad.held[PAD.A]); }
  get runHeld() {
    // Touch and gamepad: pushing the stick nearly all the way runs.
    const stickRun = this.stickId !== null && Math.hypot(this.stickVec.x, this.stickVec.y) > 0.92;
    const padRun = this.pad.on && Math.hypot(this.pad.lx, this.pad.ly) > 0.9;
    // 2.5D touch: holding ◀ or ▶ for a moment breaks into a run
    const sideRun = this.side && (this.sideHeld.left || this.sideHeld.right) && performance.now() - this.sideRunFrom > 450;
    return this.enabled && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || stickRun || padRun || sideRun);
  }
  // butt slam only (Shift / LT / RT / Y); the ACTION button also slams in the air (the player decides)
  get poundPressed() { return this.enabled && (this.pressed.has('ShiftLeft') || this.pressed.has('ShiftRight') || this.pad.edge[PAD.LT] || this.pad.edge[PAD.RT] || this.pad.edge[PAD.Y]); }
  get actionPressed() { return this.enabled && (this.pressed.has('KeyF') || this.pressed.has('KeyJ') || this.touchActionEdge || this.pad.edge[PAD.B] || this.pad.edge[PAD.X]); }
  get camTurn() {
    let t = 0;
    if (this.keys.has('KeyQ') || this.pad.held[PAD.LB]) t -= 1;
    if (this.keys.has('KeyE') || this.pad.held[PAD.RB]) t += 1;
    return t;
  }
  // menus work even while gameplay input is disabled
  get pausePressed() { return this.pressed.has('Escape') || this.pressed.has('KeyP') || this.pad.edge[PAD.START]; }
  get confirmPressed() { return this.pressed.has('Space') || this.pressed.has('Enter') || this.pressed.has('KeyY') || this.touchJumpEdge || this.pad.edge[PAD.A] || this.pad.edge[PAD.START]; }
  get cancelPressed() { return this.pressed.has('KeyN') || this.pressed.has('Escape') || this.touchActionEdge || this.pad.edge[PAD.B]; }
  wasPressed(code) { return this.pressed.has(code); }

  endFrame() {
    this.pressed.clear();
    this.touchJumpEdge = false; this.touchActionEdge = false;
    this.pad.edge.fill(false);
    this.camDX = 0; this.camDY = 0; this.anyEdge = false;
  }
}
