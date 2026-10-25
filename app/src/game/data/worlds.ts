/**
 * World and stage catalog — names and order follow MASTER_GAME_DESIGN_DOC.md
 * section 8. Stable string IDs are the save identity (never array position).
 */

export type StageKind = 'stage' | 'boss' | 'challenge';

export interface StageDef {
  id: string;
  name: string;
  kind: StageKind;
  /** True when clearing this stage unlocks the next world. */
  worldGate: boolean;
}

export interface WorldDef {
  id: string;
  name: string;
  subtitle: string;
  /** Sky/accent colors used by the placeholder art (themed per world). */
  sky: number;
  ground: number;
  accent: number;
  stages: StageDef[];
}

const s = (id: string, name: string, kind: StageKind = 'stage', worldGate = false): StageDef => ({ id, name, kind, worldGate });

export const WORLDS: WorldDef[] = [
  {
    id: 'world-01-saskatoon-home',
    name: 'World 1 — Saskatoon Home',
    subtitle: 'Home & Neighborhood',
    sky: 0x7ec8f7, ground: 0x6ab15a, accent: 0xff6b6b,
    stages: [
      s('w01-bedroom-chaos', 'Bedroom Chaos'),
      s('w01-house-hijinks', 'House Hijinks'),
      s('w01-front-yard', 'Front-Yard & Neighborhood'),
      s('w01-backyard-party', 'Backyard Party'),
      s('w01-mom-inspection', "Mom's Room Inspection", 'boss', true),
    ],
  },
  {
    id: 'world-02-saskatoon-school',
    name: 'World 2 — School',
    subtitle: 'Fictionalized Saskatoon School',
    sky: 0x9ad7ff, ground: 0x8a9bb0, accent: 0xffc93c,
    stages: [
      s('w02-school-street', 'School Street & Bus Stop'),
      s('w02-classroom-lab', 'Classroom & Science Lab'),
      s('w02-gym-fire-safety', 'Gym & Fire-Safety Visit'),
      s('w02-playground-games', 'Playground Games'),
      s('w02-principal-bells', 'Principal Bell Schedule', 'boss', true),
    ],
  },
  {
    id: 'world-03-alberta-work-trip',
    name: 'World 3 — Alberta Work Trip',
    subtitle: "Robin's Work Trip",
    sky: 0xffb46b, ground: 0xb07a3c, accent: 0xffdd55,
    stages: [
      s('w03-highway-camp', 'Highway & Camp Breakfast'),
      s('w03-pumpjack-plains', 'Pumpjack Plains'),
      s('w03-hydro-vac-yard', 'Hydro Vac Yard & Pipe Rack'),
      s('w03-stormy-night-shift', 'Stormy Night Shift'),
      s('w03-safety-foreman', 'Safety Foreman', 'boss', true),
    ],
  },
  {
    id: 'world-04-edmonton',
    name: 'World 4 — Edmonton',
    subtitle: 'Family Trip',
    sky: 0x66d9c8, ground: 0x4e9e8f, accent: 0xff8f66,
    stages: [
      s('w04-river-valley', 'Road to Edmonton & River Valley'),
      s('w04-mega-mall', 'Mega Mall Waterpark & Ice Rink'),
      s('w04-restaurant-rush', "Chenoa's Restaurant Rush"),
      s('w04-high-level-bridge', 'Whyte Ave to High Level Bridge'),
      s('w04-chenoa', 'Chenoa', 'boss', true),
    ],
  },
  {
    id: 'world-05-calgary-stampede',
    name: 'World 5 — Calgary Stampede',
    subtitle: 'The Stampede',
    sky: 0xff9f68, ground: 0xc7853f, accent: 0xffe14d,
    stages: [
      s('w05-parade-pancakes', 'Stampede Parade & Pancake Breakfast'),
      s('w05-junior-rodeo', 'Junior Rodeo Games'),
      s('w05-midway-chuckwagon', 'Midway & Chuckwagon Track'),
      s('w05-grandstand-show', 'Grandstand Show'),
      s('w05-bronco', 'Bronco', 'boss', true),
    ],
  },
  {
    id: 'world-06-vancouver-rain',
    name: 'World 6 — Vancouver',
    subtitle: 'Vancouver & the Rain',
    sky: 0x7f9fc9, ground: 0x5c7d6e, accent: 0x9fe870,
    stages: [
      s('w06-sea-to-sky', 'Sea-to-Sky & Suspension Bridge'),
      s('w06-stanley-park', 'Stanley Park & Seawall'),
      s('w06-granville-science-world', 'Granville Island & Science World'),
      s('w06-skytrain-storm', 'SkyTrain & Big Storm'),
      s('w06-drizzle', 'Drizzle', 'boss', true),
    ],
  },
  {
    id: 'world-07-lego-brick-realms',
    name: 'World 7 — LEGO Brick Realms',
    subtitle: 'Brick Realms',
    sky: 0x2b4fd8, ground: 0xe8c33c, accent: 0xff4d4d,
    stages: [
      s('w07-great-lego-bin', 'The Great LEGO Bin'),
      s('w07-fire-truck-city', 'Fire-Truck Brick City'),
      s('w07-machine-brickwilds', 'Machine Brickwilds'),
      s('w07-studded-tower', 'Studded Skyscraper Tower'),
      s('w07-brick-rex', 'BRICK-REX', 'boss', true),
    ],
  },
  {
    id: 'world-08-prehistoric',
    name: 'World 8 — Prehistoric',
    subtitle: 'Dinosaur Adventure',
    sky: 0xf7c86b, ground: 0x7a9e4f, accent: 0xd86b3c,
    stages: [
      s('w08-badlands-fossil-dig', 'Badlands Fossil Dig'),
      s('w08-fern-jungle', 'Fern Jungle & Baby-Dino Rescue'),
      s('w08-brachiosaurus-river', 'Brachiosaurus River & Triceratops Trails'),
      s('w08-raptor-canyon', 'Raptor Canyon & T-Rex Nest'),
      s('w08-alpha-t-rex', 'Alpha T-Rex', 'boss', true),
    ],
  },
  {
    id: 'world-09-starbase-annie',
    name: 'World 9 — Starbase',
    subtitle: "Star Wars & Annie's Arrival",
    sky: 0x141433, ground: 0x5a6bb5, accent: 0xffd94d,
    stages: [
      s('w09-twin-sun-outpost', 'Twin-Sun Outpost'),
      s('w09-droid-factory', 'Droid Factory & Hangar'),
      s('w09-laser-corridors', 'Starbase Laser Corridors'),
      s('w09-trench-run', '2D Trench Run'),
      s('w09-annie-kitchen', "Annie's Galactic Kitchen", 'boss', true),
    ],
  },
  {
    id: 'world-10-birthday-multiverse',
    name: 'World 10 — Birthday Multiverse',
    subtitle: 'The Finale',
    sky: 0xb46bff, ground: 0x7a4fd8, accent: 0xff6bd8,
    stages: [
      s('w10-remix-home', 'Remix: Home & LEGO'),
      s('w10-remix-rain', 'Remix: Rain & Rodeo'),
      s('w10-remix-kitchen', 'Remix: Kitchen & Canyon'),
      s('w10-remix-starbase', 'Remix: Starbase Run'),
      s('w10-grandmothers', 'The Grandmothers', 'boss'),
      s('w10-mom-finale', 'Mom — Birthday Rift', 'boss', true),
    ],
  },
];

export const WORLD_11 = {
  id: 'world-11-dimension-11',
  name: 'World 11 — Dimension 11',
  subtitle: 'The Birthday Observatory',
};

export function findWorld(worldId: string): WorldDef | null {
  return WORLDS.find((w) => w.id === worldId) ?? null;
}

export function findStage(stageId: string): { world: WorldDef; stage: StageDef } | null {
  for (const world of WORLDS) {
    const stage = world.stages.find((st) => st.id === stageId);
    if (stage !== undefined) return { world, stage };
  }
  return null;
}

/** Flat stage order used for progression unlocking. */
export const STAGE_ORDER: string[] = WORLDS.flatMap((w) => w.stages.map((st) => st.id));

const STAGE_TO_WORLD = new Map<string, string>(
  WORLDS.flatMap((w) => w.stages.map((st) => [st.id, w.id] as [string, string])),
);

/** World ID that owns a stage ID (stable-ID mapping, never array position). */
export function worldIdForStage(stageId: string): string | null {
  return STAGE_TO_WORLD.get(stageId) ?? null;
}