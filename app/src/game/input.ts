/**
 * Unified action map (master design document 4.2): keyboard, gamepad, and
 * touch all feed the same logical actions. Remappable keyboard bindings,
 * gamepad dead zones, hot-plug-safe polling, pause handling.
 */

export type Action =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'jump'
  | 'ability'
  | 'context'
  | 'pause'
  | 'confirm'
  | 'cancel';

export type BindingMap = Record<Action, string[]>;

export const DEFAULT_BINDINGS: BindingMap = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'KeyW', 'ArrowUp'],
  ability: ['KeyX', 'KeyJ'],
  context: ['KeyE', 'KeyC'],
  pause: ['Escape', 'KeyP'],
  confirm: ['Enter', 'Space'],
  cancel: ['Escape', 'Backspace'],
};

/** Standard gamepad mapping (button index -> action). */
const PAD_BUTTONS: Partial<Record<number, Action>> = {
  0: 'jump', // A / Cross
  1: 'ability', // B / Circle
  2: 'context', // X / Square
  9: 'pause', // Start
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
};

const DEAD_ZONE = 0.25;

export class InputManager {
  private bindings: BindingMap;
  private keyDown = new Set<string>();
  private touchActions = new Set<Action>();
  private padActions = new Set<Action>();
  private pressedThisFrame = new Set<Action>();
  private releasedThisFrame = new Set<Action>();
  private downActions = new Set<Action>();

  constructor(bindings: BindingMap = DEFAULT_BINDINGS) {
    this.bindings = structuredClone(bindings);
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keyDown.add(e.code);
      if (this.actionFor(e.code) !== null && e.code !== 'Tab') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keyDown.delete(e.code);
    });
    window.addEventListener('blur', () => this.keyDown.clear());
  }

  rebind(action: Action, codes: string[]): void {
    this.bindings[action] = [...codes];
  }

  getBindings(): BindingMap {
    return structuredClone(this.bindings);
  }

  private actionFor(code: string): Action | null {
    for (const [action, codes] of Object.entries(this.bindings) as [Action, string[]][]) {
      if (codes.includes(code)) return action;
    }
    return null;
  }

  /* Touch layer: DOM buttons call these (multitouch-safe). */
  touchPress(action: Action): void {
    this.touchActions.add(action);
  }

  touchRelease(action: Action): void {
    this.touchActions.delete(action);
  }

  /** Poll gamepads + compose all sources. Call once per frame BEFORE reads. */
  update(): void {
    this.pressedThisFrame.clear();
    this.releasedThisFrame.clear();

    this.padActions.clear();
    const pads = navigator.getGamepads?.() ?? [];
    for (const pad of pads) {
      if (pad === null) continue;
      for (const [indexStr, action] of Object.entries(PAD_BUTTONS)) {
        if (action === undefined) continue;
        const index = Number(indexStr);
        if (pad.buttons[index]?.pressed === true) this.padActions.add(action);
      }
      const x = pad.axes[0] ?? 0;
      const y = pad.axes[1] ?? 0;
      if (x < -DEAD_ZONE) this.padActions.add('left');
      if (x > DEAD_ZONE) this.padActions.add('right');
      if (y < -DEAD_ZONE) this.padActions.add('up');
      if (y > DEAD_ZONE) this.padActions.add('down');
    }

    const next = new Set<Action>(this.touchActions);
    for (const code of this.keyDown) {
      const action = this.actionFor(code);
      if (action !== null) next.add(action);
    }
    for (const action of this.padActions) next.add(action);

    for (const action of next) {
      if (!this.downActions.has(action)) this.pressedThisFrame.add(action);
    }
    for (const action of this.downActions) {
      if (!next.has(action)) this.releasedThisFrame.add(action);
    }
    this.downActions = next;
  }

  isDown(action: Action): boolean {
    return this.downActions.has(action);
  }

  justPressed(action: Action): boolean {
    return this.pressedThisFrame.has(action);
  }

  justReleased(action: Action): boolean {
    return this.releasedThisFrame.has(action);
  }

  /** -1, 0, or 1 for the fixed-timestep controller. */
  get moveX(): number {
    return (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
  }
}