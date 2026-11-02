// Interior of the LeHun cottage. The pink lounge now occupies the larger
// blue-and-yellow upper hall, with a clear stair approach and a TV-centered
// layout. Furniture stays in the shared model batch and all lighting is baked.
import * as THREE from 'three';
import { canvasTexture } from '@engine/world/textures.js';

const GROUND = 12;
const FLOOR = 19;
const ROOM = { x0: 9, x1: 18, z0: 37, z1: 50 };

const L = {
  cherry: { tex: 'paint', tint: 0xe3b0a4 },
  cherryLight: { tex: 'paint', tint: 0xefc9bc },
  pink: { tex: 'paint', tint: 0xf2afc0 },
  pinkFloor: { tex: 'paint', tint: 0xd99aaa },
  pinkDeep: { tex: 'paint', tint: 0xe393a8 },
  cream: { tex: 'paint', tint: 0xe4e4e4 },
  white: { tex: 'paint', tint: 0xcfd5d6 },
  graphite: { tex: 'paint', tint: 0x596469, emissive: 0.16 },
  frame: { tex: 'paint', tint: 0x788488, emissive: 0.12 },
  steel: { tex: 'steel' },
  linen: { tex: 'linen' },
  leaf: { tex: 'leaves' },
  terra: { tex: 'paint', tint: 0x876b62 },
  rubber: { tex: 'rubber', tint: 0x35393c },
  gymFloor: { tex: 'paint', tint: 0x718083, emissive: 0.12 },
  gymFrame: { tex: 'paint', tint: 0x93a0a2, emissive: 0.18 },
  gymGraphite: { tex: 'paint', tint: 0x707a7d, emissive: 0.14 },
  glow: (tint, emissive = 1) => ({ tex: 'paint', tint, emissive }),
};

const gameArt = canvasTexture(192, 108, (ctx, w, h) => {
  ctx.fillStyle = '#2b2333';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = ['#f2afc0', '#e4e4e4', '#8fb7d8', '#e3b0a4'][i % 4];
    ctx.fillRect((i * 37) % (w - 12) + 6, (i * 23) % (h - 30) + 20, 6, 6);
  }
  ctx.fillStyle = '#f2afc0';
  ctx.fillRect(0, h - 26, w, 4);
  ctx.fillRect(w - 58, h - 22, 50, 12);
  ctx.fillStyle = '#2b2333';
  ctx.font = '10px monospace';
  ctx.fillText('LEHUN QUEST', w - 52, h - 13);
});

export function furnishLeHun({ B, walk, obstacles, bakes }) {
  const foot = (x, z, w, d, level = 1) => obstacles.push({
    x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, level,
    // LeHun floats above the water, so its semantic levels (0/1) do not
    // match the absolute y values used by the navigation grid.
    floor: level === 1 ? FLOOR : GROUND,
  });
  const bake = (id, x, y, z, power, radius, direction = null) => bakes.push({
    id, position: [x, y, z], power, radius, direction,
  });
  const tread = (x, z, y) => walk.push([x, z, y, true]);
  const planes = [];

  // Ground floor: keep the original pink activity room alive below the new
  // lounge. The south doorway and the central passage stay clear for entry.
  B.box(10.5, GROUND + 0.005, 43.5, 8, 0.03, 8, L.gymFloor);
  for (const [x, z, w, d] of [
    [10.5, 39.58, 8, 0.16], [10.5, 47.42, 8, 0.16],
    [6.58, 43.5, 0.16, 8], [14.42, 43.5, 0.16, 8],
  ]) B.box(x, GROUND + 0.01, z, w, 0.02, d, L.pinkDeep);

  // Pull-up frame at the west wall.
  for (const x of [6.8, 8.0]) B.box(x, GROUND, 40.8, 0.09, 2.4, 0.09, L.gymFrame);
  B.box(7.4, GROUND + 2.32, 40.8, 1.4, 0.07, 0.07, L.gymFrame);
  B.box(7.4, GROUND + 2.32, 40.8, 0.5, 0.075, 0.075, L.pinkDeep);
  foot(7.4, 40.8, 1.6, 0.5, 0);

  // Cable tower and weight stacks at the north-east side.
  B.box(12.6, GROUND, 40.8, 2.1, 0.08, 0.8, L.gymFrame);
  for (const x of [11.95, 13.25]) {
    B.box(x, GROUND + 0.08, 40.8, 0.09, 2.2, 0.09, L.gymFrame);
    B.box(x, GROUND + 0.08, 41.05, 0.4, 0.75, 0.3, L.gymGraphite);
    for (let i = 0; i < 6; i++) B.box(x, GROUND + 0.15 + i * 0.1, 41.22, 0.3, 0.025, 0.025, L.gymFrame);
    B.box(x, GROUND + 0.8, 40.42, 0.025, 1.25, 0.025, L.pinkDeep);
    B.box(x, GROUND + 2.0, 40.6, 0.22, 0.22, 0.1, L.gymGraphite);
  }
  B.box(12.6, GROUND + 2.2, 40.8, 2.05, 0.1, 0.12, L.gymFrame);
  foot(12.6, 40.8, 2.2, 1, 0);

  // Bench and treadmill form the centre and south-east activity line.
  B.box(9.6, GROUND + 0.25, 43.0, 1.6, 0.14, 0.5, L.gymFrame);
  B.box(9.6, GROUND + 0.39, 43.0, 1.5, 0.07, 0.44, L.pink);
  for (const x of [8.95, 10.25]) B.box(x, GROUND, 43.0, 0.09, 0.25, 0.45, L.gymFrame);
  foot(9.6, 43.0, 1.7, 0.6, 0);
  B.box(12.5, GROUND + 0.05, 45.9, 1.15, 0.18, 2.05, L.gymFrame);
  B.box(12.5, GROUND + 0.23, 45.95, 0.86, 0.035, 1.7, L.gymGraphite);
  for (const x of [11.97, 13.03]) {
    B.box(x, GROUND + 0.22, 45.07, 0.075, 1.05, 0.075, L.gymFrame);
    B.box(x, GROUND + 1.1, 45.28, 0.075, 0.06, 0.55, L.gymGraphite);
  }
  B.box(12.5, GROUND + 1.15, 45.05, 1.02, 0.32, 0.18, L.gymGraphite, { rx: -0.2 });
  B.box(12.5, GROUND + 1.24, 45.15, 0.35, 0.15, 0.025, L.pinkDeep);
  foot(12.5, 45.9, 1.25, 2.2, 0);

  // A bike, dumbbell rack and two mats use the remaining south-west corner.
  B.box(7.2, GROUND + 0.05, 45.9, 0.95, 0.18, 1.4, L.gymFrame);
  B.box(7.2, GROUND + 0.23, 45.9, 0.65, 0.035, 1.05, L.gymGraphite);
  B.box(7.2, GROUND + 0.95, 45.25, 0.38, 0.08, 0.2, L.gymGraphite);
  foot(7.2, 45.9, 1.1, 1.6, 0);
  B.box(14.0, GROUND, 43.8, 0.8, 0.55, 2.2, L.gymFrame);
  B.box(14.0, GROUND + 0.55, 43.8, 0.9, 0.06, 2.3, L.cherry);
  foot(14.0, 43.8, 1, 2.4, 0);
  for (const [x, z] of [[13.0, 43.0], [13.0, 43.8], [13.0, 44.6]]) {
    B.box(x, GROUND + 0.09, z, 0.55, 0.09, 0.09, L.steel);
    for (const dx of [-0.31, 0.31]) B.box(x + dx, GROUND + 0.04, z, 0.13, 0.2, 0.13, L.gymGraphite);
  }
  B.box(7.8, GROUND + 0.01, 38.0, 0.62, 0.02, 1.7, L.pink);
  B.box(8.75, GROUND + 0.01, 38.3, 0.62, 0.02, 1.7, L.cream);
  B.box(8.3, GROUND, 37.45, 1.1, 0.4, 0.35, L.cherry);
  B.box(8.3, GROUND + 0.4, 37.45, 1.2, 0.05, 0.42, L.white);
  foot(8.3, 37.45, 1.3, 0.5, 0);
  B.box(11.5, GROUND, 48.35, 1.4, 0.9, 0.5, L.cherry);
  B.box(11.5, GROUND + 0.9, 48.35, 1.55, 0.06, 0.6, L.white);
  B.box(11.2, GROUND + 0.96, 48.35, 0.09, 0.24, 0.09, L.steel);
  B.box(11.85, GROUND + 0.96, 48.35, 0.12, 0.2, 0.12, L.pink);
  foot(11.5, 48.35, 1.55, 0.7, 0);
  // The ceiling is high above the gym floor, so the main pool needs a broad
  // radius; otherwise the inverse falloff leaves the floor almost unlit.
  bake('ground-gym', 10.5, GROUND + 5.5, 43.5, 6.0, 14, [0, -1, 0]);
  bake('ground-gym-west', 7.4, GROUND + 4.8, 40.5, 4.2, 10, [0, -1, 0]);
  bake('ground-gym-east', 13.5, GROUND + 4.8, 46.5, 4.2, 10, [0, -1, 0]);
  // Warm ceiling fixtures keep the gym readable after sunset. They sit just
  // below the upper slab, so the glow is visible without exposing a lamp body.
  for (const [i, [x, z]] of [[0, [7.6, 40.2]], [1, [13.4, 40.2]], [2, [7.6, 46.5]], [3, [13.4, 46.5]]]) {
    B.box(x, GROUND + 6.72, z, 0.22, 0.08, 0.22, L.glow(0xffd9a0));
    bake('gym-ceiling-' + i, x, GROUND + 6.7, z, 5.0, 11, [0, -1, 0]);
  }

  // A large pink inlay leaves a one-block blue/yellow border around the new
  // room, so the old small pink area reads as having moved instead of doubled.
  // Split the slab around the east stair opening instead of burying the
  // staircase inside a solid upper-floor box.
  B.box(12.25, FLOOR - 0.04, 43.0, 5.5, 0.08, 12, L.pinkFloor);
  for (const [x, z, w, d] of [
    [13.5, 38.08, 8, 0.16], [13.5, 48.92, 8, 0.16],
    [9.08, 43.5, 0.16, 10.7], [17.92, 43.5, 0.16, 10.7],
  ]) B.box(x, FLOOR + 0.01, z, w, 0.02, d, L.pinkDeep);
  for (let x = ROOM.x0; x < ROOM.x1; x++) for (let z = ROOM.z0; z < ROOM.z1; z++) {
    if (x >= 15) continue;
    tread(x, z, FLOOR);
  }

  // Thirteen half-metre steps use the full east edge of the cottage. Every
  // adjacent cell rises only 0.5 m, so the player can walk from the gym to the
  // upper landing without a jump or a one-metre ledge.
  for (let i = 0; i < 13; i++) {
    const z = 49 - i, top = 12.5 + i * 0.5;
    for (const x of [15, 16]) {
      B.box(x + 0.5, top - 0.5, z + 0.5, 1, 0.5, 1, L.cherry);
      tread(x, z, top);
    }
  }
  // The final half-step supports the player's body while turning onto the
  // upper floor; it is a landing, not a passage beyond the cottage wall.
  for (const x of [15, 16]) {
    B.box(x + 0.5, FLOOR - 0.5, 36.5, 1, 0.5, 1, L.cherry);
    tread(x, 36, FLOOR);
  }

  // Rails frame the high floor while leaving the stair landing and TV wall
  // open. The railing uses the same cherry/pink family as the transferred room.
  B.box(12.0, FLOOR, 49.42, 5.5, 0.82, 0.12, L.cherry);
  B.box(12.0, FLOOR + 0.82, 49.42, 5.5, 0.06, 0.16, L.pink);
  B.box(17.0, FLOOR, 49.42, 1, 0.82, 0.12, L.cherry);
  B.box(17.0, FLOOR + 0.82, 49.42, 1, 0.06, 0.16, L.pink);
  B.box(17.42, FLOOR, 43.5, 0.12, 0.82, 10.7, L.cherry);
  B.box(17.42, FLOOR + 0.82, 43.5, 0.16, 0.06, 10.7, L.pink);

  // The main piece is a wide media wall on the north side of the room.
  B.box(12.0, FLOOR, 37.35, 3.8, 0.5, 0.62, L.cherry);
  B.box(12.0, FLOOR + 0.5, 37.35, 4, 0.06, 0.7, L.white);
  B.box(13.3, FLOOR + 0.56, 37.35, 0.36, 0.1, 0.26, L.graphite);
  B.box(10.55, FLOOR + 0.56, 37.35, 0.16, 0.06, 0.12, L.pinkDeep);
  B.box(12.0, FLOOR + 1.04, 37.02, 3.45, 1.85, 0.07, L.graphite);
  const tv = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), new THREE.MeshBasicMaterial({
    map: gameArt,
    side: THREE.FrontSide,
    transparent: false,
    depthTest: true,
    depthWrite: true,
  }));
  // The screen faces the room and sits just in front of its frame. Normal
  // depth testing keeps it hidden when viewed through the outside wall.
  tv.position.set(12.0, FLOOR + 1.98, 37.1);
  // PlaneGeometry's front face already points toward the room at this wall.
  tv.rotation.y = 0;
  planes.push(tv);
  foot(12.0, 37.35, 4.2, 0.85);
  bake('lounge-tv', 12.0, FLOOR + 2.05, 37.65, 3.0, 8, [0, -1, 0.4]);

  // Sofa, coffee table and a generous rug leave a clear approach from the
  // stairs and keep the TV sightline centered in the larger floor area.
  B.box(12.5, FLOOR + 0.01, 43.15, 4.8, 0.02, 4.1, { tex: 'linen', tint: 0xf6d7dc });
  B.box(12.5, FLOOR + 0.1, 45.0, 3.8, 0.4, 1.05, L.graphite);
  B.box(12.5, FLOOR + 0.48, 45.42, 3.8, 0.62, 0.22, L.graphite);
  for (const x of [10.8, 14.2]) B.box(x, FLOOR + 0.1, 45.0, 0.3, 0.62, 1.05, L.graphite);
  B.box(12.5, FLOOR + 0.42, 42.0, 1.5, 0.08, 0.82, { tex: 'prada_marble' });
  for (const [x, z] of [[11.9, 41.7], [13.1, 41.7], [11.9, 42.3], [13.1, 42.3]]) {
    B.box(x, FLOOR + 0.02, z, 0.05, 0.4, 0.05, L.steel);
  }
  B.box(12.15, FLOOR + 0.49, 41.92, 0.24, 0.05, 0.17, L.pinkDeep);
  B.box(12.85, FLOOR + 0.49, 42.08, 0.17, 0.045, 0.12, L.white);
  foot(12.5, 45.0, 4.1, 1.3);
  foot(12.5, 42.0, 1.6, 0.9);

  // West side: a compact training nook moved out of the old cramped room.
  B.box(10.65, FLOOR + 0.05, 43.0, 1.1, 0.18, 2.15, L.frame);
  B.box(10.65, FLOOR + 0.23, 43.05, 0.82, 0.035, 1.78, L.graphite);
  for (const x of [10.12, 11.18]) {
    B.box(x, FLOOR + 0.22, 42.18, 0.075, 1.05, 0.075, L.frame);
    B.box(x, FLOOR + 1.1, 42.4, 0.075, 0.06, 0.55, L.graphite);
  }
  B.box(10.65, FLOOR + 1.15, 42.18, 1.02, 0.32, 0.18, L.graphite, { rx: -0.2 });
  B.box(10.65, FLOOR + 1.24, 42.28, 0.35, 0.15, 0.025, L.pinkDeep);
  foot(10.65, 43.0, 1.2, 2.3);
  B.box(10.65, FLOOR + 0.01, 46.25, 1.2, 0.02, 1.65, L.pink);
  B.box(12.25, FLOOR + 0.01, 46.25, 1.2, 0.02, 1.65, L.cream);
  B.box(11.45, FLOOR, 47.05, 1.0, 0.4, 0.35, L.cherry);
  B.box(11.45, FLOOR + 0.4, 47.05, 1.1, 0.05, 0.42, L.white);
  foot(11.45, 47.05, 1.2, 0.5);

  // East side storage and a plant balance the media wall without narrowing
  // the route between the staircase, sofa and south rail.
  B.box(10.25, FLOOR, 39.5, 0.9, 1.4, 0.62, L.cherry);
  B.box(10.25, FLOOR + 1.4, 39.5, 1.0, 0.06, 0.7, L.white);
  for (const z of [39.2, 39.8]) B.box(10.25, FLOOR + 0.75, z, 0.12, 0.12, 0.12, L.pinkDeep);
  foot(10.25, 39.5, 1.05, 0.85);
  B.box(16.0, FLOOR, 46.5, 0.3, 0.34, 0.3, L.terra);
  B.box(16.0, FLOOR + 0.4, 46.5, 0.62, 0.5, 0.62, L.leaf);
  B.box(16.0, FLOOR + 0.82, 46.5, 0.4, 0.3, 0.4, L.leaf);
  foot(16.0, 46.5, 0.5, 0.5);

  // Warm points keep the large room legible at night without real-time lights.
  for (const x of [10, 12.5, 15, 16.8]) B.box(x, FLOOR + 1.02, 49.34, 0.09, 0.09, 0.09, L.glow(0xffd9e0));
  bake('lounge-string', 13.5, FLOOR + 1.1, 49.0, 3.0, 10, [0, -0.6, -0.2]);
  bake('lounge-warm', 13.5, FLOOR + 3.0, 43.0, 4.2, 10, [0, -1, 0]);
  // Two pendants make the main light source visible, like the well-lit
  // lounge in gonglu. Their long stems meet the original ceiling without
  // occupying the clear stair approach.
  for (const [i, x] of [11.5, 13.5].entries()) {
    B.box(x, FLOOR + 3.55, 43.0, 0.04, 4.8, 0.04, L.steel);
    B.box(x, FLOOR + 3.5, 43.0, 0.5, 0.09, 0.5, L.steel);
    B.box(x, FLOOR + 3.47, 43.0, 0.36, 0.03, 0.36, L.glow(0xffe4ba));
    bake('lounge-pendant-' + i, x, FLOOR + 3.4, 43.0, 5.0, 12, [0, -1, 0]);
  }
  // A warm line above the TV fills the media wall without washing out the
  // screen itself, while the four small ceiling points cover the corners.
  B.box(12.0, FLOOR + 3.02, 37.0, 2.8, 0.05, 0.06, L.glow(0xffd9a0));
  bake('lounge-tv-wash', 12.0, FLOOR + 2.95, 37.2, 3.0, 8, [0, -0.7, 0.7]);
  for (const [i, [x, z]] of [[0, [10.0, 40.5]], [1, [15.5, 40.5]], [2, [10.0, 47.0]], [3, [15.5, 47.0]]]) {
    B.box(x, FLOOR + 2.76, z, 0.22, 0.08, 0.22, L.glow(0xffe0ad));
    bake('lounge-ceiling-' + i, x, FLOOR + 2.72, z, 4.5, 10, [0, -1, 0]);
  }

  return planes;
}
