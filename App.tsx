import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';
import {
  ZONES,
  ROAD_EDGES,
  TIER_COLOR,
  buildSyntheticDatabase,
  recomputeZones,
  findRoute,
  nearestPoliceStation,
  addReportAsIncident,
  timeAgo,
  type Incident,
  type Severity,
  type TravelMode
} from './src/safetyEngine';

type TabKey = 'route' | 'sos' | 'report' | 'history' | 'dashboard';

const CONTACTS = [
  { name: 'Priya Mehta', relation: 'Mother', phone: '+91 98765 43210' },
  { name: 'Rahul Deshpande', relation: 'Brother', phone: '+91 87654 32109' },
  { name: 'Sarika Patil', relation: 'Friend', phone: '+91 76543 21098' }
];

const USER_LOCATION = { x: 560, y: 290, label: 'Sitabuldi' };
const TAB_LIST: Array<{ key: TabKey; label: string }> = [
  { key: 'route', label: 'Route' },
  { key: 'sos', label: 'SOS' },
  { key: 'report', label: 'Report' },
  { key: 'history', label: 'History' },
  { key: 'dashboard', label: 'Dashboard' }
];

export default function App() {
  const [tab, setTab] = useState<TabKey>('route');
  const [incidents, setIncidents] = useState<Incident[]>(() => buildSyntheticDatabase(40));
  const [reports, setReports] = useState<Incident[]>([]);
  const [origin, setOrigin] = useState('civil-lines');
  const [destination, setDestination] = useState('itwari');
  const [mode, setMode] = useState<TravelMode>('walk');
  const [crimeType, setCrimeType] = useState('Theft');
  const [reportZone, setReportZone] = useState('sitabuldi');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');
  const [sosState, setSosState] = useState<'idle' | 'sent'>('idle');
  const [toast, setToast] = useState('');

  const zones = useMemo(() => recomputeZones(ZONES, incidents), [incidents]);
  const zoneById = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);

  const safeRoute = useMemo(() => findRoute(zones, origin, destination, mode, 'safe'), [zones, origin, destination, mode]);
  const _backgroundFastRoute = useMemo(() => findRoute(zones, origin, destination, mode, 'fast'), [zones, origin, destination, mode]);

  const latestIncidents = useMemo(() => [...incidents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10), [incidents]);

  const counts = useMemo(() => {
    const c = { high: 0, moderate: 0, adverse: 0, safe: 0 };
    for (const z of zones) c[z.tier] += 1;
    return c;
  }, [zones]);

  const cityStats = useMemo(() => {
    const avg = Math.round((zones.reduce((s, z) => s + z.crs, 0) / zones.length) * 100);
    return {
      totalIncidents: incidents.length,
      highRiskZones: counts.high,
      safeZones: counts.safe,
      avgCRS: avg
    };
  }, [counts, incidents.length, zones]);

  const patrolPriority = useMemo(() => {
    const sorted = [...zones].sort((a, b) => b.crs - a.crs);
    const max = sorted[0].crs;
    const min = sorted[sorted.length - 1].crs;
    const span = Math.max(0.001, max - min);
    return sorted.slice(0, 7).map((z) => ({ zone: z, pct: Math.round(((z.crs - min) / span) * 100) }));
  }, [zones]);

  const nearestStation = nearestPoliceStation(USER_LOCATION.x, USER_LOCATION.y);

  const routePathPoints = (route: typeof safeRoute) => {
    if (!route) return '';
    return route.path.map((id) => `${zoneById[id].x},${zoneById[id].y}`).join(' ');
  };

  const postToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const submitReport = () => {
    const newReport = addReportAsIncident(`U-${Date.now()}`, reportZone, crimeType, severity);
    setIncidents((prev) => [newReport, ...prev]);
    setReports((prev) => [newReport, ...prev]);
    setDescription('');
    postToast('Incident reported. Risk map and zones updated.');
  };

  const triggerSOS = () => {
    setSosState('sent');
    postToast('SOS sent to contacts and nearest police station.');
  };

  const injectLiveIncident = () => {
    const z = zones[Math.floor(Math.random() * zones.length)];
    const sev: Severity = z.crs > 0.55 ? 'high' : z.crs > 0.35 ? 'medium' : 'low';
    const i = addReportAsIncident(`L-${Date.now()}`, z.id, 'Suspicious Activity', sev);
    setIncidents((prev) => [i, ...prev]);
    postToast('Live incident synced from feed.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>APSAS React Native Web Safety Platform</Text>
          <Pressable onPress={injectLiveIncident} style={styles.liveBtn}><Text style={styles.liveBtnText}>Sync Live Feed</Text></Pressable>
        </View>

        <View style={styles.legendRow}>
          {(['high', 'moderate', 'adverse', 'safe'] as const).map((tier) => (
            <View key={tier} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TIER_COLOR[tier] }]} />
              <Text style={styles.legendText}>{tier.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.mapWrap}>
          <Svg width="100%" height="100%" viewBox="0 0 1000 700">
            <Rect x={0} y={0} width={1000} height={700} fill="#0b1628" />

            {ROAD_EDGES.map(([a, b]) => (
              <Line
                key={`${a}-${b}`}
                x1={zoneById[a].x}
                y1={zoneById[a].y}
                x2={zoneById[b].x}
                y2={zoneById[b].y}
                stroke="#9fb0cb"
                strokeOpacity={0.55}
                strokeWidth={2}
              />
            ))}

            {safeRoute && <Polyline points={routePathPoints(safeRoute)} stroke="#16a34a" strokeWidth={8} fill="none" strokeOpacity={0.95} />}

            {zones.map((z) => (
              <Circle key={z.id} cx={z.x} cy={z.y} r={11 + Math.round(z.crs * 8)} fill={TIER_COLOR[z.tier]} fillOpacity={0.55} stroke={TIER_COLOR[z.tier]} strokeWidth={1.2} />
            ))}

            {latestIncidents.slice(0, 24).map((i) => {
              const z = zoneById[i.zoneId];
              const color = i.severity === 'high' ? '#ef4444' : i.severity === 'medium' ? '#f97316' : '#eab308';
              return <Circle key={i.id} cx={z.x + Math.random() * 10 - 5} cy={z.y + Math.random() * 10 - 5} r={2.5} fill={color} />;
            })}

            <Circle cx={USER_LOCATION.x} cy={USER_LOCATION.y} r={7} fill="#3b82f6" />
          </Svg>
        </View>

        <View style={styles.tabRow}>
          {TAB_LIST.map((item) => (
            <Pressable key={item.key} onPress={() => setTab(item.key)} style={[styles.tabBtn, tab === item.key && styles.tabBtnActive]}>
              <Text style={[styles.tabBtnText, tab === item.key && styles.tabBtnTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={styles.panel} contentContainerStyle={{ paddingBottom: 48 }}>
          {tab === 'route' && (
            <View>
              <Text style={styles.sectionTitle}>Route Planner</Text>
              <Text style={styles.helper}>Enter origin and destination using zone ids shown below.</Text>
              <Text style={styles.hint}>civil-lines, sitabuldi, itwari, gandhibagh, dharampeth, ramdaspeth ...</Text>

              <TextInput style={styles.input} value={origin} onChangeText={setOrigin} placeholder="Origin" placeholderTextColor="#6b7280" />
              <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="Destination" placeholderTextColor="#6b7280" />

              <View style={styles.modeRow}>
                {(['walk', 'bike', 'car', 'auto'] as const).map((m) => (
                  <Pressable key={m} onPress={() => setMode(m)} style={[styles.modeBtn, mode === m && styles.modeBtnActive]}>
                    <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>{m.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </View>

              {safeRoute && (
                <View style={styles.rowCard}>
                  <Text style={styles.rowTitle}>Suggested Path</Text>
                  <Text style={styles.rowSub}>Path: {safeRoute.path.join(' -> ')}</Text>
                  <Text style={styles.rowSub}>Time: {Math.round(safeRoute.timeMin)} min | Distance: {safeRoute.distanceKm.toFixed(1)} km</Text>
                  <Text style={styles.rowSub}>Risk: {Math.round(safeRoute.riskScore * 100)}%</Text>
                </View>
              )}

              <Text style={styles.helper}>Routing optimization is active in background. The map displays one recommended path.</Text>

              <Text style={styles.sectionTitle}>Recent Incidents</Text>
              {latestIncidents.slice(0, 6).map((i) => (
                <View key={i.id} style={styles.rowCard}>
                  <Text style={styles.rowTitle}>{i.type}</Text>
                  <Text style={styles.rowSub}>{zoneById[i.zoneId].name} | {i.severity.toUpperCase()} | {timeAgo(i.timestamp)}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'sos' && (
            <View>
              <Text style={styles.sectionTitle}>Emergency SOS</Text>
              <Pressable onPress={triggerSOS} style={styles.sosBtn}><Text style={styles.sosText}>SEND SOS</Text></Pressable>
              <Text style={styles.helper}>Nearest station: {nearestStation.name} ({nearestStation.distanceKm.toFixed(2)} km)</Text>

              {sosState === 'sent' && (
                <View style={styles.alertBox}>
                  <Text style={styles.alertTitle}>Alert Sent</Text>
                  <Text style={styles.alertLine}>User: Aditi Kulkarni | +91 90000 11223</Text>
                  <Text style={styles.alertLine}>Live location: Sitabuldi ({USER_LOCATION.x}, {USER_LOCATION.y})</Text>
                  <Text style={styles.alertLine}>Alarm: Active</Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              {CONTACTS.map((c) => (
                <View key={c.phone} style={styles.rowCard}>
                  <Text style={styles.rowTitle}>{c.name} ({c.relation})</Text>
                  <Text style={styles.rowSub}>{c.phone}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'report' && (
            <View>
              <Text style={styles.sectionTitle}>Report Incident</Text>
              <TextInput style={styles.input} value={crimeType} onChangeText={setCrimeType} placeholder="Crime type" placeholderTextColor="#6b7280" />
              <TextInput style={styles.input} value={reportZone} onChangeText={setReportZone} placeholder="Zone id" placeholderTextColor="#6b7280" />
              <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#6b7280" />

              <View style={styles.modeRow}>
                {(['low', 'medium', 'high'] as const).map((s) => (
                  <Pressable key={s} onPress={() => setSeverity(s)} style={[styles.modeBtn, severity === s && styles.modeBtnActive]}>
                    <Text style={[styles.modeText, severity === s && styles.modeTextActive]}>{s.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={submitReport} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Submit Report</Text></Pressable>
              <Text style={styles.helper}>Each submitted report increases incidents and can push a zone into higher danger.</Text>
            </View>
          )}

          {tab === 'history' && (
            <View>
              <Text style={styles.sectionTitle}>Report History</Text>
              {reports.length === 0 && <Text style={styles.helper}>No user reports submitted yet.</Text>}
              {reports.map((r) => (
                <View key={r.id} style={styles.rowCard}>
                  <Text style={styles.rowTitle}>{r.type} | {r.severity.toUpperCase()}</Text>
                  <Text style={styles.rowSub}>{zoneById[r.zoneId]?.name || r.zoneId} | {timeAgo(r.timestamp)}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'dashboard' && (
            <View>
              <Text style={styles.sectionTitle}>City Dashboard</Text>
              <View style={styles.metricGrid}>
                <View style={styles.metric}><Text style={styles.metricVal}>{cityStats.totalIncidents}</Text><Text style={styles.metricLbl}>Total Incidents</Text></View>
                <View style={styles.metric}><Text style={styles.metricVal}>{cityStats.highRiskZones}</Text><Text style={styles.metricLbl}>High Risk Zones</Text></View>
                <View style={styles.metric}><Text style={styles.metricVal}>{cityStats.safeZones}</Text><Text style={styles.metricLbl}>Safe Zones</Text></View>
                <View style={styles.metric}><Text style={styles.metricVal}>{cityStats.avgCRS}</Text><Text style={styles.metricLbl}>Avg City CRS</Text></View>
              </View>

              <Text style={styles.sectionTitle}>Patrol Priority (%)</Text>
              {patrolPriority.map((p) => (
                <View key={p.zone.id} style={styles.rowCard}>
                  <Text style={styles.rowTitle}>{p.zone.name}</Text>
                  <Text style={styles.rowSub}>{p.pct}% priority | Tier: {p.zone.tier.toUpperCase()}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Risk Distribution</Text>
              {([
                ['high', counts.high],
                ['moderate', counts.moderate],
                ['adverse', counts.adverse],
                ['safe', counts.safe]
              ] as const).map(([tier, value]) => {
                const pct = Math.round((value / zones.length) * 100);
                return (
                  <View key={tier} style={{ marginBottom: 10 }}>
                    <Text style={styles.rowSub}>{tier.toUpperCase()} | {value} zones | {pct}%</Text>
                    <View style={styles.barTrack}><View style={[styles.barFill, { width: `${pct}%`, backgroundColor: TIER_COLOR[tier] }]} /></View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {toast.length > 0 && (
          <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#030712' },
  shell: { flex: 1, padding: 12, backgroundColor: '#030712' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#e5e7eb', fontSize: 16, fontWeight: '700', maxWidth: '74%' },
  liveBtn: { backgroundColor: '#1d4ed8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  liveBtnText: { color: '#eff6ff', fontSize: 12, fontWeight: '700' },
  legendRow: { flexDirection: 'row', marginTop: 10, marginBottom: 8, gap: 10, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: '#d1d5db', fontSize: 11, fontWeight: '600' },
  mapWrap: { height: 310, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#1f2937', backgroundColor: '#0b1628' },
  tabRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  tabBtn: { flex: 1, borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#1e3a8a', borderColor: '#2563eb' },
  tabBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  tabBtnTextActive: { color: '#f8fafc' },
  panel: { marginTop: 10, flex: 1 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  helper: { color: '#9ca3af', fontSize: 12, marginBottom: 10 },
  hint: { color: '#60a5fa', fontSize: 11, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, color: '#e5e7eb', marginBottom: 8, backgroundColor: '#111827' },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  modeBtn: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  modeBtnActive: { backgroundColor: '#1e40af', borderColor: '#2563eb' },
  modeText: { color: '#9ca3af', fontSize: 12, fontWeight: '700' },
  modeTextActive: { color: '#f8fafc' },
  rowCard: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#111827' },
  rowTitle: { color: '#f8fafc', fontSize: 13, fontWeight: '700' },
  rowSub: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  sosBtn: { backgroundColor: '#b91c1c', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  sosText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  alertBox: { borderWidth: 1, borderColor: '#16a34a', borderRadius: 10, padding: 10, backgroundColor: '#052e16', marginBottom: 10 },
  alertTitle: { color: '#86efac', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  alertLine: { color: '#d1fae5', fontSize: 12, marginBottom: 2 },
  primaryBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  primaryBtnText: { color: '#eff6ff', fontWeight: '700' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metric: { width: '48%', borderWidth: 1, borderColor: '#334155', borderRadius: 8, backgroundColor: '#111827', padding: 10 },
  metricVal: { color: '#f8fafc', fontSize: 22, fontWeight: '800' },
  metricLbl: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  barTrack: { height: 8, backgroundColor: '#1f2937', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 5 },
  toast: { position: 'absolute', bottom: 16, left: 14, right: 14, backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 10 },
  toastText: { color: '#e5e7eb', fontSize: 12, textAlign: 'center' }
});
