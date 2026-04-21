import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Ear, Clock, AudioWaveform, MapPin, Settings, ChevronRight, ChevronLeft, Mic, Bell, Flame, AlertTriangle, DoorOpen, Car, Phone, Microwave, Timer, TrafficCone, GlassWater, Siren, ThumbsUp, ThumbsDown, Zap, Shield, MapPinned, Volume2, Plus, Lock, Check, CircleDot, Navigation, Briefcase, Moon, Bus, User, Palette, Watch, CreditCard, Cloud, FileText, ExternalLink, X } from 'lucide-react';

// ─── Design Tokens ──────────────────────────────────────────────
const T = {
  bg: '#FAF7F2', surface: '#FFFFFF', surfaceHover: '#F5F0E8', surfaceSecondary: '#F0EAD6',
  border: '#EDE7D9', borderLight: '#F0EAD6', brand: '#C2956B', brandLight: '#A87D55', brandBg: '#FFF5E6',
  critical: '#D4473C', criticalBg: '#FEF0EE', criticalBorder: 'rgba(212,71,60,0.20)',
  important: '#C2956B', importantBg: '#FFF5E6', importantBorder: 'rgba(194,149,107,0.25)',
  info: '#5B94C8', infoBg: '#EEF4FF', infoBorder: 'rgba(91,148,200,0.20)',
  bgUrgency: '#B8B0A0',
  textPrimary: '#2C2218', textSecondary: '#6B5B3E', textTertiary: '#A89A82', textMuted: '#C4B89E',
  success: '#5B9A4F', successBg: '#F0F7EE', successBorder: '#D4E8CF',
  zonesBg: '#EDE8FF', zonesIcon: '#7C6BC4', trainBg: '#FFF5E6', trainIcon: '#A87D55',
  soundsBg: '#EEF4FF', soundsIcon: '#5B8EC4', alertsBg: '#FEF0EE', alertsIcon: '#C4665E',
  modeHome: '#A87D55', modeWork: '#5B94C8', modeTransit: '#5B9A4F', modeSleep: '#7C6BC4',
};
const urgPal = {
  critical:  { rgb: '212,71,60',   text: '#D4473C', bg: T.criticalBg, border: T.criticalBorder },
  important: { rgb: '194,149,107', text: '#A87D55', bg: T.importantBg, border: T.importantBorder },
  info:      { rgb: '91,148,200',  text: '#5B94C8', bg: T.infoBg, border: T.infoBorder },
  calm:      { rgb: '91,154,79',   text: '#5B9A4F', bg: T.successBg, border: T.successBorder },
  background:{ rgb: '184,176,160', text: '#8A8070', bg: '#F5F3EF', border: 'rgba(184,176,160,0.2)' },
};
const urgBarColor = { critical: T.critical, important: T.important, info: T.info, background: T.bgUrgency };
const modeColors = { home: T.modeHome, work: T.modeWork, transit: T.modeTransit, sleep: T.modeSleep };
const F = "'DM Sans', sans-serif";
const M = "'DM Mono', monospace";

// ─── Dashboard Mock Data ────────────────────────────────────────
const dashEvents = [
  { id: 1, time: '9:12', name: 'Fire alarm', zone: 'Kitchen', confidence: 94, urgency: 'critical' },
  { id: 2, time: '8:45', name: 'Doorbell', zone: 'Front door', confidence: 87, urgency: 'important' },
  { id: 3, time: '8:22', name: 'Microwave beep', zone: 'Kitchen', confidence: 91, urgency: 'info' },
  { id: 4, time: '7:58', name: 'Oven timer', zone: 'Kitchen', confidence: 89, urgency: 'info' },
  { id: 5, time: '7:30', name: 'Car horn', zone: 'Outside', confidence: 76, urgency: 'background' },
];
const statusCycle = [
  { urgency: 'critical',  text: 'Fire alarm detected',       sub: 'Kitchen · 12 min ago',   ms: 4000 },
  { urgency: 'calm',      text: 'All quiet — no new alerts', sub: '5 sounds detected today', ms: 5000 },
  { urgency: 'important', text: 'Doorbell — Front door',     sub: 'just now',                ms: 3000 },
  { urgency: 'calm',      text: 'All clear — home is quiet', sub: 'Monitoring 6 sounds',     ms: 5000 },
  { urgency: 'info',      text: 'Microwave beep — Kitchen',  sub: '30 sec ago',              ms: 3000 },
  { urgency: 'calm',      text: 'All quiet — listening',     sub: 'No alerts in the last hour', ms: 5000 },
];

// ─── Timeline Mock Data ─────────────────────────────────────────
const timelineEvents = [
  { id: 1, time: '9:12 AM', name: 'Fire alarm', zone: 'Kitchen', confidence: 94, urgency: 'critical', icon: Flame, mode: 'home', dbLevel: 82 },
  { id: 2, time: '8:45 AM', name: 'Doorbell', zone: 'Front door', confidence: 87, urgency: 'important', icon: Bell, mode: 'home', dbLevel: 68 },
  { id: 'm1', type: 'mode', time: '8:30 AM', from: 'transit', to: 'home', label: 'Arrived Home' },
  { id: 3, time: '8:22 AM', name: 'Car horn', zone: 'Transit', confidence: 76, urgency: 'background', icon: Car, mode: 'transit', dbLevel: 71 },
  { id: 4, time: '8:10 AM', name: 'Emergency siren', zone: 'Transit', confidence: 88, urgency: 'critical', icon: Siren, mode: 'transit', dbLevel: 85 },
  { id: 'm2', type: 'mode', time: '7:55 AM', from: 'work', to: 'transit', label: 'Left Work' },
  { id: 5, time: '7:42 AM', name: 'Phone ringing', zone: 'Office', confidence: 91, urgency: 'info', icon: Phone, mode: 'work', dbLevel: 55 },
  { id: 6, time: '7:15 AM', name: 'Door knock', zone: 'Office', confidence: 83, urgency: 'important', icon: DoorOpen, mode: 'work', dbLevel: 62 },
  { id: 7, time: '6:50 AM', name: 'Microwave beep', zone: 'Break room', confidence: 91, urgency: 'info', icon: Microwave, mode: 'work', dbLevel: 48 },
  { id: 'm3', type: 'mode', time: '6:30 AM', from: 'home', to: 'work', label: 'Arrived at Work' },
  { id: 8, time: '6:20 AM', name: 'Oven timer', zone: 'Kitchen', confidence: 89, urgency: 'info', icon: Timer, mode: 'home', dbLevel: 52 },
  { id: 9, time: '6:05 AM', name: 'Smoke detector', zone: 'Kitchen', confidence: 96, urgency: 'critical', icon: AlertTriangle, mode: 'home', dbLevel: 88 },
];

// Mode band segments (proportional to time spent)
const modeBand = [
  { mode: 'sleep', pct: 15 },
  { mode: 'home', pct: 20 },
  { mode: 'transit', pct: 10 },
  { mode: 'work', pct: 35 },
  { mode: 'transit', pct: 8 },
  { mode: 'home', pct: 12 },
];

// ─── Sound Library Data ─────────────────────────────────────────
const trainedSounds = [
  { id: 't1', name: 'My Doorbell', icon: Bell, urgency: 'important', category: 'door', samples: 3, accuracy: 92, lastHeard: '2 hrs ago', active: true },
  { id: 't2', name: 'Coffee Machine', icon: Timer, urgency: 'info', category: 'appliance', samples: 4, accuracy: 88, lastHeard: '5 hrs ago', active: true },
  { id: 't3', name: 'Dog Barking', icon: Volume2, urgency: 'important', category: 'environment', samples: 3, accuracy: 85, lastHeard: 'Yesterday', active: false },
];

const presetSounds = [
  { id: 'p1', name: 'Fire Alarm', icon: Flame, urgency: 'critical', category: 'safety', active: true },
  { id: 'p2', name: 'Smoke Detector', icon: AlertTriangle, urgency: 'critical', category: 'safety', active: true },
  { id: 'p3', name: 'Doorbell', icon: Bell, urgency: 'important', category: 'door', active: true },
  { id: 'p4', name: 'Door Knock', icon: DoorOpen, urgency: 'important', category: 'door', active: true },
  { id: 'p5', name: 'Car Horn', icon: Car, urgency: 'important', category: 'environment', active: true },
  { id: 'p6', name: 'Emergency Siren', icon: Siren, urgency: 'critical', category: 'safety', active: true },
  { id: 'p7', name: 'Glass Breaking', icon: GlassWater, urgency: 'critical', category: 'safety', active: false },
  { id: 'p8', name: 'Phone Ringing', icon: Phone, urgency: 'info', category: 'appliance', active: true },
  { id: 'p9', name: 'Microwave Beep', icon: Microwave, urgency: 'info', category: 'appliance', active: true },
  { id: 'p10', name: 'Oven Timer', icon: Timer, urgency: 'info', category: 'appliance', active: true },
  { id: 'p11', name: 'Crosswalk Signal', icon: TrafficCone, urgency: 'info', category: 'environment', active: false },
];

const suggestedSounds = [
  { id: 's1', name: 'Baby Crying', icon: Volume2, category: 'voice' },
  { id: 's2', name: 'Washing Machine', icon: CircleDot, category: 'appliance' },
];

// ─── Zones Data ─────────────────────────────────────────────────
const mockZonesData = [
  { id: 'z1', name: 'Home', icon: Home, address: '123 Park Ave, Rochester', mode: 'home', sounds: 8, radius: 'medium', active: true, color: T.modeHome, lat: 43.16, lng: -77.61 },
  { id: 'z2', name: 'Work', icon: Briefcase, address: 'RIT, 1 Lomb Memorial Dr', mode: 'work', sounds: 5, radius: 'large', active: false, color: T.modeWork, lat: 43.08, lng: -77.67 },
  { id: 'z3', name: 'Gym', icon: Navigation, address: '456 Main St, Rochester', mode: 'transit', sounds: 2, radius: 'small', active: false, color: T.modeTransit, lat: 43.15, lng: -77.60 },
];

// ─── Main App ───────────────────────────────────────────────────
export default function SoundSensePrototype() {
  const [screen, setScreen] = useState('dashboard');
  const [emptyMode, setEmptyMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [trainingStep, setTrainingStep] = useState(1);
  const [trainingSamples, setTrainingSamples] = useState(0);
  const [feedback, setFeedback] = useState({});
  const [dbLevel, setDbLevel] = useState(32);
  const [statusIdx, setStatusIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [timelineDay, setTimelineDay] = useState(0);
  const [trainUrg, setTrainUrg] = useState('important');
  const [trainZones, setTrainZones] = useState({ Home: true, Work: true, Transit: false });
  const [bgColor, setBgColor] = useState('#FAF7F2');
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [hiwPage, setHiwPage] = useState(0);
  const [perms, setPerms] = useState({ mic: false, location: false, notifs: false });
  const [selectedPresets, setSelectedPresets] = useState(['p1','p2','p3','p4','p6']);
  const [household, setHousehold] = useState({ atHome: true, livesAlone: false, hasPets: true, hearingStatus: 'mixed' });
  const [holdProgress, setHoldProgress] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [sdUrg, setSdUrg] = useState('important');
  const [sdZones, setSdZones] = useState({ Home: true, Work: true, Transit: false });
  const [zdRadius, setZdRadius] = useState('medium');
  const [zdMode, setZdMode] = useState('home');
  const [zdSounds, setZdSounds] = useState({ 'Fire Alarm': true, 'Smoke Detector': true, 'Doorbell': true, 'Phone Ringing': false, 'Microwave Beep': true });
  const [zdTrigger, setZdTrigger] = useState('GPS');
  const [alertToggles, setAlertToggles] = useState({ visual: true, haptic: true, flash: false, sleep: true });
  const holdRef = useRef(null);
  const [prevScreen, setPrevScreen] = useState('dashboard');
  const dbRef = useRef(32);
  const tgtRef = useRef(32);
  const tickRef = useRef(0);

  // dB simulation
  useEffect(() => {
    let raf;
    const loop = () => {
      tickRef.current++;
      const t = tickRef.current;
      if (t % 80 === 0) tgtRef.current = 55 + Math.random() * 25;
      else if (t % 80 === 12) tgtRef.current = 25 + Math.random() * 15;
      else tgtRef.current += (Math.random() - 0.5) * 4;
      tgtRef.current = Math.max(20, Math.min(85, tgtRef.current));
      dbRef.current += (tgtRef.current - dbRef.current) * 0.15;
      if (t % 3 === 0) setDbLevel(dbRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Status cycle
  useEffect(() => {
    const timer = setTimeout(() => setStatusIdx(i => (i + 1) % statusCycle.length), statusCycle[statusIdx].ms);
    return () => clearTimeout(timer);
  }, [statusIdx]);

  // Waveform bars
  const [wBars, setWBars] = useState(Array(10).fill(4));
  useEffect(() => {
    const norm = Math.max(0, Math.min(1, (dbLevel - 20) / 60));
    const base = [6, 14, 10, 18, 7, 7, 14, 10, 18, 6];
    const iv = setInterval(() => setWBars(base.map(h => h * (0.3 + norm * 0.9 + Math.random() * 0.25))), 150);
    return () => clearInterval(iv);
  }, [dbLevel]);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); }, []);
  const nav = useCallback((s) => { setPrevScreen(prev => { setScreen(s); return screen; }); }, [screen]);

  const status = statusCycle[statusIdx];
  const p = urgPal[status.urgency] || urgPal.calm;
  const n = Math.max(0, Math.min(1, (dbLevel - 20) / 60));
  const dbLabel = dbLevel < 30 ? 'silent' : dbLevel < 45 ? 'quiet' : dbLevel < 60 ? 'moderate' : 'loud';

  // Filtered timeline events
  const filteredTimeline = timelineEvents.filter(ev => {
    if (ev.type === 'mode') return filter === 'all';
    if (filter === 'all') return true;
    return ev.urgency === filter;
  });

  const screenNames = ['Dashboard','Timeline','Event Detail','Sound Library','Sound Detail','Training','Zones','Zone Detail','Settings','Alert Prefs','Wearable','Subscription','Welcome','How It Works','Permissions','Sound Select','Home Setup','Complete','Critical Alert','Banner'];
  const screenMap = { 'Dashboard': 'dashboard', 'Timeline': 'timeline', 'Event Detail': 'eventDetail', 'Sound Library': 'sounds', 'Sound Detail': 'soundDetail', 'Training': 'training', 'Zones': 'zones', 'Zone Detail': 'zoneDetail', 'Settings': 'settings', 'Alert Prefs': 'alertPrefs', 'Wearable': 'wearable', 'Subscription': 'subscription', 'Welcome': 'welcome', 'How It Works': 'howItWorks', 'Permissions': 'permissions', 'Sound Select': 'soundSelection', 'Home Setup': 'homeSetup', 'Complete': 'complete', 'Critical Alert': 'criticalAlert', 'Banner': 'banner' };
  const activeIdx = screen === 'dashboard' ? 0 : screen === 'timeline' ? 1 : screen === 'eventDetail' ? 2 : screen === 'sounds' ? 3 : screen === 'soundDetail' ? 4 : screen === 'training' ? 5 : screen === 'zones' ? 6 : screen === 'zoneDetail' ? 7 : screen === 'settings' ? 8 : screen === 'alertPrefs' ? 9 : screen === 'wearable' ? 10 : screen === 'subscription' ? 11 : screen === 'welcome' ? 12 : screen === 'howItWorks' ? 13 : screen === 'permissions' ? 14 : screen === 'soundSelection' ? 15 : screen === 'homeSetup' ? 16 : screen === 'complete' ? 17 : screen === 'criticalAlert' ? 18 : screen === 'banner' ? 19 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes sonarPulse { 0% { transform: scale(0.5); opacity: 0.5; } 100% { transform: scale(1.0); opacity: 0; } }
        @keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastSlide { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes screenIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes critPulse { 0%,100% { opacity: 0; } 50% { opacity: 0.10; } }
        @keyframes critSonar { 0% { transform: scale(0.6); opacity: 0.6; } 100% { transform: scale(1.0); opacity: 0; } }
        @keyframes critBorder { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes bannerIn { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes holdFill { from { stroke-dashoffset: 188; } to { stroke-dashoffset: 0; } }
        * { -ms-overflow-style: none; scrollbar-width: none; box-sizing: border-box; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#E8E4DD', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flexDirection: 'column' }}>
        
        <p style={{ textAlign: 'center', marginBottom: 14, color: T.textSecondary, fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
          SoundSense Prototype — Screen {activeIdx + 1}/20: {screenNames[activeIdx]}
        </p>

        {/* ════════════ PHONE ════════════ */}
        <div style={{ animation: 'fadeUp 0.5s ease-out' }}>
        <div style={{
          width: 360, height: 720, background: bgColor, borderRadius: 44, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(44,34,24,0.18), 0 4px 12px rgba(44,34,24,0.08)',
          display: 'flex', flexDirection: 'column', border: '7px solid #1C1710',
        }}>
          {/* Dynamic Island */}
          <div style={{ height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3, flexShrink: 0 }}>
            <div style={{ width: 100, height: 24, background: '#1C1710', borderRadius: 14 }} />
          </div>

          {/* ──── SCREENS ──── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div key={screen} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, animation: 'screenIn 0.25s ease-out' }}>

            {/* ═══ DASHBOARD ═══ */}
            {screen === 'dashboard' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>
                {/* Context Bar */}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8, borderRight: `1px solid ${T.border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Home size={12} color={T.brandLight} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, fontFamily: F, lineHeight: 1.1 }}>Home</div>
                      <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: F }}>Stationary</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ fontFamily: M, fontSize: 16, fontWeight: 500, color: T.textPrimary, lineHeight: 1 }}>{Math.round(dbLevel)}</div>
                    <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: F }}>dB {dbLabel}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 100, padding: '3px 8px' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.success, animation: 'pulseDot 2s ease-in-out infinite' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#3D6B34', fontFamily: F }}>Active</span>
                  </div>
                </div>
                {/* Sonar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 2px', flexShrink: 0 }}>
                  <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ position: 'absolute', borderRadius: '50%', width: `${i === 1 ? 100 : i === 2 ? 70 : 40}%`, height: `${i === 1 ? 100 : i === 2 ? 70 : 40}%`, border: `1.5px solid rgba(${p.rgb}, 0.18)`, animation: `sonarPulse 3.5s ease-out infinite ${(i - 1) * 0.6}s` }} />
                    ))}
                    <div style={{ position: 'absolute', width: 102, height: 102, borderRadius: '50%', border: `2px solid rgba(${p.rgb}, ${(n * 0.4).toFixed(2)})`, transform: `scale(${(1 + n * 0.25).toFixed(3)})`, transition: 'all 0.3s ease', zIndex: 1 }} />
                    <div style={{ width: 82, height: 82, borderRadius: '50%', background: T.brand, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, transform: `scale(${(1 + n * 0.16).toFixed(3)})`, transition: 'transform 0.3s ease', gap: 1 }}>
                      <Ear size={24} color="white" strokeWidth={2} />
                      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontFamily: F }}>Listening</span>
                    </div>
                  </div>
                </div>
                {/* Listening Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 20 }}>
                    {wBars.slice(0, 5).map((h, i) => <div key={i} style={{ width: 2.5, borderRadius: 1.5, height: Math.max(3, h), background: T.brand, transition: 'height 0.15s ease' }} />)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: T.textSecondary, fontFamily: F }}>Listening...</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 20 }}>
                    {wBars.slice(5).map((h, i) => <div key={i} style={{ width: 2.5, borderRadius: 1.5, height: Math.max(3, h), background: T.brand, transition: 'height 0.15s ease' }} />)}
                  </div>
                </div>
                {/* Status Line */}
                <div style={{ textAlign: 'center', padding: '6px 14px 4px', flexShrink: 0 }}>
                  {emptyMode ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: urgPal.calm.text, fontFamily: F }}>No sounds detected yet</div>
                      <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: M, marginTop: 2 }}>Monitoring 0 sounds</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: p.text, transition: 'color 0.5s ease', fontFamily: F }}>{status.text}</div>
                      <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: M, marginTop: 2 }}>{status.sub}</div>
                    </>
                  )}
                </div>
                {/* Quick Actions */}
                <div style={{ flexShrink: 0, padding: '12px 0 2px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, textAlign: 'center', marginBottom: 10, fontFamily: F }}>Quick Actions</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                    {[
                      { l: 'Zones', I: MapPin, bg: T.zonesBg, c: T.zonesIcon, target: 'zones' },
                      { l: 'Train', I: Mic, bg: T.trainBg, c: T.trainIcon, target: 'training' },
                      { l: 'Sounds', I: AudioWaveform, bg: T.soundsBg, c: T.soundsIcon, target: 'sounds' },
                      { l: 'Alerts', I: Bell, bg: T.alertsBg, c: T.alertsIcon, target: 'alertPrefs' },
                    ].map(a => (
                      <button key={a.l} onClick={() => { if (a.target === 'training') { setTrainingStep(1); setTrainingSamples(0); setTrainUrg("important"); setTrainZones({ Home: true, Work: true, Transit: false }); } nav(a.target); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.12s ease' }}
                          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        ><a.I size={18} color={a.c} strokeWidth={2} /></div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: T.textSecondary, fontFamily: F }}>{a.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Recent Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0 4px', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textTertiary, fontFamily: F }}>Recent</span>
                  {!emptyMode && <span style={{ fontSize: 10, fontWeight: 600, color: '#5B8EC4', cursor: 'pointer', fontFamily: F }} onClick={() => nav('timeline')}>View all</span>}
                </div>
                {/* Compact Log */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: 2 }}>
                  {emptyMode ? (
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: T.surfaceSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <AudioWaveform size={18} color={T.textMuted} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, fontFamily: F, marginBottom: 4 }}>No sounds detected yet</div>
                      <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, lineHeight: 1.4 }}>Sound events will appear here as{'\n'}they are detected in your environment.</div>
                    </div>
                  ) : (
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                      {dashEvents.map((ev, i) => (
                        <div key={ev.id} onClick={() => { setSelectedEvent({...ev, time: ev.time + ' AM', icon: ev.urgency === 'critical' ? Flame : ev.urgency === 'important' ? Bell : Microwave, mode: 'home', dbLevel: 60 + Math.round(Math.random()*25) }); nav('eventDetail'); }}
                          style={{ display: 'flex', alignItems: 'center', padding: '7px 10px', cursor: 'pointer', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontFamily: M, fontSize: 10, color: T.textTertiary, width: 36, flexShrink: 0 }}>{ev.time}</div>
                          <div style={{ width: 3, height: 20, borderRadius: 1.5, flexShrink: 0, marginRight: 8, background: urgBarColor[ev.urgency] || T.bgUrgency }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: F, lineHeight: 1.2 }}>{ev.name}</div>
                            <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: F }}>{ev.zone}</div>
                          </div>
                          <div style={{ fontFamily: M, fontSize: 11, fontWeight: 500, color: T.textPrimary, flexShrink: 0, marginRight: 4 }}>{ev.confidence}%</div>
                          <ChevronRight size={12} color={T.textMuted} strokeWidth={2} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ TIMELINE ═══ */}
            {screen === 'timeline' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>

                {/* Title + Date Nav */}
                <div style={{ flexShrink: 0, marginBottom: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5 }}>Timeline</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }} onClick={() => setTimelineDay(d => Math.min(d + 1, 2))}>
                      <ChevronLeft size={16} color={T.textTertiary} strokeWidth={2} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, fontFamily: F }}>
                      {timelineDay === 0 ? 'Today, Apr 13' : timelineDay === 1 ? 'Yesterday, Apr 12' : 'Fri, Apr 11'}
                    </span>
                    <button style={{ border: 'none', background: 'none', cursor: timelineDay > 0 ? 'pointer' : 'not-allowed', padding: 2, opacity: timelineDay > 0 ? 1 : 0.3 }} onClick={() => setTimelineDay(d => Math.max(d - 1, 0))}>
                      <ChevronRight size={16} color={T.textTertiary} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Mode Band */}
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 1.5, flexShrink: 0, marginBottom: 10 }}>
                  {emptyMode ? (
                    <div style={{ flex: 1, background: modeColors.home, borderRadius: 3, opacity: 0.35 }} />
                  ) : modeBand.map((seg, i) => (
                    <div key={i} style={{ flex: seg.pct, background: modeColors[seg.mode], borderRadius: 3, opacity: 0.7 }} />
                  ))}
                </div>

                {/* Filter Chips */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
                  {[
                    { id: 'all', label: 'All', color: T.textSecondary, bg: T.surfaceSecondary },
                    { id: 'critical', label: 'Critical', color: T.critical, bg: T.criticalBg },
                    { id: 'important', label: 'Important', color: T.brandLight, bg: T.importantBg },
                    { id: 'info', label: 'Info', color: T.info, bg: T.infoBg },
                    { id: 'background', label: 'Background', color: '#8A8070', bg: '#F5F3EF' },
                  ].map(chip => {
                    const active = filter === chip.id;
                    return (
                      <button key={chip.id} onClick={() => setFilter(chip.id)} style={{
                        padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
                        background: active ? chip.bg : 'transparent',
                        fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: F,
                        color: active ? chip.color : T.textMuted,
                        transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>{chip.label}</button>
                    );
                  })}
                </div>

                {/* Timeline List */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  {emptyMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: T.surfaceSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <Clock size={22} color={T.textMuted} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F, marginBottom: 6 }}>No events today</div>
                      <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: F, lineHeight: 1.5, maxWidth: 220 }}>
                        Detected sounds will appear here as they happen. Your timeline builds throughout the day.
                      </div>
                      <div style={{ marginTop: 16, padding: '8px 16px', borderRadius: 100, background: T.brandBg, border: `1px solid ${T.importantBorder}` }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.brandLight, fontFamily: F }}>SoundSense is listening</span>
                      </div>
                    </div>
                  ) : timelineDay === 2 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                      <Lock size={22} color={T.textMuted} strokeWidth={1.5} style={{ marginBottom: 10 }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: F, marginBottom: 4 }}>History locked</div>
                      <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: F, lineHeight: 1.5, maxWidth: 220, marginBottom: 14 }}>
                        Free accounts can only view the last 24 hours. Upgrade to SoundSense+ for full history.
                      </div>
                      <button onClick={() => nav('subscription')} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: T.brand, cursor: 'pointer' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'white', fontFamily: F }}>View Plans</span>
                      </button>
                    </div>
                  ) : (
                  <>
                  {filteredTimeline.map((ev, i) => {
                    // Mode change marker
                    if (ev.type === 'mode') {
                      return (
                        <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', margin: '2px 0' }}>
                          <div style={{ flex: 1, height: 1, background: T.borderLight }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: T.surface, border: `1px solid ${T.border}` }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: modeColors[ev.to] }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: T.textTertiary, fontFamily: F }}>{ev.label}</span>
                            <span style={{ fontSize: 9, color: T.textMuted, fontFamily: M }}>{ev.time}</span>
                          </div>
                          <div style={{ flex: 1, height: 1, background: T.borderLight }} />
                        </div>
                      );
                    }

                    // Event entry
                    const up = urgPal[ev.urgency] || urgPal.background;
                    const Icon = ev.icon;
                    return (
                      <div key={ev.id} style={{ display: 'flex', gap: 10, marginBottom: 2 }}>
                        {/* Time column */}
                        <div style={{ width: 46, flexShrink: 0, paddingTop: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 500, color: T.textTertiary, fontFamily: M, textAlign: 'right' }}>{ev.time}</div>
                        </div>
                        {/* Connector */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12, flexShrink: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgBarColor[ev.urgency] || T.bgUrgency, marginTop: 12, flexShrink: 0 }} />
                          {i < filteredTimeline.length - 1 && (
                            <div style={{ width: 1.5, flex: 1, background: T.borderLight, marginTop: 2 }} />
                          )}
                        </div>
                        {/* Card */}
                        <div
                          onClick={() => { setSelectedEvent(ev); nav('eventDetail'); }}
                          style={{
                            flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                            padding: '10px 12px', cursor: 'pointer', transition: 'background 0.1s', marginBottom: 6,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                          onMouseLeave={e => e.currentTarget.style.background = T.surface}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Icon */}
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: up.bg, border: `1px solid ${up.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={15} color={up.text} strokeWidth={2} />
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>{ev.name}</div>
                              <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: F }}>{ev.zone} · {ev.mode}</div>
                            </div>
                            {/* Right side */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                              <div style={{ fontFamily: M, fontSize: 11, fontWeight: 500, color: T.textPrimary }}>{ev.confidence}%</div>
                              <div style={{ fontFamily: M, fontSize: 9, color: T.textMuted }}>{ev.dbLevel} dB</div>
                            </div>
                            <ChevronRight size={12} color={T.textMuted} strokeWidth={2} style={{ flexShrink: 0 }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Bottom spacer */}
                  <div style={{ height: 8 }} />
                  </>
                  )}
                </div>
              </div>
            )}

            {/* ═══ EVENT DETAIL ═══ */}
            {screen === 'eventDetail' && selectedEvent && (() => {
              const ev = selectedEvent;
              const up = urgPal[ev.urgency] || urgPal.background;
              const Icon = ev.icon || Ear;
              const fb = feedback[ev.id];
              const reasons = [
                { icon: Shield, text: `${ev.name} is classified as ${ev.urgency} by default` },
                { icon: MapPinned, text: `Detected in ${ev.zone} (${ev.mode} mode)` },
                { icon: Volume2, text: `Sound level: ${ev.dbLevel || '—'} dB — ${(ev.dbLevel||0) > 75 ? 'very loud' : (ev.dbLevel||0) > 60 ? 'loud' : 'moderate'}` },
                { icon: Zap, text: ev.urgency === 'critical' ? 'Night-time boost applied — non-routine sound' : 'No urgency modifiers applied' },
              ];
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                  {/* Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                    <span>9:41 AM</span>
                    <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                    <span>78%</span>
                  </div>
                  {/* Nav Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginBottom: 8 }}>
                    <button onClick={() => nav(prevScreen || 'timeline')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                      <ChevronLeft size={20} color={T.textTertiary} strokeWidth={2} />
                    </button>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>Event Detail</span>
                  </div>
                  {/* Scrollable */}
                  <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                    {/* Sound Identity */}
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: up.bg, border: `1px solid ${up.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={20} color={up.text} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>{ev.name}</div>
                        <div style={{ display: 'inline-flex', marginTop: 3, padding: '2px 8px', borderRadius: 6, background: up.bg, border: `1px solid ${up.border}` }}>
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: up.text, fontFamily: F }}>{ev.urgency}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: M, fontSize: 20, fontWeight: 500, color: T.textPrimary, flexShrink: 0 }}>{ev.confidence}%</div>
                    </div>
                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 7 }}>
                      {[
                        { l: 'TIME', v: ev.time || '—', m: true },
                        { l: 'ZONE', v: ev.zone || '—', m: false },
                        { l: 'MODE', v: ev.mode || '—', m: false },
                        { l: 'LEVEL', v: ev.dbLevel ? `${ev.dbLevel} dB` : '—', m: true },
                      ].map(m => (
                        <div key={m.l} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 11px' }}>
                          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 2 }}>{m.l}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: m.m ? M : F, textTransform: m.m ? 'none' : 'capitalize' }}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                    {/* Waveform */}
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 1.5, height: 32 }}>
                        {Array.from({ length: 44 }, (_, i) => {
                          const h = Math.abs(Math.sin(i * 0.4 + (ev.id || 1)) * 24 + Math.sin(i * 0.7) * 6) + 3;
                          return <div key={i} style={{ width: 2, borderRadius: 1, height: h, background: up.text, opacity: 0.5 + Math.sin(i * 0.3) * 0.3 }} />;
                        })}
                      </div>
                      <div style={{ textAlign: 'center', marginTop: 5, fontSize: 9, color: T.textMuted, fontFamily: M }}>Audio capture · 2.0s</div>
                    </div>
                    {/* Why This Urgency */}
                    <div style={{ marginBottom: 7 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Why this urgency</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                        {reasons.map((r, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '8px 11px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                            <r.icon size={13} color={T.textTertiary} strokeWidth={1.5} style={{ marginTop: 1, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: F, lineHeight: 1.35 }}>{r.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Feedback */}
                    <div style={{ marginBottom: 7 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Was this correct?</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setFeedback(f => ({ ...f, [ev.id]: fb === 'up' ? null : 'up' }))} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0',
                          borderRadius: 10, border: `1.5px solid ${fb === 'up' ? T.successBorder : T.border}`,
                          background: fb === 'up' ? T.successBg : T.surface, cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                          <ThumbsUp size={15} color={fb === 'up' ? T.success : T.textMuted} strokeWidth={2} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: fb === 'up' ? T.success : T.textMuted, fontFamily: F }}>Correct</span>
                        </button>
                        <button onClick={() => setFeedback(f => ({ ...f, [ev.id]: fb === 'down' ? null : 'down' }))} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0',
                          borderRadius: 10, border: `1.5px solid ${fb === 'down' ? T.criticalBorder : T.border}`,
                          background: fb === 'down' ? T.criticalBg : T.surface, cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                          <ThumbsDown size={15} color={fb === 'down' ? T.critical : T.textMuted} strokeWidth={2} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: fb === 'down' ? T.critical : T.textMuted, fontFamily: F }}>Incorrect</span>
                        </button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: 5, fontSize: 9, color: T.textMuted, fontFamily: F }}>Your feedback improves detection accuracy</div>
                    </div>
                    {/* Sound Settings Link */}
                    <button onClick={() => {
                      const match = [...presetSounds, ...trainedSounds].find(s => s.name === ev.name) || presetSounds[0];
                      setSelectedSound({...match, type: match.samples !== undefined ? 'trained' : 'preset'});
                      setSdUrg(match.urgency || ev.urgency);
                      nav('soundDetail');
                    }} style={{
                      width: '100%', padding: '9px 12px', borderRadius: 10, border: `1px solid ${T.border}`,
                      background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = T.surface}
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.info, fontFamily: F }}>View {ev.name} settings</span>
                      <ChevronRight size={14} color={T.info} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ═══ SOUND LIBRARY ═══ */}
            {screen === 'sounds' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 4 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5 }}>My Sounds</div>
                  <button onClick={() => { if (emptyMode) showToast('Upgrade to SoundSense+ to train sounds'); else { setTrainingStep(1); setTrainingSamples(0); setTrainUrg("important"); setTrainZones({ Home: true, Work: true, Transit: false }); nav('training'); } }} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 10,
                    border: 'none', background: T.brand, cursor: 'pointer',
                  }}>
                    <Plus size={14} color="white" strokeWidth={2.5} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'white', fontFamily: F }}>Add Sound</span>
                  </button>
                </div>
                {/* Stats Line */}
                {!emptyMode && (
                  <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, marginBottom: 10, flexShrink: 0 }}>
                    {trainedSounds.length} trained · {presetSounds.filter(s => s.active).length} active presets · {trainedSounds.length + presetSounds.length} total
                  </div>
                )}

                {/* Scrollable */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                  {emptyMode ? (
                    <>
                      {/* Empty trained */}
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Trained Sounds</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '24px 16px', textAlign: 'center', marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: T.trainBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                          <Mic size={18} color={T.trainIcon} strokeWidth={1.5} />
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, fontFamily: F, marginBottom: 3 }}>No trained sounds yet</div>
                        <div style={{ fontSize: 10, color: T.textTertiary, fontFamily: F, lineHeight: 1.4 }}>Tap "+ Add Sound" to teach SoundSense{'\n'}your specific sounds.</div>
                      </div>

                      {/* Presets still show in empty — these are defaults */}
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Preset Sounds</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                        {presetSounds.slice(0, 5).map((s, i) => {
                          const up = urgPal[s.urgency === 'info' ? 'info' : s.urgency] || urgPal.background;
                          const Icon = s.icon;
                          return (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 11px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: up.bg, border: `1px solid ${up.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 10 }}>
                                <Icon size={14} color={up.text} strokeWidth={2} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: F }}>{s.name}</div>
                                <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: F, textTransform: 'capitalize' }}>{s.category} · {s.urgency}</div>
                              </div>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.success, opacity: 0.6 }} />
                            </div>
                          );
                        })}
                        <div style={{ padding: '8px 11px', borderTop: `1px solid ${T.borderLight}`, textAlign: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: T.info, fontFamily: F }}>+{presetSounds.length - 5} more presets</span>
                        </div>
                      </div>
                      <div style={{ height: 10 }} />
                    </>
                  ) : (
                    <>
                      {/* TRAINED SOUNDS */}
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Trained Sounds</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                        {trainedSounds.map((s, i) => {
                          const up = urgPal[s.urgency === 'info' ? 'info' : s.urgency] || urgPal.background;
                          const Icon = s.icon;
                          return (
                            <div key={s.id} onClick={() => { setSelectedSound({...s, type: 'trained'}); setSdUrg(s.urgency); setSdZones({ Home: true, Work: true, Transit: false }); nav('soundDetail'); }}
                              style={{ display: 'flex', alignItems: 'center', padding: '9px 11px', cursor: 'pointer', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', transition: 'background 0.1s' }}
                              onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ width: 34, height: 34, borderRadius: 9, background: up.bg, border: `1px solid ${up.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 10 }}>
                                <Icon size={15} color={up.text} strokeWidth={2} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>{s.name}</div>
                                <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: F }}>{s.samples} samples · {s.accuracy}% accuracy · {s.lastHeard}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.active ? T.success : T.bgUrgency, opacity: s.active ? 0.8 : 0.4 }} />
                                <ChevronRight size={12} color={T.textMuted} strokeWidth={2} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* PRESET SOUNDS */}
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Preset Sounds</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                        {presetSounds.map((s, i) => {
                          const up = urgPal[s.urgency === 'info' ? 'info' : s.urgency] || urgPal.background;
                          const Icon = s.icon;
                          return (
                            <div key={s.id} onClick={() => { setSelectedSound({...s, type: 'preset', samples: 0, accuracy: null}); setSdUrg(s.urgency); setSdZones({ Home: true, Work: false, Transit: false }); nav('soundDetail'); }}
                              style={{ display: 'flex', alignItems: 'center', padding: '8px 11px', cursor: 'pointer', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', transition: 'background 0.1s' }}
                              onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: up.bg, border: `1px solid ${up.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 10 }}>
                                <Icon size={14} color={up.text} strokeWidth={2} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: F }}>{s.name}</div>
                                <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: F, textTransform: 'capitalize' }}>{s.category} · {s.urgency}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.active ? T.success : T.bgUrgency, opacity: s.active ? 0.8 : 0.4 }} />
                                <ChevronRight size={12} color={T.textMuted} strokeWidth={2} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* SUGGESTED */}
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Suggested</div>
                      {suggestedSounds.map(s => {
                        const Icon = s.icon;
                        return (
                          <div key={s.id} onClick={() => showToast(`Train "${s.name}" → upgrade required`)}
                            style={{ background: T.surface, border: `1.5px dashed ${T.border}`, borderRadius: 12, padding: '10px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                            onMouseLeave={e => e.currentTarget.style.background = T.surface}
                          >
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.surfaceSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={14} color={T.textMuted} strokeWidth={1.5} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, fontFamily: F }}>{s.name}</div>
                              <div style={{ fontSize: 9, color: T.textMuted, fontFamily: F, textTransform: 'capitalize' }}>{s.category} · Tap to train</div>
                            </div>
                            <Plus size={14} color={T.textMuted} strokeWidth={2} />
                          </div>
                        );
                      })}
                      <div style={{ height: 10 }} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ═══ SOUND DETAIL ═══ */}
            {screen === 'soundDetail' && selectedSound && (() => {
              const s = selectedSound;
              const up = urgPal[s.urgency === 'info' ? 'info' : s.urgency] || urgPal.background;
              const Icon = s.icon || Ear;
              const mockZones = [{ name: 'Home', active: true }, { name: 'Work', active: true }, { name: 'Transit', active: false }];
              const mockDetections = [
                { time: 'Today, 9:12 AM', confidence: 94, zone: 'Kitchen' },
                { time: 'Today, 8:45 AM', confidence: 87, zone: 'Front door' },
                { time: 'Yesterday, 6:20 PM', confidence: 91, zone: 'Kitchen' },
                { time: 'Yesterday, 2:15 PM', confidence: 83, zone: 'Living room' },
                { time: 'Apr 11, 9:30 AM', confidence: 89, zone: 'Kitchen' },
              ];
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                  {/* Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                    <span>9:41 AM</span>
                    <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                    <span>78%</span>
                  </div>
                  {/* Nav Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginBottom: 8 }}>
                    <button onClick={() => nav('sounds')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                      <ChevronLeft size={20} color={T.textTertiary} strokeWidth={2} />
                    </button>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F, flex: 1 }}>{s.name}</span>
                    <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, background: up.bg, border: `1px solid ${up.border}` }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: up.text, fontFamily: F }}>{s.urgency}</span>
                    </div>
                  </div>
                  {/* Scrollable */}
                  <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                    {/* Waveform */}
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 1.5, height: 40 }}>
                        {Array.from({ length: 40 }, (_, i) => {
                          const h = Math.abs(Math.sin(i * 0.35 + (s.id?.charCodeAt?.(1) || 3)) * 30 + Math.sin(i * 0.8) * 8) + 3;
                          return <div key={i} style={{ width: 2.5, borderRadius: 1.5, height: h, background: up.text, opacity: 0.45 + Math.sin(i * 0.25) * 0.35 }} />;
                        })}
                      </div>
                      {s.type === 'trained' && <div style={{ textAlign: 'center', marginTop: 6, fontSize: 9, color: T.textMuted, fontFamily: M }}>Fingerprint from {s.samples} samples</div>}
                    </div>

                    {/* Urgency Selector */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Urgency Level</div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {['critical', 'important', 'info', 'background'].map(u => {
                          const uu = urgPal[u] || urgPal.background;
                          const isActive = sdUrg === u;
                          return (
                            <button key={u} onClick={() => setSdUrg(u)} style={{
                              flex: 1, padding: '7px 0', borderRadius: 8, border: `1.5px solid ${isActive ? uu.border : T.border}`,
                              background: isActive ? uu.bg : T.surface, cursor: 'pointer',
                            }}>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: isActive ? uu.text : T.textMuted, fontFamily: F, textAlign: 'center' }}>{u === 'background' ? 'BG' : u.slice(0, 4)}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Zone Toggles */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Active Zones</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                        {Object.keys(sdZones).map((z, i) => (
                          <div key={z} onClick={() => setSdZones(prev => ({...prev, [z]: !prev[z]}))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', cursor: 'pointer' }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F }}>{z}</span>
                            <div style={{ width: 36, height: 20, borderRadius: 10, background: sdZones[z] ? `${T.success}66` : T.border, display: 'flex', alignItems: 'center', padding: 2, transition: 'background 0.2s' }}>
                              <div style={{ width: 16, height: 16, borderRadius: 8, background: sdZones[z] ? T.success : T.textMuted, transition: 'all 0.2s', marginLeft: sdZones[z] ? 16 : 0 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Slider */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F }}>Confidence Threshold</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: M }}>0.75</div>
                      </div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ position: 'relative', height: 6, background: T.borderLight, borderRadius: 3 }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: '56%', background: T.brand, borderRadius: 3 }} />
                          <div style={{ position: 'absolute', left: '56%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: 8, background: T.brand, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: T.textMuted, fontFamily: M }}>
                          <span>0.50</span><span>0.95</span>
                        </div>
                      </div>
                    </div>

                    {/* Haptic Pattern */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Haptic Pattern</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
                            {(s.urgency === 'critical' ? [10,14,10,14,10,14,10,14] : s.urgency === 'important' ? [8,12,8,12] : [6,10]).map((h, i) => (
                              <div key={i} style={{ width: 3, height: h, borderRadius: 1.5, background: up.text, opacity: 0.6 }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: F, textTransform: 'capitalize' }}>{s.urgency} pattern</span>
                        </div>
                        <button onClick={() => showToast('Haptic test (simulated)')} style={{
                          padding: '5px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer',
                          fontSize: 10, fontWeight: 600, color: T.info, fontFamily: F,
                        }}>Test</button>
                      </div>
                    </div>

                    {/* Training Info (trained only) */}
                    {s.type === 'trained' && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Training</div>
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div><div style={{ fontSize: 9, color: T.textMuted, fontFamily: F }}>Samples</div><div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: M }}>{s.samples}</div></div>
                            <div><div style={{ fontSize: 9, color: T.textMuted, fontFamily: F }}>Accuracy</div><div style={{ fontSize: 14, fontWeight: 700, color: T.success, fontFamily: M }}>{s.accuracy}%</div></div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setTrainingStep(2); setTrainingSamples(s.samples || 0); nav('training'); }} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer', fontSize: 10, fontWeight: 600, color: T.textSecondary, fontFamily: F }}>Add More</button>
                            <button onClick={() => { setTrainingStep(1); setTrainingSamples(0); setTrainUrg("important"); setTrainZones({ Home: true, Work: true, Transit: false }); nav('training'); }} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer', fontSize: 10, fontWeight: 600, color: T.critical, fontFamily: F }}>Retrain</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Last Detections */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Last Detections</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                        {mockDetections.map((d, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 11px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                            <span style={{ fontSize: 10, color: T.textTertiary, fontFamily: M }}>{d.time}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 9, color: T.textMuted, fontFamily: F }}>{d.zone}</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary, fontFamily: M }}>{d.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══ TRAINING FLOW ═══ */}
            {screen === 'training' && (() => {
              const step = trainingStep;
              const categories = ['safety', 'door', 'appliance', 'voice', 'environment'];
              const dotColor = (i) => i + 1 <= step ? T.brand : T.borderLight;
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                  {/* Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                    <span>9:41 AM</span>
                    <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                    <span>78%</span>
                  </div>
                  {/* Nav Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginBottom: 6 }}>
                    <button onClick={() => { if (step > 1) { setTrainingStep(step - 1); } else { setTrainingStep(1); setTrainingSamples(0); setTrainUrg("important"); setTrainZones({ Home: true, Work: true, Transit: false }); nav('sounds'); } }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                      <ChevronLeft size={20} color={T.textTertiary} strokeWidth={2} />
                    </button>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F, flex: 1 }}>Train New Sound</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, fontFamily: M }}>Step {step}/5</span>
                  </div>
                  {/* Step Dots */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14, flexShrink: 0 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 4, background: dotColor(i - 1), transition: 'all 0.3s ease' }} />
                    ))}
                  </div>

                  {/* Scrollable Step Content */}
                  <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                    {/* STEP 1: Name + Category */}
                    {step === 1 && (
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: F, marginBottom: 4 }}>Name your sound</div>
                        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, marginBottom: 14, lineHeight: 1.4 }}>Give it a name you'll recognize. Pick the category that best describes it.</div>
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Sound Name</div>
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 14px', marginBottom: 14, fontSize: 14, color: T.textPrimary, fontFamily: F }}>
                          My Doorbell
                        </div>
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Category</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {categories.map((c, i) => (
                            <button key={c} style={{
                              padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${i === 1 ? T.importantBorder : T.border}`,
                              background: i === 1 ? T.importantBg : T.surface, cursor: 'pointer',
                              fontSize: 11, fontWeight: i === 1 ? 700 : 500, color: i === 1 ? T.brandLight : T.textMuted, fontFamily: F, textTransform: 'capitalize',
                            }}>{c}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Record Samples */}
                    {step === 2 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: F, marginBottom: 4 }}>Record samples</div>
                        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, marginBottom: 20, lineHeight: 1.4 }}>Make the sound and tap record. You need at least 3 samples for a good fingerprint.</div>
                        {/* Record Button */}
                        <button onClick={() => setTrainingSamples(Math.min(trainingSamples + 1, 5))} style={{
                          width: 72, height: 72, borderRadius: '50%', border: `3px solid ${T.critical}`, background: trainingSamples > 0 ? T.criticalBg : T.surface,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                          transition: 'all 0.15s',
                        }}
                          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Mic size={28} color={T.critical} strokeWidth={2} />
                        </button>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, fontFamily: F, marginBottom: 16 }}>Tap to record</div>
                        {/* Sample indicators */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                border: `1.5px ${i <= trainingSamples ? 'solid' : 'dashed'} ${i <= trainingSamples ? T.success : T.border}`,
                                background: i <= trainingSamples ? T.successBg : T.surface,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {i <= trainingSamples ? <Check size={16} color={T.success} strokeWidth={2.5} /> : <span style={{ fontSize: 11, color: T.textMuted, fontFamily: M }}>{i}</span>}
                              </div>
                              {i <= trainingSamples && <div style={{ width: 4, height: 4, borderRadius: 2, background: T.success }} />}
                            </div>
                          ))}
                        </div>
                        {/* Waveform preview */}
                        {trainingSamples > 0 && (
                          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 1.5, height: 28 }}>
                              {Array.from({ length: 36 }, (_, i) => {
                                const h = Math.abs(Math.sin(i * 0.5 + trainingSamples) * 20 + Math.sin(i * 0.3) * 6) + 3;
                                return <div key={i} style={{ width: 2, borderRadius: 1, height: h, background: T.brand, opacity: 0.5 + Math.sin(i * 0.4) * 0.3 }} />;
                              })}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: 5, fontSize: 9, color: T.textMuted, fontFamily: M }}>Sample {trainingSamples} captured · 2.1s</div>
                          </div>
                        )}
                        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: trainingSamples >= 3 ? T.success : T.textMuted, fontFamily: F }}>
                          {trainingSamples >= 3 ? `✓ ${trainingSamples} samples recorded — ready to test` : `${trainingSamples}/3 minimum samples`}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Test */}
                    {step === 3 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: F, marginBottom: 4 }}>Test your sound</div>
                        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, marginBottom: 20, lineHeight: 1.4 }}>Make the sound again. SoundSense will compare it against your recorded fingerprint.</div>
                        {/* Result Circle */}
                        <div style={{
                          width: 100, height: 100, borderRadius: '50%', background: T.successBg, border: `2px solid ${T.successBorder}`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        }}>
                          <div style={{ fontSize: 28, fontWeight: 800, color: T.success, fontFamily: M }}>92%</div>
                          <div style={{ fontSize: 9, fontWeight: 600, color: T.success, fontFamily: F }}>Match</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.success, fontFamily: F, marginBottom: 6 }}>Excellent match!</div>
                        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, lineHeight: 1.4 }}>SoundSense can reliably identify this sound.{'\n'}You can continue or re-record for better accuracy.</div>
                      </div>
                    )}

                    {/* STEP 4: Configure */}
                    {step === 4 && (
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: F, marginBottom: 4 }}>Configure alerts</div>
                        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, marginBottom: 14, lineHeight: 1.4 }}>Set the urgency level and choose where this sound should be detected.</div>
                        {/* Urgency */}
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Urgency Level</div>
                        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                          {['critical', 'important', 'info', 'background'].map(u => {
                            const uu = urgPal[u] || urgPal.background;
                            const active = trainUrg === u;
                            return (
                              <button key={u} onClick={() => setTrainUrg(u)} style={{
                                flex: 1, padding: '8px 0', borderRadius: 8, border: `1.5px solid ${active ? uu.border : T.border}`,
                                background: active ? uu.bg : T.surface, cursor: 'pointer',
                              }}>
                                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: active ? uu.text : T.textMuted, fontFamily: F, textAlign: 'center' }}>{u === 'background' ? 'BG' : u.slice(0, 4)}</div>
                              </button>
                            );
                          })}
                        </div>
                        {/* Zones */}
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Active Zones</div>
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                          {['Home', 'Work', 'Transit'].map((z, i) => {
                            const isOn = trainZones[z];
                            return (
                              <div key={z} onClick={() => setTrainZones(prev => ({...prev, [z]: !prev[z]}))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', cursor: 'pointer' }}>
                                <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F }}>{z}</span>
                                <div style={{ width: 36, height: 20, borderRadius: 10, background: isOn ? `${T.success}66` : T.border, display: 'flex', alignItems: 'center', padding: 2, transition: 'background 0.2s' }}>
                                  <div style={{ width: 16, height: 16, borderRadius: 8, background: isOn ? T.success : T.textMuted, marginLeft: isOn ? 16 : 0, transition: 'all 0.2s' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Haptic */}
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Haptic Pattern</div>
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
                            {(trainUrg === 'critical' ? [10,14,10,14,10,14,10,14] : trainUrg === 'important' ? [8,12,8,12] : trainUrg === 'info' ? [6,10] : []).map((h, i) => <div key={i} style={{ width: 3, height: h, borderRadius: 1.5, background: (urgPal[trainUrg] || urgPal.background).text, opacity: 0.6 }} />)}
                            {trainUrg === 'background' && <span style={{ fontSize: 9, color: T.textMuted, fontFamily: F, fontStyle: 'italic' }}>None</span>}
                          </div>
                          <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: F, textTransform: 'capitalize' }}>{trainUrg} pattern</span>
                          <button onClick={() => showToast('Haptic test')} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer', fontSize: 10, fontWeight: 600, color: T.info, fontFamily: F }}>Test</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Summary + Save */}
                    {step === 5 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.successBg, border: `2px solid ${T.successBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <Check size={28} color={T.success} strokeWidth={2.5} />
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: F, marginBottom: 4 }}>Ready to save!</div>
                        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, marginBottom: 18, lineHeight: 1.4 }}>Here's a summary of your new sound.</div>
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, textAlign: 'left' }}>
                          {[
                            { l: 'Name', v: 'My Doorbell' },
                            { l: 'Category', v: 'Door' },
                            { l: 'Samples', v: `${Math.max(trainingSamples, 3)} recorded` },
                            { l: 'Confidence', v: '92% match' },
                            { l: 'Urgency', v: 'Important' },
                            { l: 'Zones', v: 'Home, Work' },
                          ].map((r, i) => (
                            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                              <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: F }}>{r.l}</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary, fontFamily: F }}>{r.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div style={{ flexShrink: 0, padding: '10px 0 6px' }}>
                    <button onClick={() => {
                      if (step < 5) { setTrainingStep(step + 1); }
                      else { setTrainingStep(1); setTrainingSamples(0); setTrainUrg("important"); setTrainZones({ Home: true, Work: true, Transit: false }); nav('sounds'); showToast('✓ Sound saved!'); }
                    }} disabled={step === 2 && trainingSamples < 3}
                      style={{
                        width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', cursor: (step === 2 && trainingSamples < 3) ? 'not-allowed' : 'pointer',
                        background: (step === 2 && trainingSamples < 3) ? T.border : step === 5 ? T.success : T.brand,
                        opacity: (step === 2 && trainingSamples < 3) ? 0.5 : 1,
                        fontSize: 13, fontWeight: 700, color: 'white', fontFamily: F, transition: 'all 0.15s',
                      }}
                    >
                      {step === 5 ? 'Save Sound' : step === 2 ? (trainingSamples < 3 ? `Record ${3 - trainingSamples} more sample${3 - trainingSamples > 1 ? 's' : ''}` : 'Continue to Test') : 'Continue'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ═══ ZONES ═══ */}
            {screen === 'zones' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5 }}>Zones</div>
                  <button onClick={() => { setSelectedZone({ id: 'new', name: 'New Zone', icon: MapPin, address: 'Set location...', mode: 'home', sounds: 0, radius: 'medium', active: false, color: T.modeHome, lat: 43.16, lng: -77.61 }); setZdRadius('medium'); setZdMode('home'); setZdTrigger('GPS'); setZdSounds({ 'Fire Alarm': true, 'Smoke Detector': true, 'Doorbell': true, 'Phone Ringing': false, 'Microwave Beep': false }); nav('zoneDetail'); }} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 10,
                    border: 'none', background: T.brand, cursor: 'pointer',
                  }}>
                    <Plus size={14} color="white" strokeWidth={2.5} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'white', fontFamily: F }}>Add Zone</span>
                  </button>
                </div>

                {/* Scrollable */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                  {/* Map Area */}
                  <div style={{
                    height: 180, background: T.surfaceSecondary, border: `1px solid ${T.border}`, borderRadius: 14,
                    marginBottom: 10, position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Grid pattern */}
                    <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.3 }}>
                      {Array.from({ length: 20 }, (_, i) => (
                        <line key={`h${i}`} x1="0" y1={i * 18} x2="100%" y2={i * 18} stroke={T.border} strokeWidth="0.5" />
                      ))}
                      {Array.from({ length: 25 }, (_, i) => (
                        <line key={`v${i}`} x1={i * 18} y1="0" x2={i * 18} y2="100%" stroke={T.border} strokeWidth="0.5" />
                      ))}
                    </svg>

                    {!emptyMode && (
                      <>
                        {/* Zone circles */}
                        <div style={{ position: 'absolute', left: '30%', top: '35%', transform: 'translate(-50%,-50%)' }}>
                          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${T.modeHome}15`, border: `1.5px solid ${T.modeHome}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.modeHome, animation: 'pulseDot 2s ease-in-out infinite' }} />
                          </div>
                          <div style={{ textAlign: 'center', marginTop: 3, fontSize: 9, fontWeight: 600, color: T.modeHome, fontFamily: F }}>Home</div>
                        </div>
                        <div style={{ position: 'absolute', left: '68%', top: '30%', transform: 'translate(-50%,-50%)' }}>
                          <div style={{ width: 96, height: 96, borderRadius: '50%', background: `${T.modeWork}10`, border: `1.5px dashed ${T.modeWork}35` }} />
                          <div style={{ textAlign: 'center', marginTop: 3, fontSize: 9, fontWeight: 600, color: T.modeWork, fontFamily: F }}>Work</div>
                        </div>
                        <div style={{ position: 'absolute', left: '45%', top: '72%', transform: 'translate(-50%,-50%)' }}>
                          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${T.modeTransit}10`, border: `1.5px dashed ${T.modeTransit}35` }} />
                          <div style={{ textAlign: 'center', marginTop: 3, fontSize: 9, fontWeight: 600, color: T.modeTransit, fontFamily: F }}>Gym</div>
                        </div>
                      </>
                    )}

                    {emptyMode && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={24} color={T.textMuted} strokeWidth={1.5} />
                        <div style={{ fontSize: 11, color: T.textMuted, fontFamily: F, marginTop: 6 }}>No zones set up yet</div>
                      </div>
                    )}
                  </div>

                  {/* Currently In */}
                  {!emptyMode && (
                    <div style={{ background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 10, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.success, animation: 'pulseDot 2s ease-in-out infinite' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.success, fontFamily: F }}>Currently in: Home</span>
                      <span style={{ fontSize: 10, color: '#5B9A4F99', fontFamily: M, marginLeft: 'auto' }}>since 8:30 AM</span>
                    </div>
                  )}

                  {emptyMode ? (
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: T.zonesBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <MapPin size={20} color={T.zonesIcon} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, fontFamily: F, marginBottom: 4 }}>Set up your first zone</div>
                      <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, lineHeight: 1.4 }}>Zones let SoundSense automatically adjust{'\n'}what sounds to listen for based on where you are.</div>
                      <button onClick={() => { setSelectedZone({ id: 'new', name: 'Home', icon: Home, address: 'Set location...', mode: 'home', sounds: 0, radius: 'medium', active: false, color: T.modeHome, lat: 43.16, lng: -77.61 }); setZdRadius('medium'); setZdMode('home'); setZdTrigger('GPS'); setZdSounds({ 'Fire Alarm': true, 'Smoke Detector': true, 'Doorbell': true, 'Phone Ringing': false, 'Microwave Beep': false }); nav('zoneDetail'); }} style={{
                        marginTop: 14, padding: '8px 20px', borderRadius: 10, border: 'none',
                        background: T.brand, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: F,
                      }}>Add Your Home</button>
                    </div>
                  ) : (
                    <>
                      {/* Zone Cards */}
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Your Zones</div>
                      {mockZonesData.map(z => {
                        const Icon = z.icon;
                        const modeLabels = { home: 'Home', work: 'Work', transit: 'Transit', sleep: 'Sleep' };
                        return (
                          <div key={z.id} onClick={() => { setSelectedZone(z); setZdRadius(z.radius); setZdMode(z.mode); setZdTrigger('GPS'); setZdSounds({ 'Fire Alarm': true, 'Smoke Detector': true, 'Doorbell': true, 'Phone Ringing': z.mode === 'work', 'Microwave Beep': z.mode !== 'transit' }); nav('zoneDetail'); }}
                            style={{
                              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                              padding: '12px 14px', marginBottom: 6, cursor: 'pointer', transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                            onMouseLeave={e => e.currentTarget.style.background = T.surface}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${z.color}18`, border: `1px solid ${z.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={17} color={z.color} strokeWidth={2} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>{z.name}</span>
                                  {z.active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />}
                                </div>
                                <div style={{ fontSize: 10, color: T.textTertiary, fontFamily: F, marginTop: 1 }}>{z.address}</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                                <div style={{ padding: '2px 8px', borderRadius: 6, background: `${z.color}18`, border: `1px solid ${z.color}25` }}>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: z.color, fontFamily: F }}>{modeLabels[z.mode]}</span>
                                </div>
                                <span style={{ fontSize: 9, color: T.textMuted, fontFamily: M }}>{z.sounds} sounds</span>
                              </div>
                              <ChevronRight size={12} color={T.textMuted} strokeWidth={2} style={{ flexShrink: 0 }} />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div style={{ height: 10 }} />
                </div>
              </div>
            )}

            {/* ═══ ZONE DETAIL ═══ */}
            {screen === 'zoneDetail' && selectedZone && (() => {
              const z = selectedZone;
              const Icon = z.icon || MapPin;
              const radiusOpts = [{ l: '100m', v: 'small' }, { l: '300m', v: 'medium' }, { l: '500m', v: 'large' }];
              const modeOpts = [
                { l: 'Home', v: 'home', icon: Home, c: T.modeHome },
                { l: 'Work', v: 'work', icon: Briefcase, c: T.modeWork },
                { l: 'Transit', v: 'transit', icon: Bus, c: T.modeTransit },
                { l: 'Sleep', v: 'sleep', icon: Moon, c: T.modeSleep },
              ];
              const triggerOpts = ['GPS', 'Wi-Fi', 'Manual'];
              const zoneSounds = [
                { name: 'Fire Alarm', icon: Flame, on: true },
                { name: 'Smoke Detector', icon: AlertTriangle, on: true },
                { name: 'Doorbell', icon: Bell, on: true },
                { name: 'Phone Ringing', icon: Phone, on: z.mode === 'work' },
                { name: 'Microwave Beep', icon: Microwave, on: z.mode !== 'transit' },
              ];
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                  {/* Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                    <span>9:41 AM</span>
                    <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                    <span>78%</span>
                  </div>
                  {/* Nav Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginBottom: 8 }}>
                    <button onClick={() => nav('zones')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                      <ChevronLeft size={20} color={T.textTertiary} strokeWidth={2} />
                    </button>
                    <Icon size={18} color={z.color} strokeWidth={2} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F, flex: 1 }}>{z.name}</span>
                    {z.active && <div style={{ padding: '2px 8px', borderRadius: 6, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: T.success, fontFamily: F }}>Active</span>
                    </div>}
                  </div>
                  {/* Scrollable */}
                  <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                    {/* Location */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Location</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F }}>{z.address}</div>
                        <div style={{ fontSize: 9, color: T.textMuted, fontFamily: M, marginTop: 2 }}>{z.lat?.toFixed(4)}, {z.lng?.toFixed(4)}</div>
                      </div>
                      <button onClick={() => showToast('Getting current location...')} style={{
                        width: '100%', padding: '9px 0', borderRadius: 10, border: `1px solid ${T.border}`,
                        background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                        <Navigation size={14} color={T.info} strokeWidth={2} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.info, fontFamily: F }}>Use Current Location</span>
                      </button>
                    </div>

                    {/* Radius */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Radius</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {radiusOpts.map(r => {
                          const active = zdRadius === r.v;
                          return (
                            <button key={r.v} onClick={() => setZdRadius(r.v)} style={{
                              flex: 1, padding: '8px 0', borderRadius: 10,
                              border: `1.5px solid ${active ? T.importantBorder : T.border}`,
                              background: active ? T.importantBg : T.surface, cursor: 'pointer',
                            }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: active ? T.brandLight : T.textMuted, fontFamily: M, textAlign: 'center' }}>{r.l}</div>
                              <div style={{ fontSize: 8, color: active ? T.brandLight : T.textMuted, fontFamily: F, textAlign: 'center', marginTop: 1, textTransform: 'capitalize' }}>{r.v}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mode */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Mode</div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {modeOpts.map(m => {
                          const active = zdMode === m.v;
                          const MIcon = m.icon;
                          return (
                            <button key={m.v} onClick={() => setZdMode(m.v)} style={{
                              flex: 1, padding: '8px 4px', borderRadius: 10,
                              border: `1.5px solid ${active ? `${m.c}40` : T.border}`,
                              background: active ? `${m.c}12` : T.surface, cursor: 'pointer',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                            }}>
                              <MIcon size={16} color={active ? m.c : T.textMuted} strokeWidth={active ? 2 : 1.5} />
                              <div style={{ fontSize: 9, fontWeight: 600, color: active ? m.c : T.textMuted, fontFamily: F }}>{m.l}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sound Toggles */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Sounds in this zone</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                        {zoneSounds.map((s, i) => {
                          const SIcon = s.icon;
                          const isOn = zdSounds[s.name] !== undefined ? zdSounds[s.name] : s.on;
                          return (
                            <div key={s.name} onClick={() => setZdSounds(prev => ({...prev, [s.name]: !isOn}))} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', cursor: 'pointer' }}>
                              <SIcon size={14} color={T.textTertiary} strokeWidth={1.5} style={{ marginRight: 10, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F, flex: 1 }}>{s.name}</span>
                              <div style={{ width: 36, height: 20, borderRadius: 10, background: isOn ? `${T.success}66` : T.border, display: 'flex', alignItems: 'center', padding: 2, transition: 'background 0.2s' }}>
                                <div style={{ width: 16, height: 16, borderRadius: 8, background: isOn ? T.success : T.textMuted, marginLeft: isOn ? 16 : 0, transition: 'all 0.2s' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Trigger */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Trigger Type</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {triggerOpts.map(t => {
                          const active = zdTrigger === t;
                          return (
                            <button key={t} onClick={() => setZdTrigger(t)} style={{
                              flex: 1, padding: '8px 0', borderRadius: 10,
                              border: `1.5px solid ${active ? T.infoBorder : T.border}`,
                              background: active ? T.infoBg : T.surface, cursor: 'pointer',
                            }}>
                              <div style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? T.info : T.textMuted, fontFamily: F, textAlign: 'center' }}>{t}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delete */}
                    <button onClick={() => showToast(`Delete "${z.name}" zone`)} style={{
                      width: '100%', padding: '10px 0', borderRadius: 10, border: `1.5px solid ${T.criticalBorder}`,
                      background: T.criticalBg, cursor: 'pointer', marginBottom: 12,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.critical, fontFamily: F }}>Delete Zone</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ═══ SETTINGS HUB ═══ */}
            {screen === 'settings' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>
                {/* Title */}
                <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5, flexShrink: 0, marginBottom: 10 }}>Settings</div>

                {/* Scrollable */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                  {/* Profile Card */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.brandBg, border: `1px solid ${T.importantBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={20} color={T.brandLight} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>{emptyMode ? 'New User' : 'Aaron G.'}</div>
                      <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F }}>{emptyMode ? 'aaron@example.com' : 'aaron@soundsense.app'}</div>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 6, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: T.success, fontFamily: F }}>Free</span>
                    </div>
                  </div>

                  {/* Appearance */}
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Appearance</div>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                    <div onClick={() => setAppearanceOpen(!appearanceOpen)} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', cursor: 'pointer' }}>
                      <Palette size={16} color={T.textTertiary} strokeWidth={1.5} style={{ marginRight: 10, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F, flex: 1 }}>Background Color</span>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: bgColor, border: `1.5px solid ${T.border}`, marginRight: 6 }} />
                      <ChevronRight size={14} color={T.textMuted} strokeWidth={2} style={{ transform: appearanceOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {appearanceOpen && (
                      <div style={{ padding: '8px 12px 12px', borderTop: `1px solid ${T.borderLight}` }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                          {[
                            { name: 'Cream', hex: '#FAF7F2' },
                            { name: 'Snow', hex: '#FAFAFA' },
                            { name: 'Linen', hex: '#F5F0E8' },
                            { name: 'Stone', hex: '#F0EDEA' },
                            { name: 'Mist', hex: '#F0F4F8' },
                            { name: 'Night', hex: '#1A1A1A' },
                          ].map(c => {
                            const selected = c.hex === bgColor;
                            return (
                              <button key={c.name} onClick={() => setBgColor(c.hex)} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                              }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%', background: c.hex,
                                  border: selected ? `2px solid ${T.brand}` : `1px solid ${T.border}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {selected && <Check size={14} color={T.brand} strokeWidth={2.5} />}
                                </div>
                                <span style={{ fontSize: 8, fontWeight: 600, color: selected ? T.brandLight : T.textMuted, fontFamily: F }}>{c.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings Rows */}
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Preferences</div>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                    {[
                      { icon: Bell, label: 'Alert Preferences', target: 'alertPrefs' },
                      { icon: Watch, label: 'Apple Watch', target: 'wearable' },
                      { icon: CreditCard, label: 'Subscription', target: 'subscription' },
                    ].map((row, i) => (
                      <div key={row.label} onClick={() => nav(row.target)}
                        style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', cursor: 'pointer', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <row.icon size={16} color={T.textTertiary} strokeWidth={1.5} style={{ marginRight: 10, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F, flex: 1 }}>{row.label}</span>
                        <ChevronRight size={14} color={T.textMuted} strokeWidth={2} />
                      </div>
                    ))}
                  </div>

                  {/* Data & Privacy */}
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Data & Privacy</div>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                    {[
                      { icon: Cloud, label: 'Cloud Backup', right: 'Last synced 2m ago' },
                      { icon: Shield, label: 'Privacy Policy', external: true },
                      { icon: FileText, label: 'Terms of Service', external: true },
                    ].map((row, i) => (
                      <div key={row.label} onClick={() => showToast(`→ ${row.label}`)}
                        style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', cursor: 'pointer', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <row.icon size={16} color={T.textTertiary} strokeWidth={1.5} style={{ marginRight: 10, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F, flex: 1 }}>{row.label}</span>
                        {row.right && <span style={{ fontSize: 9, color: T.textMuted, fontFamily: M, marginRight: 6 }}>{row.right}</span>}
                        {row.external ? <ExternalLink size={13} color={T.textMuted} strokeWidth={1.5} /> : <ChevronRight size={14} color={T.textMuted} strokeWidth={2} />}
                      </div>
                    ))}
                  </div>

                  {/* Sign Out */}
                  <button onClick={() => nav('welcome')} style={{
                    width: '100%', padding: '10px 0', borderRadius: 10, border: `1px solid ${T.border}`,
                    background: T.surface, cursor: 'pointer', marginBottom: 10,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.critical, fontFamily: F }}>Sign Out</span>
                  </button>

                  {/* Version */}
                  <div style={{ textAlign: 'center', padding: '4px 0 12px' }}>
                    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: M }}>SoundSense v1.37</div>
                    <div style={{ fontSize: 9, color: T.textMuted, fontFamily: F, marginTop: 2 }}>Made with care for the deaf community</div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ALERT PREFERENCES ═══ */}
            {screen === 'alertPrefs' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>
                {/* Nav Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginBottom: 10 }}>
                  <button onClick={() => nav('settings')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} color={T.textTertiary} strokeWidth={2} />
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>Alert Preferences</span>
                </div>

                {/* Scrollable */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                  {/* Alert Type Toggles */}
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Alert Types</div>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                    {[
                      { key: 'visual', label: 'Visual Alerts', sub: 'On-screen banners and overlays' },
                      { key: 'haptic', label: 'Haptic Alerts', sub: 'Vibration patterns per urgency' },
                      { key: 'flash', label: 'Flash Alerts', sub: 'Screen flash on detection' },
                    ].map((row, i) => (
                      <div key={row.key} onClick={() => setAlertToggles(prev => ({...prev, [row.key]: !prev[row.key]}))} style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none', cursor: 'pointer' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: F }}>{row.label}</div>
                          <div style={{ fontSize: 10, color: T.textTertiary, fontFamily: F, marginTop: 1 }}>{row.sub}</div>
                        </div>
                        <div style={{ width: 40, height: 22, borderRadius: 11, background: alertToggles[row.key] ? `${T.success}66` : T.border, display: 'flex', alignItems: 'center', padding: 2, flexShrink: 0, transition: 'background 0.2s' }}>
                          <div style={{ width: 18, height: 18, borderRadius: 9, background: alertToggles[row.key] ? T.success : T.textMuted, marginLeft: alertToggles[row.key] ? 18 : 0, transition: 'all 0.2s' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Haptic Patterns */}
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Haptic Patterns</div>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                    {[
                      { urgency: 'critical', label: 'Critical', bars: [10,14,10,14,10,14,10,14], feel: 'Strong rapid pulse', color: T.critical },
                      { urgency: 'important', label: 'Important', bars: [8,12,0,8,12,0,8,12], feel: 'Double tap with pause', color: T.brandLight },
                      { urgency: 'info', label: 'Informational', bars: [6,10], feel: 'Gentle single tap', color: T.info },
                      { urgency: 'background', label: 'Background', bars: [], feel: 'Silent — no haptic', color: T.bgUrgency },
                    ].map((row, i) => (
                      <div key={row.urgency} style={{ padding: '12px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          {/* Urgency dot */}
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: F, flex: 1 }}>{row.label}</span>
                          {row.bars.length > 0 && (
                            <button onClick={() => showToast(`Haptic test: ${row.label}`)} style={{
                              padding: '4px 10px', borderRadius: 6, border: `1px solid ${T.border}`,
                              background: T.surface, cursor: 'pointer', fontSize: 9, fontWeight: 600, color: T.info, fontFamily: F,
                            }}>Test</button>
                          )}
                        </div>
                        {/* Visual bars */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20, marginBottom: 6, paddingLeft: 16 }}>
                          {row.bars.length > 0 ? row.bars.map((h, j) => (
                            <div key={j} style={{ width: 4, height: h > 0 ? h : 0, borderRadius: 2, background: h > 0 ? row.color : 'transparent', opacity: 0.7 }} />
                          )) : (
                            <span style={{ fontSize: 10, color: T.textMuted, fontFamily: F, fontStyle: 'italic' }}>None</span>
                          )}
                        </div>
                        {/* Feel description */}
                        <div style={{ fontSize: 10, color: T.textTertiary, fontFamily: F, paddingLeft: 16 }}>{row.feel}</div>
                      </div>
                    ))}
                  </div>

                  {/* Sleep Mode */}
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 5 }}>Sleep Mode</div>
                  <div onClick={() => setAlertToggles(prev => ({...prev, sleep: !prev.sleep}))} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '11px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <Moon size={16} color={T.modeSleep} strokeWidth={1.5} style={{ marginRight: 10, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: F }}>Critical alerts only</div>
                      <div style={{ fontSize: 10, color: T.textTertiary, fontFamily: F, marginTop: 1 }}>Between 10:00 PM – 6:00 AM</div>
                    </div>
                    <div style={{ width: 40, height: 22, borderRadius: 11, background: alertToggles.sleep ? `${T.modeSleep}50` : T.border, display: 'flex', alignItems: 'center', padding: 2, transition: 'background 0.2s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: alertToggles.sleep ? T.modeSleep : T.textMuted, marginLeft: alertToggles.sleep ? 18 : 0, transition: 'all 0.2s' }} />
                    </div>
                  </div>

                  <div style={{ height: 10 }} />
                </div>
              </div>
            )}

            {/* ═══ WEARABLE ═══ */}
            {screen === 'wearable' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>
                {/* Nav Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginBottom: 10 }}>
                  <button onClick={() => nav('settings')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} color={T.textTertiary} strokeWidth={2} />
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>Apple Watch</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  {/* Coming Soon Badge */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{ padding: '5px 14px', borderRadius: 100, background: T.zonesBg, border: `1px solid rgba(124,107,196,0.2)` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.zonesIcon, fontFamily: F }}>Coming Soon</span>
                    </div>
                  </div>

                  {/* Watch Mockup */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div style={{
                      width: 152, height: 184, borderRadius: 36, background: T.surface,
                      border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', position: 'relative',
                      boxShadow: '0 4px 20px rgba(44,34,24,0.08)',
                    }}>
                      {/* Watch bezel */}
                      <div style={{ position: 'absolute', inset: 4, borderRadius: 30, border: `2px solid ${T.borderLight}` }} />
                      {/* Crown */}
                      <div style={{ position: 'absolute', right: -6, top: '35%', width: 4, height: 20, borderRadius: 2, background: T.border }} />
                      {/* Screen content */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                        <Ear size={20} color="white" strokeWidth={2} />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>SoundSense</div>
                      <div style={{ fontSize: 8, color: T.textTertiary, fontFamily: M, marginTop: 2 }}>Listening...</div>
                      {/* Alert preview */}
                      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                        {[T.critical, T.brand, T.info].map((c, i) => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: c, opacity: 0.6 }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ textAlign: 'center', padding: '0 12px', marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, fontFamily: F, marginBottom: 6 }}>Haptic alerts on your wrist</div>
                    <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: F, lineHeight: 1.5 }}>
                      Get instant haptic notifications on Apple Watch when sounds are detected. Different vibration patterns for each urgency level — even when your phone is in another room.
                    </div>
                  </div>

                  {/* Feature List */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    {[
                      'Haptic alerts by urgency level',
                      'Complication for watch face',
                      'Quick glance at recent detections',
                      'Works independently from iPhone',
                    ].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                        <Check size={14} color={T.success} strokeWidth={2.5} />
                        <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: F }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button onClick={() => showToast('✓ You\'ll be notified when Watch support launches!')} style={{
                    width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                    background: T.brand, cursor: 'pointer', marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: F }}>Notify me when it's ready</span>
                  </button>

                  <div style={{ textAlign: 'center', fontSize: 10, color: T.textMuted, fontFamily: F, marginBottom: 10 }}>
                    Requires SoundSense+ subscription
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SUBSCRIPTION ═══ */}
            {screen === 'subscription' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>
                {/* Nav Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginBottom: 10 }}>
                  <button onClick={() => nav(prevScreen === 'timeline' ? 'timeline' : 'settings')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} color={T.textTertiary} strokeWidth={2} />
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>Subscription</span>
                </div>

                {/* Scrollable */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                  {/* FREE CARD */}
                  <div style={{ background: T.surface, border: `2px solid ${T.brand}`, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: F }}>Free</div>
                      <div style={{ padding: '3px 10px', borderRadius: 6, background: T.brandBg, border: `1px solid ${T.importantBorder}` }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: T.brandLight, fontFamily: F }}>Current Plan</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, fontFamily: F, marginBottom: 10 }}>
                      $0<span style={{ fontSize: 12, fontWeight: 500, color: T.textTertiary }}>/forever</span>
                    </div>
                    {[
                      { f: '11 preset sounds', on: true },
                      { f: 'Custom trained sounds', on: false },
                      { f: '4 urgency levels', on: true },
                      { f: 'Last 24h timeline', on: true },
                      { f: 'Basic haptic patterns', on: true },
                      { f: 'Apple Watch', on: false },
                      { f: 'Auto mode switching', on: false },
                    ].map(r => (
                      <div key={r.f} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0' }}>
                        <span style={{ fontSize: 12, color: r.on ? T.success : T.textMuted }}>{r.on ? '✓' : '✗'}</span>
                        <span style={{ fontSize: 11, color: r.on ? T.textSecondary : T.textMuted, fontFamily: F, textDecoration: r.on ? 'none' : 'line-through' }}>{r.f}</span>
                      </div>
                    ))}
                  </div>

                  {/* PLUS CARD */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: F, marginBottom: 4 }}>SoundSense+</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: T.brand, fontFamily: F, marginBottom: 10 }}>
                      $4.99<span style={{ fontSize: 12, fontWeight: 500, color: T.textTertiary }}>/month</span>
                    </div>
                    {[
                      { f: '11 preset sounds', on: true },
                      { f: 'Unlimited trained sounds', on: true },
                      { f: '4 urgency levels', on: true },
                      { f: 'Full history timeline', on: true },
                      { f: 'Custom haptic patterns', on: true },
                      { f: 'Apple Watch alerts', on: true },
                      { f: 'Auto mode switching (GPS)', on: true },
                      { f: 'Family sharing', on: false },
                    ].map(r => (
                      <div key={r.f} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0' }}>
                        <span style={{ fontSize: 12, color: r.on ? T.success : T.textMuted }}>{r.on ? '✓' : '✗'}</span>
                        <span style={{ fontSize: 11, color: r.on ? T.textSecondary : T.textMuted, fontFamily: F, textDecoration: r.on ? 'none' : 'line-through' }}>{r.f}</span>
                      </div>
                    ))}
                    <button onClick={() => showToast('Subscriptions coming soon!')} style={{
                      width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                      background: T.brand, cursor: 'pointer', marginTop: 10, opacity: 0.7,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: F }}>Upgrade — Coming Soon</span>
                    </button>
                  </div>

                  {/* PRO CARD */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: F }}>SoundSense Pro</span>
                      <div style={{ padding: '2px 8px', borderRadius: 6, background: T.zonesBg }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: T.zonesIcon, fontFamily: F }}>COMING SOON</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.textTertiary, fontFamily: F, marginBottom: 10 }}>Contact Us</div>
                    {[
                      { f: 'Everything in SoundSense+', on: true },
                      { f: 'Family sharing', on: true },
                      { f: 'Caregiver alerts', on: true },
                      { f: 'Enterprise dashboard', on: true },
                      { f: 'Priority support', on: true },
                    ].map(r => (
                      <div key={r.f} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0' }}>
                        <span style={{ fontSize: 12, color: T.success }}>✓</span>
                        <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: F }}>{r.f}</span>
                      </div>
                    ))}
                    <button onClick={() => showToast('Contact: hello@soundsense.app')} style={{
                      width: '100%', padding: '10px 0', borderRadius: 10,
                      border: `1.5px solid ${T.border}`, background: T.surface, cursor: 'pointer', marginTop: 10,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, fontFamily: F }}>Contact Us</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ WELCOME (Onboarding) ═══ */}
            {screen === 'welcome' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
                {/* Gradient background */}
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${T.brandBg} 0%, ${T.bg} 40%, ${T.surfaceSecondary} 100%)` }} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '0 32px' }}>
                  {/* Decorative rings */}
                  <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', border: `1px solid ${T.border}`, opacity: 0.4 }} />
                  <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: `1px solid ${T.borderLight}`, opacity: 0.25 }} />
                  
                  {/* Logo */}
                  <div style={{
                    width: 88, height: 88, borderRadius: '50%', background: T.brand,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                    boxShadow: '0 8px 32px rgba(194,149,107,0.25)',
                  }}>
                    <Ear size={38} color="white" strokeWidth={1.8} />
                  </div>

                  {/* App Name */}
                  <div style={{ fontSize: 28, fontWeight: 900, color: T.textPrimary, fontFamily: F, letterSpacing: -1, marginBottom: 6 }}>
                    SoundSense
                  </div>

                  {/* Tagline */}
                  <div style={{ fontSize: 16, fontWeight: 500, color: T.textSecondary, fontFamily: F, marginBottom: 4 }}>
                    Hear What Matters
                  </div>

                  {/* Subtitle */}
                  <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: F, textAlign: 'center', lineHeight: 1.5, maxWidth: 240, marginTop: 8 }}>
                    Sound awareness for deaf and hard-of-hearing individuals. Private, personal, powerful.
                  </div>
                </div>

                {/* Bottom CTAs */}
                <div style={{ padding: '0 24px 32px', position: 'relative', zIndex: 1, flexShrink: 0 }}>
                  <button onClick={() => nav('howItWorks')} style={{
                    width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                    background: T.brand, cursor: 'pointer', marginBottom: 10,
                    boxShadow: '0 4px 16px rgba(194,149,107,0.3)',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: F }}>Get Started</span>
                  </button>
                  <button onClick={() => showToast('→ Sign In')} style={{
                    width: '100%', padding: '12px 0', borderRadius: 14,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.textTertiary, fontFamily: F }}>I already have an account</span>
                  </button>
                </div>
              </div>
            )}

            {/* ═══ HOW IT WORKS (Onboarding) ═══ */}
            {screen === 'howItWorks' && (() => {
              const pages = [
                { icon: Ear, color: T.brand, bg: T.brandBg, title: 'Always Listening', desc: 'SoundSense continuously monitors your environment using your phone\'s microphone. It detects sound spikes and identifies what they are — all in real time.' },
                { icon: AudioWaveform, color: T.info, bg: T.infoBg, title: 'Learns Your Sounds', desc: 'Train SoundSense to recognize YOUR specific doorbell, smoke detector, or any sound. Just record 3 samples and it creates a unique audio fingerprint.' },
                { icon: Bell, color: T.critical, bg: T.criticalBg, title: 'Alerts That Matter', desc: 'Not all sounds are equal. SoundSense scores urgency based on the sound type, your location, time of day, and household context — then alerts you accordingly.' },
                { icon: Shield, color: T.success, bg: T.successBg, title: 'Private By Design', desc: 'All audio processing happens on your device. No recordings are sent to the cloud. No one hears what your phone hears — ever.' },
              ];
              const pg = pages[hiwPage];
              const PgIcon = pg.icon;
              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                  {/* Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 16px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                    <span>9:41 AM</span>
                    <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                    <span>78%</span>
                  </div>

                  {/* Skip */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 4px', flexShrink: 0 }}>
                    <button onClick={() => { setHiwPage(0); nav('permissions'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 0' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontFamily: F }}>Skip</span>
                    </button>
                  </div>

                  {/* Page Content */}
                  <div key={hiwPage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', animation: 'screenIn 0.3s ease-out' }}>
                    {/* Icon */}
                    <div style={{
                      width: 80, height: 80, borderRadius: 24, background: pg.bg, border: `1px solid ${pg.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                    }}>
                      <PgIcon size={34} color={pg.color} strokeWidth={1.8} />
                    </div>
                    {/* Title */}
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, fontFamily: F, textAlign: 'center', marginBottom: 10, letterSpacing: -0.3 }}>{pg.title}</div>
                    {/* Description */}
                    <div style={{ fontSize: 13, color: T.textTertiary, fontFamily: F, textAlign: 'center', lineHeight: 1.55, maxWidth: 260 }}>{pg.desc}</div>
                  </div>

                  {/* Bottom: dots + button */}
                  <div style={{ padding: '0 24px 28px', flexShrink: 0 }}>
                    {/* Page Dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                      {pages.map((_, i) => (
                        <div key={i} onClick={() => setHiwPage(i)} style={{
                          width: i === hiwPage ? 20 : 8, height: 8, borderRadius: 4, cursor: 'pointer',
                          background: i === hiwPage ? T.brand : T.borderLight, transition: 'all 0.3s ease',
                        }} />
                      ))}
                    </div>
                    {/* Continue */}
                    <button onClick={() => {
                      if (hiwPage < 3) setHiwPage(hiwPage + 1);
                      else { setHiwPage(0); nav('permissions'); }
                    }} style={{
                      width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                      background: T.brand, cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: F }}>{hiwPage < 3 ? 'Continue' : 'Next'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ═══ PERMISSIONS (Onboarding) ═══ */}
            {screen === 'permissions' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5, marginBottom: 4, flexShrink: 0 }}>Permissions</div>
                  <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: F, lineHeight: 1.4, marginBottom: 16, flexShrink: 0 }}>SoundSense needs a few permissions to work. Microphone access is required — the rest enhance your experience.</div>

                  {/* Permission Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {[
                      { key: 'mic', icon: Mic, color: T.critical, bg: T.criticalBg, title: 'Microphone', desc: 'Required to detect and identify sounds in your environment.', required: true },
                      { key: 'location', icon: MapPin, color: T.info, bg: T.infoBg, title: 'Location', desc: 'Recommended for automatic zone switching when you arrive home or work.', required: false },
                      { key: 'notifs', icon: Bell, color: T.brand, bg: T.brandBg, title: 'Notifications', desc: 'Recommended to receive alerts when important sounds are detected.', required: false },
                    ].map(p => {
                      const granted = perms[p.key];
                      const PIcon = p.icon;
                      return (
                        <div key={p.key} style={{
                          background: T.surface, border: `1px solid ${granted ? T.successBorder : T.border}`,
                          borderRadius: 14, padding: 14, transition: 'border-color 0.3s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: 12, background: granted ? T.successBg : p.bg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              transition: 'background 0.3s',
                            }}>
                              {granted ? <Check size={20} color={T.success} strokeWidth={2.5} /> : <PIcon size={18} color={p.color} strokeWidth={2} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>{p.title}</span>
                                {p.required && !granted && (
                                  <div style={{ padding: '1px 6px', borderRadius: 4, background: T.criticalBg }}>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: T.critical, fontFamily: F }}>REQUIRED</span>
                                  </div>
                                )}
                                {!p.required && !granted && (
                                  <span style={{ fontSize: 9, color: T.textMuted, fontFamily: F }}>Recommended</span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, lineHeight: 1.4 }}>{p.desc}</div>
                              {!granted && (
                                <button onClick={() => setPerms(prev => ({ ...prev, [p.key]: true }))} style={{
                                  marginTop: 8, padding: '7px 16px', borderRadius: 8, border: 'none',
                                  background: p.color, cursor: 'pointer',
                                }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: 'white', fontFamily: F }}>Allow</span>
                                </button>
                              )}
                              {granted && (
                                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: T.success, fontFamily: F }}>✓ Granted</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom */}
                <div style={{ padding: '10px 0 24px', flexShrink: 0 }}>
                  <button onClick={() => nav('soundSelection')} disabled={!perms.mic} style={{
                    width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                    background: perms.mic ? T.brand : T.border, cursor: perms.mic ? 'pointer' : 'not-allowed',
                    opacity: perms.mic ? 1 : 0.5,
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: F }}>Continue</span>
                  </button>
                  {!perms.mic && (
                    <button onClick={() => { setPerms({ mic: false, location: false, notifs: false }); nav('soundSelection'); }} style={{
                      width: '100%', padding: '10px 0', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: 4,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontFamily: F }}>Skip for now</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ═══ SOUND SELECTION (Onboarding) ═══ */}
            {screen === 'soundSelection' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5, marginBottom: 2, flexShrink: 0 }}>Choose Sounds</div>
                <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: F, lineHeight: 1.4, marginBottom: 12, flexShrink: 0 }}>Select the sounds you want SoundSense to listen for. You can change these anytime.</div>

                {/* Selection count */}
                <div style={{ fontSize: 11, fontWeight: 600, color: selectedPresets.length > 0 ? T.success : T.textMuted, fontFamily: F, marginBottom: 10, flexShrink: 0 }}>
                  {selectedPresets.length} of 11 selected {selectedPresets.length === 0 && '— select at least 1'}
                </div>

                {/* 3-column Grid */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {presetSounds.map(s => {
                      const selected = selectedPresets.includes(s.id);
                      const up = urgPal[s.urgency === 'info' ? 'info' : s.urgency] || urgPal.background;
                      const Icon = s.icon;
                      return (
                        <button key={s.id} onClick={() => {
                          setSelectedPresets(prev => selected ? prev.filter(id => id !== s.id) : [...prev, s.id]);
                        }} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          padding: '14px 6px', borderRadius: 14, cursor: 'pointer',
                          background: selected ? T.surface : T.surface,
                          border: selected ? `2px solid ${T.brand}` : `1px solid ${T.border}`,
                          boxShadow: selected ? `0 0 12px ${T.brand}25` : 'none',
                          position: 'relative', transition: 'all 0.15s',
                        }}>
                          {/* Checkmark */}
                          {selected && (
                            <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={10} color="white" strokeWidth={3} />
                            </div>
                          )}
                          {/* Icon */}
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: selected ? up.bg : T.surfaceSecondary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                            transition: 'background 0.15s',
                          }}>
                            <Icon size={17} color={selected ? up.text : T.textMuted} strokeWidth={1.8} />
                          </div>
                          {/* Name */}
                          <div style={{
                            fontSize: 10, fontWeight: selected ? 700 : 500,
                            color: selected ? T.textPrimary : T.textTertiary,
                            fontFamily: F, textAlign: 'center', lineHeight: 1.2,
                          }}>{s.name}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ height: 10 }} />
                </div>

                {/* Continue */}
                <div style={{ padding: '8px 0 24px', flexShrink: 0 }}>
                  <button onClick={() => nav('homeSetup')} disabled={selectedPresets.length === 0} style={{
                    width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                    background: selectedPresets.length > 0 ? T.brand : T.border,
                    cursor: selectedPresets.length > 0 ? 'pointer' : 'not-allowed',
                    opacity: selectedPresets.length > 0 ? 1 : 0.5,
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: F }}>Continue with {selectedPresets.length} sounds</span>
                  </button>
                </div>
              </div>
            )}

            {/* ═══ HOME SETUP (Onboarding) ═══ */}
            {screen === 'homeSetup' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', overflow: 'hidden', minHeight: 0 }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5, marginBottom: 4, flexShrink: 0 }}>Home Setup</div>
                <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: F, lineHeight: 1.4, marginBottom: 16, flexShrink: 0 }}>Tell SoundSense about your home so it can better understand your environment.</div>

                {/* Scrollable */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                  {/* At Home Toggle */}
                  <div style={{ background: T.surface, border: `1px solid ${household.atHome ? T.successBorder : T.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: household.atHome ? 10 : 0 }}>
                      <Home size={18} color={household.atHome ? T.modeHome : T.textMuted} strokeWidth={1.8} style={{ marginRight: 10 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>Are you at home?</div>
                        <div style={{ fontSize: 10, color: T.textTertiary, fontFamily: F, marginTop: 1 }}>We'll save your current location as your Home zone</div>
                      </div>
                      <div onClick={() => setHousehold(h => ({...h, atHome: !h.atHome}))} style={{ width: 40, height: 22, borderRadius: 11, background: household.atHome ? `${T.success}66` : T.border, display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer' }}>
                        <div style={{ width: 18, height: 18, borderRadius: 9, background: household.atHome ? T.success : T.textMuted, marginLeft: household.atHome ? 18 : 0, transition: 'all 0.2s' }} />
                      </div>
                    </div>
                    {household.atHome && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, background: T.successBg }}>
                        <Navigation size={12} color={T.success} strokeWidth={2} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: T.success, fontFamily: F }}>Location detected — Rochester, NY</span>
                      </div>
                    )}
                  </div>

                  {/* Household Section */}
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Household</div>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                    {/* Lives Alone */}
                    <div onClick={() => setHousehold(h => ({...h, livesAlone: !h.livesAlone}))} style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', cursor: 'pointer' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F, flex: 1 }}>I live alone</span>
                      <div style={{ width: 40, height: 22, borderRadius: 11, background: household.livesAlone ? `${T.success}66` : T.border, display: 'flex', alignItems: 'center', padding: 2 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 9, background: household.livesAlone ? T.success : T.textMuted, marginLeft: household.livesAlone ? 18 : 0, transition: 'all 0.2s' }} />
                      </div>
                    </div>
                    {/* Has Pets */}
                    <div onClick={() => setHousehold(h => ({...h, hasPets: !h.hasPets}))} style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', borderTop: `1px solid ${T.borderLight}`, cursor: 'pointer' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary, fontFamily: F, flex: 1 }}>I have pets</span>
                      <div style={{ width: 40, height: 22, borderRadius: 11, background: household.hasPets ? `${T.success}66` : T.border, display: 'flex', alignItems: 'center', padding: 2 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 9, background: household.hasPets ? T.success : T.textMuted, marginLeft: household.hasPets ? 18 : 0, transition: 'all 0.2s' }} />
                      </div>
                    </div>
                  </div>

                  {/* Hearing Status */}
                  {!household.livesAlone && (
                    <>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.textMuted, fontFamily: F, marginBottom: 6 }}>Others in household</div>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                        {[
                          { v: 'all_hearing', l: 'All hearing' },
                          { v: 'mixed', l: 'Some deaf / HoH' },
                          { v: 'all_deaf', l: 'All deaf / HoH' },
                        ].map((opt, i) => {
                          const sel = household.hearingStatus === opt.v;
                          return (
                            <div key={opt.v} onClick={() => setHousehold(h => ({...h, hearingStatus: opt.v}))} style={{
                              display: 'flex', alignItems: 'center', padding: '11px 12px', cursor: 'pointer',
                              borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none',
                              background: sel ? T.brandBg : 'transparent',
                            }}>
                              <span style={{ fontSize: 12, fontWeight: sel ? 600 : 500, color: sel ? T.brandLight : T.textPrimary, fontFamily: F, flex: 1 }}>{opt.l}</span>
                              <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                border: sel ? 'none' : `1.5px solid ${T.border}`,
                                background: sel ? T.brand : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {sel && <Check size={11} color="white" strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Info card */}
                  <div style={{ background: T.infoBg, border: `1px solid ${T.infoBorder}`, borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: T.info, fontFamily: F, lineHeight: 1.4 }}>
                      This helps SoundSense adjust urgency. For example, a doorbell is more critical if you live alone than if someone else can answer it.
                    </div>
                  </div>

                  <div style={{ height: 10 }} />
                </div>

                {/* Continue */}
                <div style={{ padding: '8px 0 24px', flexShrink: 0 }}>
                  <button onClick={() => nav('complete')} style={{
                    width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                    background: T.brand, cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: F }}>Continue</span>
                  </button>
                </div>
              </div>
            )}

            {/* ═══ SETUP COMPLETE (Onboarding) ═══ */}
            {screen === 'complete' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
                {/* Subtle gradient */}
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${T.successBg} 0%, ${T.bg} 50%)` }} />

                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 16px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M, flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <span>9:41 AM</span>
                  <span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span>
                  <span>78%</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', position: 'relative', zIndex: 1 }}>
                  {/* Checkmark */}
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', background: T.success,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                    boxShadow: '0 6px 24px rgba(91,154,79,0.3)',
                  }}>
                    <Check size={32} color="white" strokeWidth={2.5} />
                  </div>

                  <div style={{ fontSize: 24, fontWeight: 900, color: T.textPrimary, fontFamily: F, letterSpacing: -0.5, marginBottom: 8 }}>You're all set!</div>
                  <div style={{ fontSize: 13, color: T.textTertiary, fontFamily: F, textAlign: 'center', lineHeight: 1.5, marginBottom: 24 }}>
                    SoundSense is ready to start listening. Here's what we set up for you:
                  </div>

                  {/* Summary Card */}
                  <div style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
                    {[
                      { label: 'Sounds', value: `${selectedPresets.length} preset sounds selected` },
                      { label: 'Home Zone', value: household.atHome ? 'Rochester, NY (GPS)' : 'Not set' },
                      { label: 'Household', value: household.livesAlone ? 'Lives alone' : `With others (${household.hearingStatus === 'all_hearing' ? 'all hearing' : household.hearingStatus === 'mixed' ? 'some deaf/HoH' : 'all deaf/HoH'})` },
                      { label: 'Pets', value: household.hasPets ? 'Yes' : 'No' },
                      { label: 'Microphone', value: perms.mic ? 'Granted' : 'Not granted' },
                    ].map((r, i) => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                        <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: F }}>{r.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary, fontFamily: F }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ padding: '0 24px 28px', position: 'relative', zIndex: 1, flexShrink: 0 }}>
                  <button onClick={() => nav('dashboard')} style={{
                    width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                    background: T.success, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(91,154,79,0.3)',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: F }}>Start Listening</span>
                  </button>
                </div>
              </div>
            )}

            {/* ═══ CRITICAL ALERT OVERLAY ═══ */}
            {screen === 'criticalAlert' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
                {/* Red radial gradient bg */}
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, ${T.criticalBg} 0%, ${T.bg} 70%)` }} />
                {/* Pulsing red flash */}
                <div style={{ position: 'absolute', inset: 0, background: T.critical, animation: 'critPulse 1.5s ease-in-out infinite', pointerEvents: 'none' }} />
                {/* Pulsing border */}
                <div style={{ position: 'absolute', inset: 6, borderRadius: 34, border: `2px solid ${T.critical}`, animation: 'critBorder 1.5s ease-in-out infinite', pointerEvents: 'none' }} />

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '0 28px' }}>
                  {/* Alert Sonar */}
                  <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        position: 'absolute', borderRadius: '50%',
                        width: `${i === 1 ? 100 : i === 2 ? 70 : 40}%`,
                        height: `${i === 1 ? 100 : i === 2 ? 70 : 40}%`,
                        border: `2px solid rgba(212,71,60,0.25)`,
                        animation: `critSonar 2s ease-out infinite ${(i-1)*0.4}s`,
                      }} />
                    ))}
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.critical, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 0 30px rgba(212,71,60,0.4)' }}>
                      <Flame size={30} color="white" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{ padding: '4px 14px', borderRadius: 8, background: T.critical, marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white', fontFamily: F }}>Critical Alert</span>
                  </div>

                  {/* Sound Name */}
                  <div style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, fontFamily: F, textAlign: 'center', marginBottom: 8 }}>Fire Alarm</div>

                  {/* Metadata */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.critical, fontFamily: M }}>94% match</span>
                    <span style={{ fontSize: 13, color: T.textTertiary, fontFamily: M }}>Kitchen</span>
                  </div>

                  {/* Hold to Dismiss */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div
                      onMouseDown={() => {
                        setHoldProgress(0);
                        let p = 0;
                        holdRef.current = setInterval(() => {
                          p += 2;
                          setHoldProgress(p);
                          if (p >= 100) {
                            clearInterval(holdRef.current);
                            nav('dashboard');
                            showToast('Alert dismissed');
                          }
                        }, 30);
                      }}
                      onMouseUp={() => { clearInterval(holdRef.current); setHoldProgress(0); }}
                      onMouseLeave={() => { clearInterval(holdRef.current); setHoldProgress(0); }}
                      style={{ width: 64, height: 64, borderRadius: '50%', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {/* Background circle */}
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(212,71,60,0.1)', border: `1.5px solid ${T.criticalBorder}` }} />
                      {/* Progress ring */}
                      <svg width="64" height="64" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                        <circle cx="32" cy="32" r="30" fill="none" stroke={T.critical} strokeWidth="3"
                          strokeDasharray="188" strokeDashoffset={188 - (188 * holdProgress / 100)}
                          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
                      </svg>
                      <X size={22} color={T.critical} strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
                    </div>
                    <span style={{ fontSize: 10, color: T.textTertiary, fontFamily: F }}>Hold to dismiss</span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ IMPORTANT BANNER ═══ */}
            {screen === 'banner' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                {/* Show dashboard behind the banner */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px', opacity: 0.4, filter: 'blur(1px)', pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 2px 5px', fontSize: 10, color: T.textTertiary, fontFamily: M }}>
                    <span>9:41 AM</span><span style={{ fontFamily: F, fontWeight: 600, color: T.textSecondary }}>SoundSense</span><span>78%</span>
                  </div>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={12} color={T.brandLight} strokeWidth={2} /></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>Home</div></div>
                    <div style={{ padding: '3px 8px', borderRadius: 100, background: T.successBg, border: `1px solid ${T.successBorder}` }}><span style={{ fontSize: 9, fontWeight: 700, color: '#3D6B34', fontFamily: F }}>Active</span></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                    <div style={{ width: 82, height: 82, borderRadius: '50%', background: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ear size={24} color="white" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Banner Overlay */}
                {bannerVisible && (
                  <div style={{
                    position: 'absolute', top: 44, left: 14, right: 14, zIndex: 10,
                    animation: 'bannerIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}>
                    <div
                      onClick={() => { setSelectedEvent(timelineEvents[1]); nav('eventDetail'); }}
                      style={{
                        background: `linear-gradient(135deg, rgba(194,149,107,0.12) 0%, rgba(255,255,255,0.04) 100%)`,
                        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                        border: `1px solid rgba(194,149,107,0.30)`,
                        borderRadius: 18, padding: '14px 16px', cursor: 'pointer',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.50)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.importantBg, border: `1px solid ${T.importantBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bell size={17} color={T.brandLight} strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, fontFamily: F }}>Doorbell</span>
                            <div style={{ padding: '1px 6px', borderRadius: 4, background: T.importantBg }}>
                              <span style={{ fontSize: 8, fontWeight: 700, color: T.brandLight, fontFamily: F }}>IMPORTANT</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: F, marginTop: 2 }}>Front door · 87% confidence</div>
                        </div>
                        <div style={{ fontSize: 10, color: T.textMuted, fontFamily: M, flexShrink: 0 }}>now</div>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 9, color: T.textMuted, fontFamily: F }}>↑ Swipe up to dismiss · Tap for details</div>
                    </div>
                    {/* Swipe dismiss button (simulated) */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); setBannerVisible(false); showToast('Banner dismissed'); }} style={{
                        padding: '5px 14px', borderRadius: 100, border: `1px solid ${T.border}`,
                        background: T.surface, cursor: 'pointer', fontSize: 10, fontWeight: 600, color: T.textMuted, fontFamily: F,
                      }}>Dismiss ↑</button>
                    </div>
                  </div>
                )}
                {!bannerVisible && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', zIndex: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, fontFamily: F, marginBottom: 8 }}>Banner dismissed</div>
                    <button onClick={() => setBannerVisible(true)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: T.info, fontFamily: F }}>Show again</button>
                  </div>
                )}
              </div>
            )}

            </div>
          </div>

          {/* ──── TAB BAR (hidden for onboarding + overlays) ──── */}
          {!['welcome','howItWorks','permissions','soundSelection','homeSetup','complete','criticalAlert','banner'].includes(screen) && (
          <div style={{
            height: 52, flexShrink: 0,
            background: 'rgba(250,247,242,0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${T.border}`,
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          }}>
            {[
              { id: 'listen', I: Ear, s: 'dashboard' },
              { id: 'timeline', I: Clock, s: 'timeline' },
              { id: 'sounds', I: AudioWaveform, s: 'sounds' },
              { id: 'zones', I: MapPin, s: 'zones' },
              { id: 'settings', I: Settings, s: 'settings' },
            ].map(t => {
              const on = (screen === 'dashboard' && t.id === 'listen') || (screen === 'timeline' && t.id === 'timeline') || ((screen === 'sounds' || screen === 'soundDetail' || screen === 'training') && t.id === 'sounds') || ((screen === 'zones' || screen === 'zoneDetail') && t.id === 'zones') || ((screen === 'settings' || screen === 'alertPrefs' || screen === 'wearable' || screen === 'subscription') && t.id === 'settings');
              const canNav = t.s === 'dashboard' || t.s === 'timeline' || t.s === 'sounds' || t.s === 'zones' || t.s === 'settings';
              return (
                <button key={t.id} onClick={() => canNav ? nav(t.s) : showToast(`Tab → ${t.id}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                  <t.I size={19} color={on ? T.brandLight : T.textMuted} strokeWidth={on ? 2.2 : 1.5} />
                  {on && <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.brand }} />}
                </button>
              );
            })}
          </div>
          )}

          {/* Home Indicator */}
          <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 110, height: 4, background: '#1C1710', borderRadius: 2 }} />
          </div>
        </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: 20, left: '50%',
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: '8px 14px', fontSize: 11, fontWeight: 600, color: T.textSecondary,
            boxShadow: '0 8px 24px rgba(44,34,24,0.12)', animation: 'toastSlide 0.3s ease-out',
            zIndex: 999, maxWidth: 300, fontFamily: F, whiteSpace: 'nowrap',
          }}>{toast}</div>
        )}

        {/* ──── Admin ──── */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 460 }}>
            {screenNames.map((s, i) => {
              const built = true;
              const active = i === activeIdx;
              return (
                <button key={s} onClick={() => { 
                    if (s === 'Event Detail') { setSelectedEvent(timelineEvents[0]); nav('eventDetail'); }
                    else if (s === 'Sound Detail') { setSelectedSound({...trainedSounds[0], type: 'trained'}); setSdUrg(trainedSounds[0].urgency); setSdZones({ Home: true, Work: true, Transit: false }); nav('soundDetail'); }
                    else if (s === 'Training') { setTrainingStep(1); setTrainingSamples(0); setTrainUrg("important"); setTrainZones({ Home: true, Work: true, Transit: false }); nav('training'); }
                    else if (s === 'Zone Detail') { setSelectedZone(mockZonesData[0]); setZdRadius('medium'); setZdMode('home'); setZdTrigger('GPS'); setZdSounds({ 'Fire Alarm': true, 'Smoke Detector': true, 'Doorbell': true, 'Phone Ringing': false, 'Microwave Beep': true }); nav('zoneDetail'); }
                    else if (s === 'How It Works') { setHiwPage(0); nav('howItWorks'); }
                    else if (s === 'Permissions') { setPerms({ mic: false, location: false, notifs: false }); nav('permissions'); }
                    else if (s === 'Critical Alert') { setHoldProgress(0); nav('criticalAlert'); }
                    else if (s === 'Banner') { setBannerVisible(true); nav('banner'); }
                    else if (screenMap[s]) nav(screenMap[s]);
                  }}
                  style={{
                    padding: '3px 7px', borderRadius: 5, border: 'none', fontSize: 9, fontWeight: 600, fontFamily: F,
                    background: active ? T.brand : built ? T.surfaceSecondary : '#ddd',
                    color: active ? '#fff' : built ? T.textSecondary : T.textTertiary,
                    cursor: built ? 'pointer' : 'not-allowed', opacity: built ? 1 : 0.4,
                  }}>{i + 1}. {s}</button>
              );
            })}
          </div>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button onClick={() => setEmptyMode(!emptyMode)} style={{
              padding: '5px 12px', borderRadius: 6, border: `1.5px solid ${emptyMode ? T.brandLight : T.border}`,
              background: emptyMode ? T.brandBg : T.surface, color: emptyMode ? T.brandLight : T.textTertiary,
              fontSize: 10, fontWeight: 600, fontFamily: F, cursor: 'pointer',
            }}>
              {emptyMode ? '✦ New Account ON' : '○ New Account'}
            </button>
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, fontFamily: M }}>SoundSense v1.37 — "Warm Hearth" — FINAL</div>
        </div>
      </div>
    </>
  );
}
