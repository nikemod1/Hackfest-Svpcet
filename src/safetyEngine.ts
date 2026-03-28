export type ZoneTier = 'high' | 'moderate' | 'adverse' | 'safe';
export type Severity = 'low' | 'medium' | 'high';
export type TravelMode = 'walk' | 'bike' | 'car' | 'auto';

export type Zone = {
  id: string;
  name: string;
  x: number;
  y: number;
  baseRisk: number;
  crs: number;
  tier: ZoneTier;
  incidents: number;
  topCrime: string;
};

export type Incident = {
  id: string;
  type: string;
  zoneId: string;
  severity: Severity;
  timestamp: number;
  source: 'synthetic' | 'user';
};

export type RouteResult = {
  path: string[];
  distanceKm: number;
  timeMin: number;
  riskScore: number;
};

export const TIER_COLOR: Record<ZoneTier, string> = {
  high: '#ef4444',
  moderate: '#f97316',
  adverse: '#eab308',
  safe: '#16a34a'
};

const SEVERITY_WEIGHT: Record<Severity, number> = { low: 1, medium: 2, high: 3 };
const SPEED: Record<TravelMode, number> = { walk: 4.6, bike: 22, car: 34, auto: 26 };

export const ZONES: Zone[] = [
  { id: 'itwari', name: 'Itwari', x: 760, y: 200, baseRisk: 0.58, crs: 0.58, tier: 'high', incidents: 0, topCrime: '-' },
  { id: 'gandhibagh', name: 'Gandhibagh', x: 690, y: 250, baseRisk: 0.56, crs: 0.56, tier: 'high', incidents: 0, topCrime: '-' },
  { id: 'jaripatka', name: 'Jaripatka', x: 820, y: 280, baseRisk: 0.57, crs: 0.57, tier: 'high', incidents: 0, topCrime: '-' },
  { id: 'cotton-mkt', name: 'Cotton Market', x: 640, y: 170, baseRisk: 0.54, crs: 0.54, tier: 'moderate', incidents: 0, topCrime: '-' },
  { id: 'sadar', name: 'Sadar', x: 620, y: 310, baseRisk: 0.43, crs: 0.43, tier: 'moderate', incidents: 0, topCrime: '-' },
  { id: 'sitabuldi', name: 'Sitabuldi', x: 560, y: 290, baseRisk: 0.42, crs: 0.42, tier: 'moderate', incidents: 0, topCrime: '-' },
  { id: 'kamptee-rd', name: 'Kamptee Road', x: 860, y: 150, baseRisk: 0.44, crs: 0.44, tier: 'moderate', incidents: 0, topCrime: '-' },
  { id: 'mankapur', name: 'Mankapur', x: 430, y: 210, baseRisk: 0.39, crs: 0.39, tier: 'adverse', incidents: 0, topCrime: '-' },
  { id: 'tehsil', name: 'Tehsil', x: 540, y: 180, baseRisk: 0.41, crs: 0.41, tier: 'moderate', incidents: 0, topCrime: '-' },
  { id: 'lakadganj', name: 'Lakadganj', x: 490, y: 250, baseRisk: 0.31, crs: 0.31, tier: 'adverse', incidents: 0, topCrime: '-' },
  { id: 'nandanvan', name: 'Nandanvan', x: 730, y: 370, baseRisk: 0.31, crs: 0.31, tier: 'adverse', incidents: 0, topCrime: '-' },
  { id: 'wardha-road', name: 'Wardha Road', x: 820, y: 500, baseRisk: 0.26, crs: 0.26, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'pratap-ngr', name: 'Pratap Nagar', x: 390, y: 390, baseRisk: 0.28, crs: 0.28, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'civil-lines', name: 'Civil Lines', x: 520, y: 320, baseRisk: 0.16, crs: 0.16, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'dharampeth', name: 'Dharampeth', x: 300, y: 400, baseRisk: 0.13, crs: 0.13, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'ramdaspeth', name: 'Ramdaspeth', x: 360, y: 450, baseRisk: 0.15, crs: 0.15, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'bajaj-nagar', name: 'Bajaj Nagar', x: 260, y: 520, baseRisk: 0.12, crs: 0.12, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'shankar-ngr', name: 'Shankar Nagar', x: 360, y: 360, baseRisk: 0.17, crs: 0.17, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'hingna', name: 'Hingna', x: 140, y: 560, baseRisk: 0.14, crs: 0.14, tier: 'safe', incidents: 0, topCrime: '-' },
  { id: 'wardhaman', name: 'Wardhaman Ngr', x: 720, y: 470, baseRisk: 0.2, crs: 0.2, tier: 'safe', incidents: 0, topCrime: '-' }
];

export const ROAD_EDGES: Array<[string, string]> = [
  ['civil-lines', 'sitabuldi'], ['civil-lines', 'sadar'], ['civil-lines', 'tehsil'],
  ['sitabuldi', 'sadar'], ['sitabuldi', 'tehsil'], ['sitabuldi', 'gandhibagh'],
  ['sitabuldi', 'ramdaspeth'], ['sitabuldi', 'shankar-ngr'],
  ['sadar', 'gandhibagh'], ['sadar', 'jaripatka'], ['sadar', 'nandanvan'],
  ['gandhibagh', 'itwari'], ['gandhibagh', 'jaripatka'], ['gandhibagh', 'lakadganj'],
  ['itwari', 'kamptee-rd'], ['itwari', 'tehsil'], ['itwari', 'jaripatka'],
  ['tehsil', 'mankapur'], ['mankapur', 'hingna'], ['mankapur', 'pratap-ngr'],
  ['pratap-ngr', 'dharampeth'], ['pratap-ngr', 'ramdaspeth'], ['pratap-ngr', 'shankar-ngr'],
  ['dharampeth', 'ramdaspeth'], ['dharampeth', 'bajaj-nagar'], ['ramdaspeth', 'bajaj-nagar'],
  ['shankar-ngr', 'dharampeth'], ['shankar-ngr', 'wardhaman'],
  ['nandanvan', 'wardha-road'], ['nandanvan', 'wardhaman'], ['wardhaman', 'wardha-road'],
  ['lakadganj', 'tehsil'], ['lakadganj', 'nandanvan'], ['kamptee-rd', 'jaripatka']
];

export const POLICE_STATIONS = [
  { id: 'sitabuldi-ps', name: 'Sitabuldi Police Station', x: 575, y: 275 },
  { id: 'sadar-ps', name: 'Sadar Police Station', x: 635, y: 325 },
  { id: 'itwari-ps', name: 'Itwari Police Station', x: 775, y: 215 },
  { id: 'dharampeth-ps', name: 'Dharampeth Police Station', x: 285, y: 390 }
];

const CRIME_TYPES = ['Theft', 'Pickpocketing', 'Chain Snatching', 'Assault', 'Robbery', 'Harassment', 'Vehicle Theft', 'Suspicious Activity'];
const GRAPH = buildGraph();

export function buildSyntheticDatabase(count = 40): Incident[] {
  const rows: Incident[] = [];
  for (let i = 0; i < count; i++) rows.push(generateSyntheticIncident(`S-${i + 1}`));
  return rows;
}

export function generateSyntheticIncident(id: string): Incident {
  const zone = weightedZone();
  return {
    id,
    type: CRIME_TYPES[Math.floor(Math.random() * CRIME_TYPES.length)],
    zoneId: zone.id,
    severity: pickSeverity(zone.baseRisk),
    timestamp: Date.now() - Math.floor(random(0.2, 72) * 3600000),
    source: 'synthetic'
  };
}

export function addReportAsIncident(id: string, zoneId: string, type: string, severity: Severity): Incident {
  return { id, zoneId, type, severity, timestamp: Date.now(), source: 'user' };
}

export function recomputeZones(baseZones: Zone[], incidents: Incident[]): Zone[] {
  return baseZones.map((z) => {
    const zoneIncidents = incidents.filter((i) => i.zoneId === z.id);
    const severityPoints = zoneIncidents.reduce((sum, i) => sum + SEVERITY_WEIGHT[i.severity], 0);
    const counter: Record<string, number> = {};
    for (const i of zoneIncidents) counter[i.type] = (counter[i.type] || 0) + 1;
    const topCrime = Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 2).map((x) => x[0]).join(', ') || 'No major trend';

    const crs = clamp(z.baseRisk + zoneIncidents.length * 0.011 + severityPoints * 0.004, 0.08, 0.99);
    return {
      ...z,
      incidents: zoneIncidents.length,
      topCrime,
      crs,
      tier: tierFromCRS(crs)
    };
  });
}

export function findRoute(zones: Zone[], start: string, end: string, mode: TravelMode, objective: 'safe' | 'fast'): RouteResult | null {
  const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));
  if (!zoneById[start] || !zoneById[end]) return null;

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(GRAPH));

  for (const n of unvisited) {
    dist[n] = Number.POSITIVE_INFINITY;
    prev[n] = null;
  }
  dist[start] = 0;

  while (unvisited.size) {
    let current: string | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const n of unvisited) {
      if (dist[n] < best) {
        best = dist[n];
        current = n;
      }
    }
    if (!current || best === Number.POSITIVE_INFINITY) break;
    if (current === end) break;
    unvisited.delete(current);

    for (const next of GRAPH[current]) {
      if (!unvisited.has(next)) continue;
      const a = zoneById[current];
      const b = zoneById[next];
      const edgeDistance = distanceKm(a.x, a.y, b.x, b.y) * 0.09;
      const edgeTime = (edgeDistance / SPEED[mode]) * 60;
      const edgeRisk = ((a.crs + b.crs) / 2) * 100;
      const edgeWeight = objective === 'safe' ? edgeTime + edgeRisk * 0.56 : edgeTime + edgeRisk * 0.18;
      const candidate = dist[current] + edgeWeight;
      if (candidate < dist[next]) {
        dist[next] = candidate;
        prev[next] = current;
      }
    }
  }

  if (!prev[end] && start !== end) return null;

  const path: string[] = [];
  let node: string | null = end;
  while (node) {
    path.unshift(node);
    node = prev[node];
  }

  let totalDistance = 0;
  let totalTime = 0;
  let riskWeighted = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = zoneById[path[i]];
    const b = zoneById[path[i + 1]];
    const d = distanceKm(a.x, a.y, b.x, b.y) * 0.09;
    totalDistance += d;
    totalTime += (d / SPEED[mode]) * 60;
    riskWeighted += ((a.crs + b.crs) / 2) * d;
  }

  return {
    path,
    distanceKm: totalDistance,
    timeMin: totalTime,
    riskScore: totalDistance > 0 ? clamp(riskWeighted / totalDistance, 0.08, 0.99) : zoneById[start].crs
  };
}

export function nearestPoliceStation(userX: number, userY: number) {
  let best = POLICE_STATIONS[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const ps of POLICE_STATIONS) {
    const d = distanceKm(ps.x, ps.y, userX, userY) * 0.09;
    if (d < bestD) {
      best = ps;
      bestD = d;
    }
  }
  return { ...best, distanceKm: bestD };
}

export function timeAgo(timestamp: number): string {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day ago`;
}

function tierFromCRS(crs: number): ZoneTier {
  if (crs >= 0.75) return 'high';
  if (crs >= 0.55) return 'moderate';
  if (crs >= 0.35) return 'adverse';
  return 'safe';
}

function pickSeverity(baseRisk: number): Severity {
  const r = Math.random();
  if (baseRisk > 0.5) return r < 0.4 ? 'high' : r < 0.8 ? 'medium' : 'low';
  if (baseRisk > 0.3) return r < 0.2 ? 'high' : r < 0.65 ? 'medium' : 'low';
  return r < 0.08 ? 'high' : r < 0.4 ? 'medium' : 'low';
}

function weightedZone(): Zone {
  const bag: Zone[] = [];
  for (const z of ZONES) {
    const w = Math.max(1, Math.round(z.baseRisk * 10));
    for (let i = 0; i < w; i++) bag.push(z);
  }
  return bag[Math.floor(Math.random() * bag.length)];
}

function buildGraph() {
  const g: Record<string, string[]> = {};
  for (const z of ZONES) g[z.id] = [];
  for (const [a, b] of ROAD_EDGES) {
    g[a].push(b);
    g[b].push(a);
  }
  return g;
}

function distanceKm(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
