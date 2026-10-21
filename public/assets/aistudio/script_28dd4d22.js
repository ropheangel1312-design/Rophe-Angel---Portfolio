// Ripple grid: every click drops a ripple into a grid of dots.
// Nothing is simulated. A ripple is a ring growing at a steady speed, and every
// frame each dot asks how close it sits to each ring's edge. A Gaussian of that
// distance is how hard the ring pushes the dot, and the push fades as the ring
// ages. Rings add, so two that cross make a bigger bump where they meet.

const GAP = 22; // px between dots
const SPEED = 0.32; // px per ms
const WIDTH = 26; // the ring's half-width, as the Gaussian's sigma
const LIFE = 3400; // ms, by which a ring is at 2% and dropping it is invisible
const PUSH = 11; // px, the furthest a dot is shoved
const GROUND = "#0b0a14";
const HUE = "#73bde7"; // --orbit

/** How hard a dot at `distance` is pushed by a ring of `age` ms */
function ringStrength(distance, age) {
  const gap = distance - age * SPEED; // from the dot to the ring's edge
  const spread = 2 * WIDTH * WIDTH;
  const closeness = Math.exp(-(gap * gap) / spread);
  const fade = Math.exp(-age / 900);
  return closeness * fade;
}

const canvas = document.querySelector(".grid");
const ctx = canvas.getContext("2d");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let w, h, cols, rows, ox, oy;
let ripples = [];

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cols = Math.floor(w / GAP);
  rows = Math.floor(h / GAP);
  // Centre the grid in the frame
  ox = (w - (cols - 1) * GAP) / 2;
  oy = (h - (rows - 1) * GAP) / 2;
}

function draw(now) {
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = HUE;
  ripples = ripples.filter((r) => now - r.born < LIFE);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = ox + i * GAP;
      const y = oy + j * GAP;
      let dx = 0;
      let dy = 0;
      let lift = 0;

      for (const r of ripples) {
        const vx = x - r.x;
        const vy = y - r.y;
        const d = Math.hypot(vx, vy) || 1;
        const s = ringStrength(d, now - r.born);
        // Push outwards from the ripple's centre
        dx += (vx / d) * s * PUSH;
        dy += (vy / d) * s * PUSH;
        lift += s;
      }

      // Pushed dots also brighten and grow
      ctx.globalAlpha = Math.min(1, 0.28 + lift * 0.9);
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 1.4 + Math.min(lift, 1.5) * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

const drop = (x, y) => ripples.push({ x, y, born: performance.now() });

resize();

if (reduced) {
  // Two ripples caught mid-spread and crossing, drawn once
  const still = () => {
    const r = Math.min(w, h) * 0.3;
    ripples = [
      { x: w * 0.36, y: h * 0.5, born: -r / SPEED },
      { x: w * 0.64, y: h * 0.5, born: -(r * 0.8) / SPEED },
    ];
    draw(0);
  };
  still();
  addEventListener("resize", () => {
    resize();
    still();
  });
} else {
  addEventListener("resize", resize);

  let lastClick = 0;
  canvas.addEventListener("pointerdown", (e) => {
    const box = canvas.getBoundingClientRect();
    drop(e.clientX - box.left, e.clientY - box.top);
    lastClick = performance.now();
  });

  // Start with one ripple, and drop one now and then while nobody is clicking
  drop(w / 2, h / 2);
  setInterval(() => {
    if (performance.now() - lastClick > 6000) {
      drop(w * (0.2 + Math.random() * 0.6), h * (0.2 + Math.random() * 0.6));
    }
  }, 2600);

  const loop = (now) => {
    draw(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}