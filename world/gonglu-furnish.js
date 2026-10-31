// Interior of the giant crafting-table tower: a warm little home in the
// example-home manner — living room around a TV wall, a sofa, a study desk
// against the built-in bookshelf wall and a bed in the south-east corner.
// Everything rides the tower's `model` BoxBatch (no extra draw calls); all
// lighting is baked, and each piece registers an obstacle for the nav.
import * as THREE from 'three';
import { canvasTexture } from '@engine/world/textures.js';

const FLOOR = 1;

const L = {
  oak: { tex: 'wood_panel', tint: 0xb4905a },
  walnut: { tex: 'walnut' },
  dark: { tex: 'paint', tint: 0x2a2d31 },
  steel: { tex: 'steel' },
  linen: { tex: 'linen' },
  sheet: { tex: 'paint', tint: 0xd8d3c8 },
  marble: { tex: 'prada_marble' },
  terra: { tex: 'paint', tint: 0x876b62 },
  rug: { tex: 'linen', tint: 0xb0a692 },
  mat: { tex: 'paint', tint: 0x4a4038 },
  leaf: { tex: 'leaves' },
  sage: tint => ({ tex: 'paint', tint }),
  glow: (tint, emissive = 1) => ({ tex: 'paint', tint, emissive }),
};

// A 16:9 code-editor wallpaper shared by both monitors, and one small painting.
const monitorArt = canvasTexture(256, 144, (ctx, w, h) => {
  ctx.fillStyle = '#1d2226';
  ctx.fillRect(0, 0, w, h);
  const tones = ['#7ec9a0', '#8fb7d8', '#d8c08a', '#c98f8f', '#9aa1a6'];
  for (let row = 0; row < 11; row++) {
    let x = 14 + (row % 4) * 10;
    const runs = 2 + (row * 7) % 4;
    for (let r = 0; r < runs && x < w - 30; r++) {
      const len = 18 + (row * 13 + r * 29) % 60;
      ctx.fillStyle = tones[(row + r) % tones.length];
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, 12 + row * 11, len, 5);
      ctx.globalAlpha = 1;
      x += len + 8;
    }
  }
  ctx.fillStyle = '#d8c08a';
  ctx.fillRect(w - 26, 12, 12, 5);
});
const bedArt = canvasTexture(128, 96, (ctx, w, h) => {
  // A quiet sunset over the sea, echoing the view outside the tower.
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#f2b46a');
  sky.addColorStop(1, '#e58a5a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.62);
  ctx.fillStyle = '#3e6c8e';
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillStyle = '#f8dfa8';
  ctx.beginPath();
  ctx.arc(w * 0.62, h * 0.5, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(62,108,142,0.55)';
  for (const [x, y, ww] of [[8, 78, 34], [52, 86, 44], [96, 80, 24]]) ctx.fillRect(x, y, ww, 2);
});

export function furnishGONGLU({ B, obstacles, bakes, surfaces }) {
  const foot = (x, z, w, d) => obstacles.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, level: 0 });
  const bake = (id, x, y, z, power, radius, direction = null) => bakes.push({ id, position: [x, y, z], power, radius, direction });
  const plane = (w, h, tex, x, y, z, ry = 0) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex ? new THREE.MeshLambertMaterial({ map: tex }) : new THREE.MeshBasicMaterial());
    mesh.position.set(x, y, z);
    mesh.rotation.set(0, ry, 0, 'YXZ');
    return mesh;
  };
  const planes = [];

  // ——— Living room: TV wall along the north wall ———
  B.box(-23.5, FLOOR, -0.55, 4.0, 0.5, 0.62, L.walnut);
  B.box(-23.5, FLOOR + 0.5, -0.55, 4.2, 0.06, 0.72, L.oak);
  B.box(-24.7, FLOOR + 0.56, -0.55, 0.4, 0.1, 0.26, L.dark);
  B.box(-22.25, FLOOR + 0.56, -0.6, 0.13, 0.3, 0.13, L.terra);
  foot(-23.5, -0.55, 4.3, 0.85);
  // The TV itself plays the engine's night-city footage.
  B.box(-23.5, FLOOR + 0.92, -0.97, 2.78, 1.64, 0.07, L.dark);
  const tv = plane(2.6, 1.46, null, -23.5, FLOOR + 1.71, -0.92);
  planes.push(tv);
  surfaces.tvScreen = tv;
  B.box(-23.5, FLOOR + 2.72, -0.9, 2.4, 0.05, 0.09, L.glow(0xffd9a0));
  bake('tv-wash', -23.5, FLOOR + 2.7, -0.6, 1.2, 6, [0, -0.9, 0.5]);

  // Sofa facing the TV, with a marble-top coffee table on a wool rug.
  B.box(-23.5, FLOOR + 0.01, 2.1, 4.6, 0.02, 3.6, L.rug);
  B.box(-23.5, FLOOR + 0.1, 3.75, 3.4, 0.38, 1.05, L.dark);
  B.box(-23.5, FLOOR + 0.48, 4.16, 3.4, 0.6, 0.22, L.dark);
  for (const x of [-25.05, -21.95]) B.box(x, FLOOR + 0.1, 3.75, 0.3, 0.6, 1.05, L.dark);
  B.box(-24.2, FLOOR + 0.48, 3.62, 1.5, 0.12, 0.85, { tex: 'paint', tint: 0x35393d });
  B.box(-22.8, FLOOR + 0.48, 3.62, 1.5, 0.12, 0.85, { tex: 'paint', tint: 0x35393d });
  B.box(-24.9, FLOOR + 0.55, 3.95, 0.42, 0.42, 0.14, L.sage(0x6e7f5e), { ry: 0.5 });
  B.box(-22.15, FLOOR + 0.55, 3.95, 0.42, 0.42, 0.14, L.sage(0x9a6a55), { ry: -0.4 });
  foot(-23.5, 3.8, 3.7, 1.3);
  B.box(-23.5, FLOOR + 0.4, 1.5, 1.3, 0.06, 0.7, L.marble);
  for (const [dx, dz] of [[-0.58, -0.28], [0.58, -0.28], [-0.58, 0.28], [0.58, 0.28]]) {
    B.box(-23.5 + dx, FLOOR, 1.5 + dz, 0.05, 0.4, 0.05, L.steel);
  }
  B.box(-23.75, FLOOR + 0.46, 1.42, 0.24, 0.05, 0.17, L.sage(0x8a4f3e));
  B.box(-23.15, FLOOR + 0.46, 1.55, 0.17, 0.045, 0.12, L.sheet);
  foot(-23.5, 1.5, 1.45, 0.85);
  B.box(-26.3, FLOOR, 3.4, 0.3, 0.04, 0.3, L.steel);
  B.box(-26.3, FLOOR + 0.04, 3.4, 0.06, 1.68, 0.06, L.steel);
  B.box(-26.3, FLOOR + 1.72, 3.4, 0.5, 0.24, 0.5, L.linen);
  B.box(-26.3, FLOOR + 1.7, 3.4, 0.36, 0.02, 0.36, L.glow(0xffe4ba));
  foot(-26.3, 3.4, 0.4, 0.4);
  bake('sofa-lamp', -26.3, FLOOR + 1.68, 3.4, 1.0, 6, [0, -1, 0]);

  // Two pendants over the rug, hung from the model's beam grid.
  for (const [i, x] of [-24.3, -22.7].entries()) {
    B.box(x, FLOOR + 3.6, 1.5, 0.04, 8.6, 0.04, L.steel);
    B.box(x, FLOOR + 3.52, 1.5, 0.5, 0.09, 0.5, L.steel);
    B.box(x, FLOOR + 3.49, 1.5, 0.36, 0.03, 0.36, L.glow(0xffe4ba));
    bake('pendant' + i, x, FLOOR + 3.4, 1.5, 3.2, 10, [0, -1, 0]);
  }

  // ——— Study nook: desk against the built-in bookshelf wall ———
  B.box(-26.5, FLOOR + 0.7, 10.35, 0.95, 0.07, 1.9, L.oak);
  for (const z of [9.55, 11.15]) B.box(-26.5, FLOOR, z, 0.7, 0.7, 0.08, L.steel);
  B.box(-26.45, FLOOR + 0.12, 11.02, 0.24, 0.46, 0.46, L.dark);
  B.box(-26.4, FLOOR + 0.79, 10.05, 0.34, 0.24, 0.2, L.dark, { ry: 0.3 });
  B.box(-26.35, FLOOR + 0.78, 10.4, 0.44, 0.025, 0.16, L.dark);
  B.box(-26.3, FLOOR + 0.78, 10.72, 0.08, 0.02, 0.12, L.steel);
  foot(-26.5, 10.35, 1.1, 2.0);
  for (const [i, z] of [10.02, 10.68].entries()) {
    B.box(-26.82, FLOOR + 0.83, z, 0.1, 0.3, 0.06, L.steel);
    B.box(-26.82, FLOOR + 1.1, z, 0.14, 0.05, 0.1, L.dark);
    planes.push(plane(0.76, 0.46, monitorArt, -26.74, FLOOR + 1.38, z, Math.PI / 2));
    if (i === 0) bake('desk-screen', -26.6, FLOOR + 1.4, z, 0.5, 3, [0.6, -0.2, 0]);
  }
  B.box(-26.78, FLOOR + 0.77, 9.55, 0.1, 0.3, 0.1, L.walnut);
  B.box(-26.78, FLOOR + 1.04, 9.55, 0.16, 0.14, 0.16, L.glow(0xffe4ba, 0.8));
  bake('desk-lamp', -26.7, FLOOR + 1.1, 10.3, 0.9, 4.5, [0, -1, 0.3]);
  bake('bookshelf-wash', -26.9, FLOOR + 2.3, 10.35, 0.9, 4.5, [-0.6, -0.4, 0]);
  ergonomicChair(B, -25.45, 10.35, Math.PI / 2);
  foot(-25.45, 10.35, 0.85, 0.85);

  // ——— Bedroom corner: bed against the south wall ———
  B.box(-16.6, FLOOR, 12.78, 2.1, 1.05, 0.14, L.walnut);
  B.box(-16.6, FLOOR + 0.6, 12.74, 1.7, 0.4, 0.06, L.sage(0x6e7f5e));
  B.box(-16.6, FLOOR, 11.3, 2.0, 0.3, 3.2, L.walnut);
  B.box(-16.6, FLOOR + 0.3, 11.25, 1.9, 0.28, 3.0, L.linen);
  B.box(-16.6, FLOOR + 0.58, 10.85, 1.9, 0.14, 2.15, L.sheet);
  for (const dx of [-0.48, 0.48]) B.box(-16.6 + dx, FLOOR + 0.58, 12.32, 0.86, 0.14, 0.5, { tex: 'paint', tint: 0xe4e0d6 });
  foot(-16.6, 11.3, 2.2, 3.4);
  for (const x of [-17.95, -15.25]) {
    B.box(x, FLOOR, 12.5, 0.55, 0.42, 0.5, L.oak);
    B.box(x, FLOOR + 0.42, 12.5, 0.6, 0.05, 0.55, L.walnut);
    B.box(x, FLOOR + 0.47, 12.5, 0.07, 0.22, 0.07, L.walnut);
    B.box(x, FLOOR + 0.66, 12.5, 0.18, 0.16, 0.18, L.glow(0xffe4ba, 0.8));
    foot(x, 12.5, 0.65, 0.6);
    bake('bedside' + (x < -16.6 ? '-w' : '-e'), x, FLOOR + 0.72, 12.4, 0.7, 3.5);
  }
  B.box(-16.6, FLOOR, 9.25, 1.6, 0.1, 0.45, { tex: 'paint', tint: 0x1f2224 });
  for (const dx of [-0.65, 0.65]) B.box(-16.6 + dx, FLOOR, 9.25, 0.07, 0.34, 0.4, L.steel);
  foot(-16.6, 9.25, 1.75, 0.6);
  B.box(-16.6, FLOOR + 1.9, 12.88, 1.0, 0.76, 0.06, L.walnut);
  planes.push(plane(0.88, 0.66, bedArt, -16.6, FLOOR + 1.9, 12.84, Math.PI));
  bake('bed-art', -16.6, FLOOR + 1.9, 12.6, 0.7, 3.5, [0, 0, -1]);
  B.box(-19.4, FLOOR + 0.01, 11.2, 1.8, 0.02, 2.4, L.rug);
  // Wardrobe on the north wall, east of the TV console — the bed corner
  // stays open and the east doorway keeps its approach.
  B.box(-17, FLOOR, -0.65, 2.4, 2.3, 0.62, L.walnut);
  B.box(-17, FLOOR + 1.15, -0.33, 0.02, 2.1, 0.03, L.dark);
  for (const x of [-17.6, -16.4]) B.box(x, FLOOR + 1.1, -0.33, 0.04, 0.3, 0.04, L.steel);
  B.box(-17, FLOOR + 2.34, -0.65, 2.2, 0.05, 0.55, L.glow(0xffe9c9));
  bake('wardrobe', -17, FLOOR + 2.4, -0.4, 0.8, 4, [0, -1, 0.4]);
  foot(-17, -0.65, 2.5, 0.8);

  // ——— Plants and door mats ———
  for (const [x, z, s] of [[-27.5, 0.4, 1], [-14.8, 2.6, 0.85], [-19.9, 12.5, 0.75]]) {
    B.box(x, FLOOR, z, 0.3 * s, 0.34 * s, 0.3 * s, L.terra);
    B.box(x, FLOOR + 0.34 * s, z, 0.34 * s, 0.06, 0.34 * s, L.terra);
    B.box(x, FLOOR + 0.4 * s, z, 0.62 * s, 0.5 * s, 0.62 * s, L.leaf);
    B.box(x, FLOOR + 0.82 * s, z, 0.4 * s, 0.3 * s, 0.4 * s, L.leaf);
    foot(x, z, 0.45 * s, 0.45 * s);
  }
  B.box(-21.5, FLOOR + 0.005, 12.2, 1.8, 0.02, 0.9, L.mat);
  B.box(-14.9, FLOOR + 0.005, 5.9, 0.9, 0.02, 1.8, L.mat);

  return planes;
}

// Black seat, lumbar pad and arms, with a black mesh back and headrest —
// the example home's desk chair, rebuilt on this module's own batch.
function ergonomicChair(B, x, z, ry) {
  const black = L.dark, mesh = { tex: 'chair_mesh' };
  B.at(x, FLOOR, z, ry, () => {
    B.box(0, 0.13, 0, 0.09, 0.32, 0.09, L.sage(0x8d9799));
    B.box(0, 0.45, 0, 0.58, 0.1, 0.55, black);
    B.box(0, 0.51, 0.27, 0.52, 0.67, 0.065, mesh, { rx: -0.1 });
    for (const cx of [-0.28, 0.28]) B.box(cx, 0.5, 0.28, 0.04, 0.72, 0.07, L.steel, { rx: -0.1 });
    B.box(0, 0.73, 0.3, 0.42, 0.12, 0.11, black);
    B.box(0, 1.18, 0.31, 0.08, 0.14, 0.05, L.steel);
    B.box(0, 1.3, 0.33, 0.4, 0.17, 0.1, mesh);
    for (const cx of [-0.36, 0.36]) {
      B.box(cx, 0.48, 0.08, 0.045, 0.23, 0.05, L.sage(0x747b7c));
      B.box(cx, 0.7, 0, 0.09, 0.04, 0.36, black);
    }
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) B.at(0, 0, 0, a, () => {
      B.box(0, 0.1, 0.18, 0.07, 0.05, 0.38, L.sage(0x747b7c));
      B.box(0, 0.02, 0.34, 0.12, 0.08, 0.1, black);
    });
  });
}
