// Keyboard + touch + gamepad input.
// Keyboard: WASD/arrows move, Space jump, Shift run (on ground) / butt slam (pressed in the air),
//           F or J = ACTION (grab, carry, throw, push/pull, confetti; in the air: butt slam), Q/E turn the camera.
// Touch (iPhone / tablet): left side = floating joystick (push far = run), JUMP button, ACTION button,
//           drag on the right side turns the camera.
// Gamepad (standard mapping): left stick / d-pad move (full tilt runs), right stick camera, A jump, B or X action,
//           LT / RT / Y butt slam, LB / RB turn the camera, Start pause.
// Mouse drag on the game also turns the camera on a laptop.
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

    root.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') showTouchUI();
      this.anyEdge = true;
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
    return this.enabled && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || stickRun || padRun);
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
