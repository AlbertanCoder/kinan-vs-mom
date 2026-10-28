// HUD: candles, golden candles, hearts, power-ups, pets, toasts, banner, Glitchy hints, title card, pause, help prompt, level clear.
// All markup lives in the level HTML page (ids below); styles in css/level.css.
const $ = (id) => document.getElementById(id);

const HEART = '<svg viewBox="0 0 16 14" aria-hidden="true"><path d="M8 13.5 1.6 7.2A3.9 3.9 0 0 1 8 2.4a3.9 3.9 0 0 1 6.4 4.8Z"/></svg>';
const GOLD = '<svg viewBox="0 0 20 30" aria-hidden="true"><path class="fl" d="M10 1c2.4 3 3.8 4.8 3.8 7a3.8 3.8 0 0 1-7.6 0c0-2.2 1.4-4 3.8-7Z"/><rect class="wk" x="9" y="11" width="2" height="2.6"/><rect class="bd" x="4.5" y="13.4" width="11" height="15.6" rx="2.6"/><path class="st" d="M4.5 18.5l11-3.4v2.6l-11 3.4Zm0 5.6 11-3.4v2.6l-11 3.4Z"/></svg>';
const POWERS = { popper: 'POPPER', hat: 'PARTY HAT', lasso: 'LASSO', umbrella: 'UMBRELLA', rush: 'SUGAR RUSH' };

export class HUD {
  constructor() {
    this.el = {
      candles: $('hud-candles'), candleTotal: $('hud-candle-total'), stars: $('hud-stars'), hearts: $('hud-hearts'),
      toast: $('toast'), banner: $('banner'), bannerSub: $('banner-sub'), hint: $('hint'), hintText: $('hint-text'),
      title: $('titlecard'), pause: $('pause'), clear: $('clear'), clearStats: $('clear-stats'), fade: $('fade'), fps: $('fps'),
      loading: $('loading'), powers: $('hud-powers'), pets: $('hud-pets'), ask: $('ask'), askText: $('ask-text'), action: $('btn-action'),
    };
    this.toastT = 0; this.bannerT = 0; this.hintT = 0; this.lastAction = '';
  }
  ready() {
    const el = this.el.loading;
    if (!el) return;
    el.classList.add('gone');
    setTimeout(() => { if (el.classList.contains('gone')) el.style.display = 'none'; }, 650);   // never leave it half-faded
  }
  candles(n, total) {
    this.el.candles.textContent = String(n);
    if (this.el.candleTotal) this.el.candleTotal.textContent = '/' + total;
    this.el.candles.parentElement.classList.remove('pop'); void this.el.candles.offsetWidth; this.el.candles.parentElement.classList.add('pop');
  }
  // golden candles (the rare big prize)
  stars(got, total = 3) {
    let h = '';
    for (let i = 0; i < total; i++) h += `<span class="gold ${got[i] ? 'got' : ''}">${GOLD}</span>`;
    this.el.stars.innerHTML = h;
  }
  hearts(n, max) {
    let h = '';
    for (let i = 0; i < max; i++) h += `<span class="heart ${i < n ? 'full' : ''}">${HEART}</span>`;
    this.el.hearts.innerHTML = h;
  }
  powers(pw) {
    if (!this.el.powers) return;
    const on = Object.keys(POWERS).filter((k) => (k === 'rush' ? pw.rush > 0 : pw[k]));
    this.el.powers.innerHTML = on.map((k) => `<span class="pw pw-${k}">${POWERS[k]}</span>`).join('');
  }
  pets(list) {
    if (!this.el.pets) return;
    this.el.pets.innerHTML = list.map((p) => `<span class="pet" style="--fur:${p.color};--shade:${p.shade}" title="${p.perk}"><i></i>${p.name}</span>`).join('');
  }
  action(label) {
    if (!this.el.action || label === this.lastAction) return;
    this.lastAction = label; this.el.action.textContent = label;
  }
  toast(text, time = 1.8) {
    this.el.toast.textContent = text; this.el.toast.classList.add('on'); this.toastT = time;
  }
  banner(title, sub, time = 2.6) {
    this.el.banner.firstElementChild.textContent = title; this.el.bannerSub.textContent = sub || '';
    this.el.banner.classList.add('on'); this.bannerT = time;
  }
  hint(text, time = 4.5) {
    this.el.hintText.textContent = text; this.el.hint.classList.add('on'); this.hintT = time;
  }
  ask(on, text) {
    if (!this.el.ask) return;
    if (text) this.el.askText.textContent = text;
    this.el.ask.classList.toggle('on', on);
  }
  title(on) { this.el.title.classList.toggle('on', on); }
  pause(on) { this.el.pause.classList.toggle('on', on); }
  fade(on) { this.el.fade.classList.toggle('on', on); }
  clear(stats) {
    const rows = [
      ['CANDLES', `${stats.candles} / ${stats.totalCandles}`],
      ['GOLDEN CANDLES', `${stats.golden} / ${stats.totalGolden}`],
      ['BOPS', String(stats.bops)],
      ['TIME', fmtTime(stats.time)],
    ];
    this.el.clearStats.innerHTML = rows.map(([k, v]) => `<div class="row"><span>${k}</span><b>${v}</b></div>`).join('');
    this.el.clear.classList.add('on');
  }
  update(dt) {
    if (this.toastT > 0) { this.toastT -= dt; if (this.toastT <= 0) this.el.toast.classList.remove('on'); }
    if (this.bannerT > 0) { this.bannerT -= dt; if (this.bannerT <= 0) this.el.banner.classList.remove('on'); }
    if (this.hintT > 0) { this.hintT -= dt; if (this.hintT <= 0) this.el.hint.classList.remove('on'); }
  }
}
export function fmtTime(s) {
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}
