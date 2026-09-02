import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Home, MapPin, Navigation, MessageCircle, Send, Mic, ChevronLeft, Plus, Minus,
  CheckCircle2, XCircle, Clock, Users, LayoutDashboard, AlertTriangle, Info,
  Loader2, Phone, ArrowRight, Globe, Leaf, Package, Sprout, Wheat, BarChart3,
  FileText, User, LogOut, Pause, MapPinned, TrendingUp, Check, ShieldCheck, Lock,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ============================================================
   DESIGN TOKENS  (from Design.md — followed exactly, not improvised)
   ============================================================ */
const COLORS = {
  primary: "#1A365D",
  secondary: "#D97706",
  accent: "#B45309",
  success: "#065F46",
  successBg: "#ECFDF5",
  warningBg: "#FFFBEB",
  error: "#991B1B",
  errorBg: "#FEF2F2",
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
};

const STATUS_META = {
  Open: { color: COLORS.success, bg: COLORS.successBg, label: { en: "OPEN", hi: "खुला" }, Icon: CheckCircle2 },
  Closed: { color: COLORS.error, bg: COLORS.errorBg, label: { en: "CLOSED", hi: "बंद" }, Icon: XCircle },
  Paused: { color: COLORS.accent, bg: COLORS.warningBg, label: { en: "PAUSED", hi: "रुका हुआ" }, Icon: Pause },
};

/* ============================================================
   SYNTHETIC / MOCK DATA
   (PRD 21 & 30: all operational + weather data here is simulated
   for prototyping only — never live government or weather feeds)
   ============================================================ */
const CROPS = [
  { id: "wheat", en: "Wheat", hi: "गेहूं", Icon: Wheat, tint: "#D97706" },
  { id: "paddy", en: "Paddy", hi: "धान", Icon: Sprout, tint: "#065F46" },
  { id: "maize", en: "Maize", hi: "मक्का", Icon: Leaf, tint: "#B45309" },
  { id: "soybean", en: "Soybean", hi: "सोयाबीन", Icon: Leaf, tint: "#1A365D" },
  { id: "gram", en: "Gram", hi: "चना", Icon: Leaf, tint: "#6B7280" },
  { id: "other", en: "Other", hi: "अन्य", Icon: Package, tint: "#374151" },
];

const LOCATIONS = [
  { id: "jbp", label: "Jabalpur City", lat: 23.1815, lon: 79.9864 },
  { id: "sihora", label: "Sihora", lat: 23.4794, lon: 80.1067 },
  { id: "patan", label: "Patan", lat: 23.5389, lon: 79.9425 },
  { id: "majholi", label: "Majholi", lat: 23.3311, lon: 80.1219 },
  { id: "panagar", label: "Panagar", lat: 23.2814, lon: 79.9139 },
  { id: "kundam", label: "Kundam", lat: 23.0464, lon: 80.2431 },
];

const INITIAL_CENTERS = [
  {
    id: "c1", name: "Jabalpur Krishi Upaj Mandi", address: "Ranjhi, Jabalpur, MP",
    lat: 23.1993, lon: 79.9878, crops: ["wheat", "paddy", "maize", "soybean", "gram"],
    hours: "6:00 AM – 6:00 PM", contact: "+91 98765 43210",
    facilities: ["Parking available", "Drinking water", "Shaded waiting area", "Restroom"],
    maxCounters: 6, avgProcessingTime: 6, quietHours: "6:00 – 8:00 AM",
    weather: "Clear", weatherFactor: 1,
    status: "Open", activeCounters: 4, queueLength: 38, capacityUsedPct: 72, lastUpdated: "9:20 AM",
  },
  {
    id: "c2", name: "Sihora Procurement Centre", address: "Sihora, Jabalpur, MP",
    lat: 23.4794, lon: 80.1067, crops: ["wheat", "gram", "soybean"],
    hours: "7:00 AM – 5:00 PM", contact: "+91 98765 43211",
    facilities: ["Parking available", "Drinking water"],
    maxCounters: 3, avgProcessingTime: 8, quietHours: "7:00 – 9:00 AM",
    weather: "Clear", weatherFactor: 1,
    status: "Open", activeCounters: 2, queueLength: 9, capacityUsedPct: 30, lastUpdated: "9:05 AM",
  },
  {
    id: "c3", name: "Patan Grain Collection Centre", address: "Patan, Jabalpur, MP",
    lat: 23.5389, lon: 79.9425, crops: ["wheat", "maize", "paddy"],
    hours: "6:30 AM – 6:00 PM", contact: "+91 98765 43212",
    facilities: ["Shaded waiting area", "Restroom"],
    maxCounters: 4, avgProcessingTime: 7, quietHours: "4:00 – 6:00 PM",
    weather: "Cloudy", weatherFactor: 1.05,
    status: "Paused", activeCounters: 1, queueLength: 22, capacityUsedPct: 55, lastUpdated: "8:50 AM",
  },
  {
    id: "c4", name: "Majholi Mandi Yard", address: "Majholi, Jabalpur, MP",
    lat: 23.3311, lon: 80.1219, crops: ["paddy", "maize", "gram", "other"],
    hours: "6:00 AM – 5:00 PM", contact: "+91 98765 43213",
    facilities: ["Parking available", "Drinking water", "Restroom"],
    maxCounters: 5, avgProcessingTime: 5, quietHours: "5:00 – 7:00 AM",
    weather: "Clear", weatherFactor: 1,
    status: "Open", activeCounters: 5, queueLength: 14, capacityUsedPct: 40, lastUpdated: "9:15 AM",
  },
  {
    id: "c5", name: "Panagar Krishi Kendra", address: "Panagar, Jabalpur, MP",
    lat: 23.2814, lon: 79.9139, crops: ["wheat", "soybean", "gram"],
    hours: "6:00 AM – 6:00 PM", contact: "+91 98765 43214",
    facilities: ["Parking available"],
    maxCounters: 3, avgProcessingTime: 9, quietHours: "6:00 – 8:00 AM",
    weather: "Clear", weatherFactor: 1,
    status: "Closed", activeCounters: 0, queueLength: 0, capacityUsedPct: 0, lastUpdated: "Yesterday 6:00 PM",
  },
  {
    id: "c6", name: "Kundam Procurement Yard", address: "Kundam, Jabalpur, MP",
    lat: 23.0464, lon: 80.2431, crops: ["maize", "paddy", "other"],
    hours: "7:00 AM – 5:00 PM", contact: "+91 98765 43215",
    facilities: ["Drinking water", "Shaded waiting area"],
    maxCounters: 2, avgProcessingTime: 10, quietHours: "3:00 – 5:00 PM",
    weather: "Light Rain", weatherFactor: 1.2,
    status: "Open", activeCounters: 1, queueLength: 27, capacityUsedPct: 85, lastUpdated: "9:00 AM",
  },
];

/* ============================================================
   TRANSLATIONS (subset of UI chrome — EN / HI)
   ============================================================ */
const T = {
  tagline: { en: "Right Information, Right Time", hi: "Sahi Jankari, Sahi Samay" },
  getStarted: { en: "Get Started", hi: "Shuru Karein" },
  askSahayak: { en: "Ask Sahayak", hi: "Sahayak se Poochein" },
  featLiveQueue: { en: "Live Queue Status", hi: "Live Queue Status" },
  featRecs: { en: "Smart Recommendations", hi: "Smart Sujhaav" },
  featBestTime: { en: "Best Time Guidance", hi: "Sahi Samay ki Salah" },
  selectCrop: { en: "Select your crop", hi: "Apni fasal chunein" },
  next: { en: "Next", hi: "Aage" },
  enterQuantity: { en: "How much are you bringing?", hi: "Aap kitni matra la rahe hain?" },
  quintals: { en: "Quintals", hi: "Quintal" },
  selectLocation: { en: "Where are you starting from?", hi: "Aap kahan se shuru kar rahe hain?" },
  useMyLocation: { en: "Use My Location", hi: "Meri Location Use Karein" },
  orChoose: { en: "or choose your area", hi: "ya apna ilaka chunein" },
  seeRecommendation: { en: "See Recommendation", hi: "Sujhaav Dekhein" },
  checking1: { en: "Checking nearby queues...", hi: "Aas-paas ki queue check ho rahi hai..." },
  checking2: { en: "Estimating wait times & weather...", hi: "Wait time aur mausam ka andaza lagaya ja raha hai..." },
  checking3: { en: "Ranking best options for you...", hi: "Aapke liye sabse achhe vikalp chune ja rahe hain..." },
  recommended: { en: "Recommended For You", hi: "Aapke Liye Sujhaav" },
  estWait: { en: "Estimated Wait", hi: "Anumanit Wait" },
  distance: { en: "Distance", hi: "Doori" },
  bestTime: { en: "Best Time to Visit", hi: "Jaane ka Sabse Accha Samay" },
  whyThisCentre: { en: "Why this centre?", hi: "Yeh kendra kyun?" },
  getDirections: { en: "Get Directions", hi: "Directions Paayein" },
  viewDetails: { en: "View Centre Details", hi: "Kendra Vivaran Dekhein" },
  otherOptions: { en: "Other Nearby Options", hi: "Anya Nazdeeki Vikalp" },
  dataUpdated: { en: "Data updated", hi: "Data update kiya gaya" },
  noCentresTitle: { en: "No centres found nearby", hi: "Aas-paas koi kendra nahi mila" },
  noCentresBody: {
    en: "No active centre currently accepts this crop nearby. Try another crop, or check back once operators reopen.",
    hi: "Filhaal koi active kendra yeh fasal is ilake mein swikar nahi kar raha. Doosri fasal try karein, ya baad mein dobara dekhein.",
  },
  tryAnotherCrop: { en: "Try Another Crop", hi: "Doosri Fasal Try Karein" },
  backHome: { en: "Back to Home", hi: "Home par Jaayein" },
  centreDetails: { en: "Centre Details", hi: "Kendra Vivaran" },
  activeCounters: { en: "Active Counters", hi: "Active Counters" },
  queueLength: { en: "Farmers in Queue", hi: "Queue mein Kisan" },
  operatingHours: { en: "Operating Hours", hi: "Samay" },
  acceptedCrops: { en: "Accepted Crops", hi: "Swikrit Fasalein" },
  facilities: { en: "Facilities", hi: "Suvidhaayein" },
  weatherNote: { en: "Weather (simulated)", hi: "Mausam (simulated)" },
  sahayakTitle: { en: "Sahayak — Procurement Assistant", hi: "Sahayak — Procurement Sahayak" },
  sahayakDisclosure: {
    en: "Sahayak only uses verified system data. If data is unavailable, it will say so.",
    hi: "Sahayak sirf verified data use karta hai. Data unavailable ho, toh hum batayenge.",
  },
  typeMessage: { en: "Type a message...", hi: "Message likhein..." },
  operatorPortal: { en: "Operator Portal", hi: "Operator Portal" },
  operatorLoginNote: {
    en: "Prototype authentication — production uses secured operator credentials (see Security.md).",
    hi: "Prototype pramanikaran — production mein surakshit operator credentials istemal honge.",
  },
  operatorId: { en: "Operator ID", hi: "Operator ID" },
  pin: { en: "PIN", hi: "PIN" },
  login: { en: "Log In", hi: "Login Karein" },
  logout: { en: "Log Out", hi: "Logout" },
  dashboard: { en: "Dashboard", hi: "Dashboard" },
  managingCentre: { en: "Managing", hi: "Managing" },
  todaysFootfall: { en: "Today's Footfall (est.)", hi: "Aaj ka Anumanit Footfall" },
  currentQueue: { en: "Current Queue", hi: "Abhi ki Queue" },
  centreStatus: { en: "Centre Status", hi: "Kendra Status" },
  queueTrend: { en: "Queue Trend — Today", hi: "Aaj ka Queue Trend" },
  quickActions: { en: "Quick Actions", hi: "Quick Actions" },
  setStatus: { en: "Set Centre Status", hi: "Kendra Status Set Karein" },
  recentUpdates: { en: "Recent Updates", hi: "Haal ke Updates" },
  noUpdatesYet: { en: "No changes yet — try the controls above.", hi: "Abhi tak koi badlaav nahi — upar diye controls try karein." },
  reactivityNote: {
    en: "Changes here immediately affect wait-time predictions and recommendations shown to farmers.",
    hi: "Yahan kiye gaye badlaav turant kisano ko dikhne wale anumaan aur sujhaav ko update karte hain.",
  },
  previewImpact: { en: "Preview impact on farmer app", hi: "Kisan app par asar dekhein" },
  prototypeBanner: {
    en: "SIH 2026 Prototype — predictions use simulated historical & weather data, not live feeds.",
    hi: "SIH 2026 Prototype — anumaan simulated data (mausam sahit) par aadharit hain, live feed nahi.",
  },
  farmerApp: { en: "Farmer App", hi: "Farmer App" },
  operatorDash: { en: "Operator Dashboard", hi: "Operator Dashboard" },
  demoControls: { en: "Prototype demo controls", hi: "Prototype demo controls" },
  estimateOnly: { en: "All figures are estimates from simulated prototype data, not guarantees.", hi: "Sabhi aankde simulated prototype data se anumaanit hain, guarantee nahi." },
  quantityShort: { en: "quintals", hi: "quintal" },
};
const tr = (key, lang) => (T[key] ? T[key][lang] : key);

/* ============================================================
   INTELLIGENCE LAYER (client-side simulation, mirrors the
   Architecture.md separation: ML prediction vs. deterministic
   recommendation scoring — kept as two distinct pure functions)
   ============================================================ */
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// "ML Prediction Service" — answers "how long might I wait?"
function predictWaitTime(centre, quantity) {
  if (centre.status === "Closed") return null;
  const counters = Math.max(centre.activeCounters, 1);
  const base = (centre.queueLength / counters) * centre.avgProcessingTime;
  const capacityFactor = 1 + (centre.capacityUsedPct / 100) * 0.4;
  const quantityFactor = 1 + Math.min(quantity / 250, 0.25);
  const pausedPenalty = centre.status === "Paused" ? 1.6 : 1;
  const weatherFactor = centre.weatherFactor ?? 1;
  const wait = base * capacityFactor * quantityFactor * pausedPenalty * weatherFactor;
  return Math.max(5, Math.round(wait));
}

// "Recommendation Engine" — answers "which option is better?"
// NOTE: 0.55 / 0.35 / 0.10 weighting is a documented prototype default.
// PRD.md marks the exact production weighting as [DECISION REQUIRED] —
// tune these three constants once your team finalizes that decision.
function buildRecommendation(centers, farmerLoc, cropId, quantity) {
  const candidates = centers
    .filter((c) => c.status !== "Closed" && c.crops.includes(cropId))
    .map((c) => ({
      ...c,
      distanceKm: haversineKm(farmerLoc.lat, farmerLoc.lon, c.lat, c.lon),
      waitMin: predictWaitTime(c, quantity),
    }));

  if (candidates.length === 0) return { none: true, ranked: [] };

  const maxWait = Math.max(...candidates.map((c) => c.waitMin), 1);
  const maxDist = Math.max(...candidates.map((c) => c.distanceKm), 0.1);

  const scored = candidates
    .map((c) => ({
      ...c,
      score: 0.55 * (c.waitMin / maxWait) + 0.35 * (c.distanceKm / maxDist) + 0.1 * (c.capacityUsedPct / 100),
    }))
    .sort((a, b) => a.score - b.score);

  const top = scored[0];
  const minWait = Math.min(...scored.map((c) => c.waitMin));
  const minDist = Math.min(...scored.map((c) => c.distanceKm));

  let reasonCode = "BALANCED_CHOICE";
  if (scored.length === 1) reasonCode = "ONLY_OPEN_OPTION";
  else if (top.waitMin === minWait && top.distanceKm !== minDist) reasonCode = "SHORTEST_WAIT_TIME";
  else if (top.distanceKm === minDist && top.waitMin !== minWait) reasonCode = "CLOSEST_LOCATION";

  return { none: false, top, ranked: scored, reasonCode };
}

function reasonChecklist(top, ranked, cropId, lang) {
  const minWait = Math.min(...ranked.map((c) => c.waitMin));
  const minDist = Math.min(...ranked.map((c) => c.distanceKm));
  const crop = CROPS.find((c) => c.id === cropId);
  const cropLabel = crop ? (lang === "hi" ? crop.hi : crop.en) : "";
  return [
    {
      ok: top.waitMin === minWait,
      en: `Lowest estimated wait nearby (~${top.waitMin} min)`,
      hi: `Aas-paas mein sabse kam anumanit wait (~${top.waitMin} min)`,
    },
    {
      ok: top.distanceKm === minDist,
      en: `Closest matching centre (${top.distanceKm.toFixed(1)} km away)`,
      hi: `Sabse nazdeeki kendra (${top.distanceKm.toFixed(1)} km door)`,
    },
    { ok: true, en: `Accepting ${cropLabel} today`, hi: `${cropLabel} aaj swikar ho raha hai` },
    {
      ok: top.activeCounters > 0,
      en: `${top.activeCounters} active counter${top.activeCounters === 1 ? "" : "s"} running`,
      hi: `${top.activeCounters} counter abhi chalu hain`,
    },
  ].map((item) => ({ ok: item.ok, text: item[lang] }));
}

// Very small keyword-based NLU standing in for the real backend's
// provider-agnostic LLM tool-calling adapter (Architecture.md §10).
// This is a client-side simulation for demo purposes only — the
// production Sahayak parses natural language via an actual LLM.
function parseMessage(text) {
  const lower = text.toLowerCase();
  const cropKeywords = {
    wheat: ["wheat", "gehu", "gehun", "गेहूं"],
    paddy: ["paddy", "rice", "dhan", "chawal", "धान"],
    maize: ["maize", "makka", "corn", "मक्का"],
    soybean: ["soybean", "soya", "सोयाबीन"],
    gram: ["gram", "chana", "चना"],
  };
  let crop = null;
  for (const [key, words] of Object.entries(cropKeywords)) {
    if (words.some((w) => lower.includes(w))) { crop = key; break; }
  }
  let location = null;
  for (const loc of LOCATIONS) {
    if (lower.includes(loc.label.toLowerCase()) || lower.includes(loc.id)) { location = loc; break; }
  }
  const qMatch = lower.match(/(\d+)\s*(quintal|quintals|qtl|क्विंटल)?/);
  const quantity = qMatch ? parseInt(qMatch[1], 10) : null;
  const intent = /bheed|crowd|busy|kal|tomorrow|rahegi/.test(lower) ? "forecast" : "recommend";
  return { crop, location, quantity, intent };
}

function trendFor(center) {
  const shape = [0.15, 0.5, 0.85, 1.0, 0.7, 0.4, 0.2];
  const times = ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM"];
  const peak = Math.max(center.queueLength, 10);
  return times.map((t, i) => ({ t, q: Math.round(peak * shape[i]) }));
}

function describePatch(before, patch) {
  const parts = [];
  if (patch.status && patch.status !== before.status) parts.push(`Status: ${before.status} → ${patch.status}`);
  if (patch.activeCounters !== undefined && patch.activeCounters !== before.activeCounters) {
    parts.push(`Active counters: ${before.activeCounters} → ${patch.activeCounters}`);
  }
  return parts.join(" · ") || "Updated";
}

/* ============================================================
   SMALL UI ATOMS
   ============================================================ */
function StatusBadge({ status, lang, size = "md" }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${pad}`}
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33` }}
    >
      <Icon size={size === "sm" ? 11 : 13} />
      {meta.label[lang]}
    </span>
  );
}

function PrimaryButton({ children, onClick, disabled, className = "", full = true }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${full ? "w-full" : ""} min-h-[48px] rounded-2xl font-medium text-base px-6 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${className}`}
      style={{ background: COLORS.secondary, color: "#fff" }}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, className = "", full = true }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? "w-full" : ""} min-h-[48px] rounded-2xl font-medium text-base px-6 flex items-center justify-center gap-2 transition active:scale-[0.98] ${className}`}
      style={{ background: COLORS.surface, color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` }}
    >
      {children}
    </button>
  );
}

function DisclosureBanner({ children }) {
  return (
    <div
      className="flex items-start gap-2 rounded-xl p-3 text-xs"
      style={{ background: "#F3F4F6", color: COLORS.muted, border: `1px solid ${COLORS.border}` }}
    >
      <Info size={14} className="mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
      style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center gap-1 min-w-0">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 rounded-full flex-shrink-0" aria-label="Back">
            <ChevronLeft size={20} color={COLORS.text} />
          </button>
        )}
        <h1 className="text-base font-semibold truncate" style={{ color: COLORS.text }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

function StepDots({ step, total = 3 }) {
  return (
    <div className="flex gap-1.5 px-4 pb-3 pt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < step ? COLORS.secondary : COLORS.border }} />
      ))}
    </div>
  );
}

function ChipRow({ items, onPick }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {items.map((label) => (
        <button
          key={label}
          onClick={() => onPick(label)}
          className="text-sm px-3 py-1.5 rounded-full font-medium"
          style={{ background: "#FFF7ED", color: COLORS.accent, border: `1px solid ${COLORS.secondary}55` }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SchematicMap({ farmer, centers, highlightId, height = 170 }) {
  const pts = [farmer, ...centers];
  const lats = pts.map((p) => p.lat);
  const lons = pts.map((p) => p.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const padLat = (maxLat - minLat) * 0.3 || 0.05;
  const padLon = (maxLon - minLon) * 0.3 || 0.05;
  const w = 320;
  const lo = minLon - padLon, hi = maxLon + padLon;
  const la = minLat - padLat, ha = maxLat + padLat;
  const project = (lat, lon) => {
    const x = ((lon - lo) / (hi - lo || 1)) * w;
    const y = height - ((lat - la) / (ha - la || 1)) * height;
    return [x, y];
  };
  const [fx, fy] = project(farmer.lat, farmer.lon);
  const highlight = centers.find((c) => c.id === highlightId);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full rounded-2xl" style={{ height, background: "#EEF2F7" }}>
      {highlight && (() => {
        const [hx, hy] = project(highlight.lat, highlight.lon);
        return <line x1={fx} y1={fy} x2={hx} y2={hy} stroke={COLORS.secondary} strokeWidth="2" strokeDasharray="5,4" />;
      })()}
      {centers.map((c) => {
        const [x, y] = project(c.lat, c.lon);
        const meta = STATUS_META[c.status];
        const isTop = c.id === highlightId;
        return (
          <g key={c.id}>
            <circle cx={x} cy={y} r={isTop ? 8 : 6} fill={meta.color} stroke="#fff" strokeWidth="2" />
            <text x={x} y={y - 11} fontSize="8" textAnchor="middle" fill={COLORS.text} fontWeight={isTop ? 700 : 400}>
              {c.name.split(" ")[0]}
            </text>
          </g>
        );
      })}
      <circle cx={fx} cy={fy} r="7" fill={COLORS.primary} stroke="#fff" strokeWidth="2" />
      <text x={fx} y={fy + 17} fontSize="8" textAnchor="middle" fill={COLORS.primary} fontWeight="700">You</text>
    </svg>
  );
}

function directionsUrl(centre) {
  return `https://www.google.com/maps/dir/?api=1&destination=${centre.lat},${centre.lon}`;
}

/* ============================================================
   RECOMMENDATION CARD (shared by Result screen + Chat)
   ============================================================ */
function RecommendationCard({ result, cropId, farmerLoc, lang, compact, onViewDetails }) {
  const { top, ranked } = result;
  const checklist = reasonChecklist(top, ranked, cropId, lang);

  return (
    <div className="rounded-2xl p-4" style={{ background: COLORS.surface, border: `1.5px solid ${COLORS.secondary}55`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[15px] leading-snug" style={{ color: COLORS.text }}>{top.name}</h3>
        <StatusBadge status={top.status} lang={lang} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-[11px]" style={{ color: COLORS.muted }}>{tr("estWait", lang)}</div>
          <div className="font-bold" style={{ fontSize: 22, color: COLORS.primary }}>~{top.waitMin}m</div>
        </div>
        <div>
          <div className="text-[11px]" style={{ color: COLORS.muted }}>{tr("distance", lang)}</div>
          <div className="font-bold" style={{ fontSize: 22, color: COLORS.text }}>{top.distanceKm.toFixed(1)}k</div>
        </div>
        <div>
          <div className="text-[11px]" style={{ color: COLORS.muted }}>{tr("bestTime", lang)}</div>
          <div className="font-semibold text-xs mt-1.5 leading-tight" style={{ color: COLORS.text }}>{top.quietHours}</div>
        </div>
      </div>

      {!compact && (
        <>
          <SchematicMap farmer={farmerLoc} centers={ranked} highlightId={top.id} height={140} />
          <div className="mt-3 mb-1 text-xs font-semibold" style={{ color: COLORS.text }}>{tr("whyThisCentre", lang)}</div>
          <ul className="space-y-1 mb-3">
            {checklist.filter((c) => c.ok).map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: COLORS.muted }}>
                <Check size={13} style={{ color: COLORS.success, marginTop: 1, flexShrink: 0 }} />
                {c.text}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex gap-2">
        <a href={directionsUrl(top)} target="_blank" rel="noreferrer" className="flex-1">
          <PrimaryButton className="min-h-[42px] text-sm"><Navigation size={15} />{tr("getDirections", lang)}</PrimaryButton>
        </a>
        {onViewDetails && (
          <button onClick={() => onViewDetails(top.id)} className="flex-1">
            <OutlineButton className="min-h-[42px] text-sm" full={false}><span className="w-full">{tr("viewDetails", lang)}</span></OutlineButton>
          </button>
        )}
      </div>
      <div className="text-[10px] mt-2" style={{ color: COLORS.muted }}>{tr("dataUpdated", lang)}: {top.lastUpdated} · ~{tr("estimateOnly", lang)}</div>
    </div>
  );
}

/* ============================================================
   FARMER SCREENS
   ============================================================ */
function HomeScreen({ lang, setLang, onStart, onChat }) {
  return (
    <div className="pb-6">
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ border: `1px solid ${COLORS.border}`, color: COLORS.primary }}
        >
          <Globe size={13} />{lang === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      <div className="px-4 pt-2 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center rounded-3xl" style={{ width: 64, height: 64, background: COLORS.primary }}>
          <Wheat size={32} color="#fff" />
        </div>
        <h1 className="font-bold" style={{ fontSize: 24, color: COLORS.text }}>ProcureSmart</h1>
        <p className="text-sm mt-1" style={{ color: COLORS.accent }}>{tr("tagline", lang)}</p>
      </div>

      <div className="mx-4 mt-5 rounded-2xl p-5 text-center" style={{ background: COLORS.primary }}>
        <p className="text-white font-semibold text-[15px] leading-snug">
          {lang === "hi" ? "Kahan jaayein? Kab jaayein? Ab confusion khatam." : "Where to go? When to go? No more guesswork."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 mt-4">
        {[
          { Icon: Users, label: tr("featLiveQueue", lang) },
          { Icon: MapPinned, label: tr("featRecs", lang) },
          { Icon: Clock, label: tr("featBestTime", lang) },
        ].map(({ Icon, label }, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Icon size={20} style={{ color: COLORS.secondary, margin: "0 auto" }} />
            <div className="text-[11px] mt-1.5 font-medium leading-tight" style={{ color: COLORS.text }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-6 space-y-2.5">
        <PrimaryButton onClick={onStart}><ArrowRight size={17} />{tr("getStarted", lang)}</PrimaryButton>
        <OutlineButton onClick={onChat}><MessageCircle size={17} />{tr("askSahayak", lang)}</OutlineButton>
      </div>

      <div className="px-4 mt-6">
        <DisclosureBanner>{tr("prototypeBanner", lang)}</DisclosureBanner>
      </div>
    </div>
  );
}

function CropSelectScreen({ lang, value, onPick, onNext, onBack }) {
  return (
    <div>
      <TopBar title="ProcureSmart" onBack={onBack} />
      <StepDots step={1} />
      <div className="px-4">
        <h2 className="font-semibold mb-3" style={{ fontSize: 20, color: COLORS.text }}>{tr("selectCrop", lang)}</h2>
        <div className="grid grid-cols-3 gap-3">
          {CROPS.map((c) => {
            const selected = value === c.id;
            const Icon = c.Icon;
            return (
              <button
                key={c.id}
                onClick={() => onPick(c.id)}
                className="rounded-2xl p-3 flex flex-col items-center gap-2 relative"
                style={{ background: COLORS.surface, border: selected ? `2px solid ${COLORS.secondary}` : `1px solid ${COLORS.border}` }}
              >
                {selected && (
                  <div className="absolute top-1.5 right-1.5 rounded-full" style={{ background: COLORS.secondary }}>
                    <Check size={11} color="#fff" style={{ margin: 2 }} />
                  </div>
                )}
                <div className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, background: `${c.tint}1A` }}>
                  <Icon size={20} color={c.tint} />
                </div>
                <span className="text-xs font-medium text-center" style={{ color: COLORS.text }}>{lang === "hi" ? c.hi : c.en}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 mt-6"><PrimaryButton disabled={!value} onClick={onNext}>{tr("next", lang)}<ArrowRight size={16} /></PrimaryButton></div>
    </div>
  );
}

function QuantityScreen({ lang, value, onChange, onNext, onBack }) {
  return (
    <div>
      <TopBar title="ProcureSmart" onBack={onBack} />
      <StepDots step={2} />
      <div className="px-4">
        <h2 className="font-semibold mb-6" style={{ fontSize: 20, color: COLORS.text }}>{tr("enterQuantity", lang)}</h2>
        <div className="flex items-center justify-center gap-6 py-6">
          <button onClick={() => onChange(Math.max(1, value - 5))} className="rounded-full flex items-center justify-center" style={{ width: 48, height: 48, background: COLORS.bg, border: `1.5px solid ${COLORS.border}` }}>
            <Minus size={20} color={COLORS.primary} />
          </button>
          <div className="text-center">
            <div className="font-bold" style={{ fontSize: 44, color: COLORS.primary, lineHeight: "48px" }}>{value}</div>
            <div className="text-sm mt-1" style={{ color: COLORS.muted }}>{tr("quintals", lang)}</div>
          </div>
          <button onClick={() => onChange(Math.min(500, value + 5))} className="rounded-full flex items-center justify-center" style={{ width: 48, height: 48, background: COLORS.bg, border: `1.5px solid ${COLORS.border}` }}>
            <Plus size={20} color={COLORS.primary} />
          </button>
        </div>
      </div>
      <div className="px-4 mt-6"><PrimaryButton onClick={onNext}>{tr("next", lang)}<ArrowRight size={16} /></PrimaryButton></div>
    </div>
  );
}

function LocationScreen({ lang, query, setQuery, onNext, onBack }) {
  const [locError, setLocError] = useState(null);
  const [locating, setLocating] = useState(false);

  function useDeviceLocation() {
    if (!navigator.geolocation) { setLocError(lang === "hi" ? "Location supported nahi hai — manually chunein." : "Location isn't supported — please choose manually."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setQuery((q) => ({ ...q, customLoc: { lat: pos.coords.latitude, lon: pos.coords.longitude }, locationId: "gps" }));
      },
      () => { setLocating(false); setLocError(lang === "hi" ? "Location access nahi mila — manually chunein." : "Couldn't access your location — please choose manually."); },
      { timeout: 6000 }
    );
  }

  return (
    <div>
      <TopBar title="ProcureSmart" onBack={onBack} />
      <StepDots step={3} />
      <div className="px-4">
        <h2 className="font-semibold mb-4" style={{ fontSize: 20, color: COLORS.text }}>{tr("selectLocation", lang)}</h2>
        <button onClick={useDeviceLocation} className="w-full mb-2">
          <OutlineButton full={false} className="w-full">
            {locating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
            {tr("useMyLocation", lang)}
          </OutlineButton>
        </button>
        {locError && <p className="text-xs mb-2" style={{ color: COLORS.error }}>{locError}</p>}
        {query.customLoc && <p className="text-xs mb-2 flex items-center gap-1" style={{ color: COLORS.success }}><CheckCircle2 size={13} />{lang === "hi" ? "Device location set ho gayi." : "Using your device location."}</p>}

        <div className="text-xs text-center my-3" style={{ color: COLORS.muted }}>{tr("orChoose", lang)}</div>

        <div className="space-y-2">
          {LOCATIONS.map((loc) => {
            const selected = !query.customLoc && query.locationId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setQuery((q) => ({ ...q, locationId: loc.id, customLoc: null }))}
                className="w-full flex items-center gap-2 rounded-xl p-3"
                style={{ background: COLORS.surface, border: selected ? `2px solid ${COLORS.secondary}` : `1px solid ${COLORS.border}` }}
              >
                <MapPin size={16} color={selected ? COLORS.secondary : COLORS.muted} />
                <span className="text-sm font-medium" style={{ color: COLORS.text }}>{loc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 mt-6">
        <PrimaryButton disabled={!query.locationId && !query.customLoc} onClick={onNext}>{tr("seeRecommendation", lang)}<ArrowRight size={16} /></PrimaryButton>
      </div>
    </div>
  );
}

function LoadingScreen({ lang }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 2)), 380);
    return () => clearInterval(id);
  }, []);
  const lines = [tr("checking1", lang), tr("checking2", lang), tr("checking3", lang)];
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 420 }}>
      <Loader2 size={32} className="animate-spin" style={{ color: COLORS.secondary }} />
      <p className="text-sm mt-4 text-center px-8" style={{ color: COLORS.muted }}>{lines[step]}</p>
    </div>
  );
}

function EmptyState({ lang, onTryAnother, onHome }) {
  return (
    <div className="px-4 pt-10 text-center">
      <div className="mx-auto mb-4 flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: COLORS.errorBg }}>
        <AlertTriangle size={26} color={COLORS.error} />
      </div>
      <h2 className="font-semibold mb-2" style={{ fontSize: 18, color: COLORS.text }}>{tr("noCentresTitle", lang)}</h2>
      <p className="text-sm mb-6" style={{ color: COLORS.muted }}>{tr("noCentresBody", lang)}</p>
      <div className="space-y-2">
        <PrimaryButton onClick={onTryAnother}>{tr("tryAnotherCrop", lang)}</PrimaryButton>
        <OutlineButton onClick={onHome}>{tr("backHome", lang)}</OutlineButton>
      </div>
    </div>
  );
}

function ResultScreen({ lang, query, farmerLoc, centers, onBack, onTryAnother, onViewDetails }) {
  const result = useMemo(() => buildRecommendation(centers, farmerLoc, query.crop, query.quantity), [centers, farmerLoc, query.crop, query.quantity]);

  return (
    <div className="pb-6">
      <TopBar title={tr("recommended", lang)} onBack={onBack} />
      <div className="px-4 pt-3">
        {result.none ? (
          <EmptyState lang={lang} onTryAnother={onTryAnother} onHome={onBack} />
        ) : (
          <>
            <RecommendationCard result={result} cropId={query.crop} farmerLoc={farmerLoc} lang={lang} onViewDetails={onViewDetails} />
            {result.ranked.length > 1 && (
              <div className="mt-5">
                <div className="text-xs font-semibold mb-2" style={{ color: COLORS.text }}>{tr("otherOptions", lang)}</div>
                <div className="space-y-2">
                  {result.ranked.slice(1).map((c) => (
                    <button key={c.id} onClick={() => onViewDetails(c.id)} className="w-full flex items-center justify-between rounded-xl p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                      <div className="text-left">
                        <div className="text-sm font-medium" style={{ color: COLORS.text }}>{c.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>~{c.waitMin} min · {c.distanceKm.toFixed(1)} km</div>
                      </div>
                      <StatusBadge status={c.status} lang={lang} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailsScreen({ lang, centre, farmerLoc, onBack }) {
  if (!centre) return null;
  const distance = farmerLoc ? haversineKm(farmerLoc.lat, farmerLoc.lon, centre.lat, centre.lon) : null;
  return (
    <div className="pb-8">
      <TopBar title={tr("centreDetails", lang)} onBack={onBack} />
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-semibold" style={{ fontSize: 18, color: COLORS.text }}>{centre.name}</h2>
          <StatusBadge status={centre.status} lang={lang} />
        </div>
        <p className="text-xs mb-3" style={{ color: COLORS.muted }}>{centre.address}</p>

        <SchematicMap farmer={farmerLoc || { lat: centre.lat, lon: centre.lon }} centers={[centre]} highlightId={centre.id} height={180} />

        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { label: tr("activeCounters", lang), value: `${centre.activeCounters}/${centre.maxCounters}` },
            { label: tr("queueLength", lang), value: centre.queueLength },
            { label: tr("operatingHours", lang), value: centre.hours },
            { label: distance !== null ? tr("distance", lang) : tr("weatherNote", lang), value: distance !== null ? `${distance.toFixed(1)} km` : centre.weather },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <div className="text-[11px]" style={{ color: COLORS.muted }}>{m.label}</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: COLORS.text }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold mb-1.5" style={{ color: COLORS.text }}>{tr("acceptedCrops", lang)}</div>
          <div className="flex flex-wrap gap-1.5">
            {centre.crops.map((cid) => {
              const c = CROPS.find((x) => x.id === cid);
              return <span key={cid} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${c.tint}14`, color: c.tint }}>{lang === "hi" ? c.hi : c.en}</span>;
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold mb-1.5" style={{ color: COLORS.text }}>{tr("facilities", lang)}</div>
          <ul className="space-y-1">
            {centre.facilities.map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.muted }}>
                <CheckCircle2 size={13} style={{ color: COLORS.success }} />{f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: COLORS.muted }}>
          <Phone size={13} /> {centre.contact}
        </div>

        <div className="mt-5">
          <a href={directionsUrl(centre)} target="_blank" rel="noreferrer"><PrimaryButton><Navigation size={16} />{tr("getDirections", lang)}</PrimaryButton></a>
        </div>
        <div className="text-[10px] mt-2 text-center" style={{ color: COLORS.muted }}>{tr("dataUpdated", lang)}: {centre.lastUpdated}</div>
      </div>
    </div>
  );
}

/* ============================================================
   CHATBOT SCREEN — "Sahayak"
   ============================================================ */
function ChatScreen({ lang, centers, onBack, onViewDetails }) {
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: lang === "hi" ? "Namaste! Main Sahayak hoon. Aap kis fasal ke liye procurement kendra dhoondh rahe hain?" : "Hi! I'm Sahayak. Which crop are you looking to take for procurement?" },
  ]);
  const [pending, setPending] = useState({ crop: null, location: null, quantity: null });
  const [awaiting, setAwaiting] = useState("crop");
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function pushBot(text) { setMessages((m) => [...m, { id: Date.now() + Math.random(), role: "bot", text }]); }
  function pushCard(result, cropId, note) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), role: "bot", text: note, card: { result, cropId } }]);
  }

  function respond(merged, intent) {
    if (intent === "forecast") {
      if (merged.crop && merged.location) {
        const r = buildRecommendation(centers, merged.location, merged.crop, merged.quantity || 40);
        if (!r.none) {
          const c = r.top;
          pushBot(lang === "hi"
            ? `${c.name} par bheed ${c.quietHours} ke beech sabse kam rahegi (anumanit wait ~${Math.round(c.waitMin * 0.6)} min).`
            : `At ${c.name}, crowds should be lowest between ${c.quietHours} (estimated wait ~${Math.round(c.waitMin * 0.6)} min).`);
          setAwaiting(null);
          return;
        }
      }
      pushBot(lang === "hi" ? "Bheed ka sahi anumaan dene ke liye mujhe fasal aur location chahiye. Kaunsi fasal?" : "To forecast crowds, I need your crop and location first. Which crop?");
      setAwaiting("crop");
      return;
    }
    if (!merged.crop) {
      pushBot(lang === "hi" ? "Bilkul! Aap kaunsi fasal le ja rahe hain?" : "Sure! Which crop are you bringing?");
      setAwaiting("crop");
      return;
    }
    if (!merged.location) {
      pushBot(lang === "hi" ? "Theek hai. Aapka nazdeeki gaon/tehsil kaunsa hai?" : "Got it. What's your nearest town?");
      setAwaiting("location");
      return;
    }
    const qty = merged.quantity || 40;
    const result = buildRecommendation(centers, merged.location, merged.crop, qty);
    setAwaiting(null);
    if (result.none) {
      pushBot(lang === "hi" ? "Maaf kijiye, is fasal ke liye abhi koi active kendra nahi mila. Doosri fasal try karein?" : "Sorry, no active centres currently accept this crop nearby. Want to try another crop?");
      return;
    }
    const note = merged.quantity
      ? (lang === "hi" ? "Yahan hai aapke liye behtareen vikalp:" : "Here's the best option for you:")
      : (lang === "hi" ? `Yahan hai behtareen vikalp (~${qty} quintal maan kar):` : `Here's the best option (assuming ~${qty} quintals):`);
    pushCard(result, merged.crop, note);
  }

  function handleSend(text) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
    const parsed = parseMessage(text);
    const merged = { crop: parsed.crop || pending.crop, location: parsed.location || pending.location, quantity: parsed.quantity || pending.quantity };
    setPending(merged);
    setInput("");
    setTimeout(() => respond(merged, parsed.intent), 450);
  }

  return (
    <div className="flex flex-col" style={{ height: "min(640px, 82vh)" }}>
      <TopBar title={tr("sahayakTitle", lang)} onBack={onBack} />
      <div className="px-4 pt-2"><DisclosureBanner>{tr("sahayakDisclosure", lang)}</DisclosureBanner></div>
      <div className="px-4 pt-2"><ChipRow items={[lang === "hi" ? "Kahan jaana chahiye?" : "Where should I go?", lang === "hi" ? "Kal bheed kaisi rahegi?" : "How busy will it be tomorrow?"]} onPick={handleSend} /></div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={m.card ? "max-w-[88%] w-full" : "max-w-[80%]"}>
              {m.text && (
                <div
                  className="rounded-2xl px-3.5 py-2.5 text-sm"
                  style={m.role === "user"
                    ? { background: COLORS.primary, color: "#fff", borderBottomRightRadius: 4 }
                    : { background: "#F3F4F6", color: COLORS.text, borderBottomLeftRadius: 4 }}
                >
                  {m.text}
                </div>
              )}
              {m.card && (
                <div className="mt-2">
                  <RecommendationCard result={m.card.result} cropId={m.card.cropId} farmerLoc={m.card.result.top} lang={lang} compact onViewDetails={onViewDetails} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {awaiting === "crop" && <ChipRow items={CROPS.map((c) => (lang === "hi" ? c.hi : c.en))} onPick={handleSend} />}
      {awaiting === "location" && <ChipRow items={LOCATIONS.map((l) => l.label)} onPick={handleSend} />}

      <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder={tr("typeMessage", lang)}
          className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
          style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
        />
        <button className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: COLORS.bg }} title="Voice input (coming soon)">
          <Mic size={17} color={COLORS.muted} />
        </button>
        <button onClick={() => handleSend(input)} className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: COLORS.secondary }}>
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   OPERATOR PORTAL
   ============================================================ */
function OperatorLogin({ lang, onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center px-6" style={{ minHeight: 480 }}>
      <div className="mx-auto mb-4 flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: COLORS.primary }}>
        <ShieldCheck size={26} color="#fff" />
      </div>
      <h2 className="font-semibold mb-1" style={{ fontSize: 20, color: COLORS.text }}>{tr("operatorPortal", lang)}</h2>
      <p className="text-xs text-center mb-6 max-w-xs" style={{ color: COLORS.muted }}>{tr("operatorLoginNote", lang)}</p>
      <div className="w-full max-w-xs space-y-3">
        <div>
          <label className="text-xs font-medium" style={{ color: COLORS.muted }}>{tr("operatorId", lang)}</label>
          <input defaultValue="DEMO-OP-01" className="w-full mt-1 rounded-xl px-3 py-2.5 text-sm" style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: COLORS.muted }}>{tr("pin", lang)}</label>
          <div className="flex items-center rounded-xl px-3" style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
            <Lock size={14} color={COLORS.muted} />
            <input type="password" defaultValue="123456" className="w-full ml-2 py-2.5 text-sm outline-none" style={{ background: "transparent" }} />
          </div>
        </div>
        <PrimaryButton onClick={onLogin}>{tr("login", lang)}</PrimaryButton>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
      <div className="text-[11px]" style={{ color: COLORS.muted }}>{label}</div>
      <div className="font-bold mt-1" style={{ fontSize: 24, color: COLORS.primary }}>{value}</div>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  );
}

function OperatorDashboard({ lang, centers, centerId, setCenterId, updateCenter, activityLog, onPreviewImpact, onLogout }) {
  const centre = centers.find((c) => c.id === centerId);
  const trend = useMemo(() => trendFor(centre), [centre]);
  const footfall = Math.round(centre.queueLength * 4.2 + centre.activeCounters * 15);
  const sidebarItems = [
    { Icon: LayoutDashboard, label: tr("dashboard", lang), active: true },
    { Icon: MapPin, label: "Centres" },
    { Icon: Users, label: "Queue Management" },
    { Icon: BarChart3, label: "Reports" },
    { Icon: FileText, label: "Logs" },
    { Icon: User, label: "Profile" },
  ];

  return (
    <div className="flex" style={{ minHeight: 560, background: COLORS.bg }}>
      <div className="hidden sm:flex flex-col w-48 flex-shrink-0 py-4" style={{ background: COLORS.primary }}>
        <div className="px-4 mb-6 flex items-center gap-2">
          <Wheat size={20} color="#fff" /><span className="text-white font-semibold text-sm">ProcureSmart</span>
        </div>
        {sidebarItems.map((it, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${it.active ? "font-semibold" : "opacity-45"}`} style={{ color: "#fff", background: it.active ? "rgba(255,255,255,0.08)" : "transparent" }}>
            <it.Icon size={16} />{it.label}
          </div>
        ))}
        <button onClick={onLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm mt-auto opacity-80" style={{ color: "#fff" }}>
          <LogOut size={16} />{tr("logout", lang)}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5" style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs flex-shrink-0" style={{ color: COLORS.muted }}>{tr("managingCentre", lang)}:</span>
            <select value={centerId} onChange={(e) => setCenterId(e.target.value)} className="text-sm font-semibold rounded-lg px-2 py-1 min-w-0" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.text }}>
              {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="rounded-full flex items-center justify-center" style={{ width: 30, height: 30, background: COLORS.bg }}><User size={15} color={COLORS.muted} /></div>
            <button onClick={onLogout} className="sm:hidden"><LogOut size={17} color={COLORS.muted} /></button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4"><DisclosureBanner>{tr("reactivityNote", lang)}</DisclosureBanner></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <MetricCard label={tr("todaysFootfall", lang)} value={footfall} />
            <MetricCard label={tr("currentQueue", lang)} value={centre.queueLength} />
            <MetricCard label={tr("activeCounters", lang)} value={`${centre.activeCounters}/${centre.maxCounters}`} />
            <MetricCard label={tr("centreStatus", lang)} value="" sub={<StatusBadge status={centre.status} lang={lang} />} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <div className="text-xs font-semibold mb-2" style={{ color: COLORS.text }}>{tr("queueTrend", lang)}</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trend}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="q" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <div className="text-xs font-semibold mb-3" style={{ color: COLORS.text }}>{tr("quickActions", lang)}</div>

              <div className="mb-4">
                <div className="text-[11px] mb-1.5" style={{ color: COLORS.muted }}>{tr("setStatus", lang)}</div>
                <div className="flex gap-2">
                  {["Open", "Paused", "Closed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateCenter(centre.id, { status: s })}
                      className="flex-1 text-xs font-semibold rounded-lg py-2"
                      style={centre.status === s
                        ? { background: STATUS_META[s].color, color: "#fff" }
                        : { background: COLORS.bg, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}
                    >
                      {STATUS_META[s].label[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] mb-1.5" style={{ color: COLORS.muted }}>{tr("activeCounters", lang)}</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => updateCenter(centre.id, { activeCounters: Math.max(0, centre.activeCounters - 1) })} className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                    <Minus size={15} color={COLORS.primary} />
                  </button>
                  <span className="font-bold text-lg" style={{ color: COLORS.text, minWidth: 44, textAlign: "center" }}>{centre.activeCounters}/{centre.maxCounters}</span>
                  <button onClick={() => updateCenter(centre.id, { activeCounters: Math.min(centre.maxCounters, centre.activeCounters + 1) })} className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                    <Plus size={15} color={COLORS.primary} />
                  </button>
                </div>
              </div>

              <button onClick={onPreviewImpact} className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl" style={{ color: COLORS.secondary, border: `1.5px solid ${COLORS.secondary}55` }}>
                <TrendingUp size={14} />{tr("previewImpact", lang)}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl p-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <div className="text-xs font-semibold mb-2" style={{ color: COLORS.text }}>{tr("recentUpdates", lang)}</div>
            {activityLog.length === 0 ? (
              <p className="text-xs" style={{ color: COLORS.muted }}>{tr("noUpdatesYet", lang)}</p>
            ) : (
              <div className="space-y-2">
                {activityLog.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs py-1.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ color: COLORS.text }}>{a.centreName} — {a.desc}</span>
                    <span style={{ color: COLORS.muted }}>{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function ProcureSmartPrototype() {
  const [role, setRole] = useState("farmer");
  const [lang, setLang] = useState("en");
  const [centers, setCenters] = useState(INITIAL_CENTERS);
  const [activityLog, setActivityLog] = useState([]);

  const [screen, setScreen] = useState("home");
  const [query, setQuery] = useState({ crop: null, quantity: 40, locationId: null, customLoc: null });
  const [selectedCenterId, setSelectedCenterId] = useState(null);

  const [operatorAuthed, setOperatorAuthed] = useState(false);
  const [operatorCenterId, setOperatorCenterId] = useState(INITIAL_CENTERS[0].id);

  const farmerLoc = useMemo(() => query.customLoc || LOCATIONS.find((l) => l.id === query.locationId) || null, [query]);

  function updateCenter(id, patch) {
    const before = centers.find((c) => c.id === id);
    if (!before) return;
    const desc = describePatch(before, patch);
    setCenters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, lastUpdated: "Just now" } : c)));
    setActivityLog((log) => [{ id: Date.now(), time: "Just now", centreName: before.name, desc }, ...log].slice(0, 8));
  }

  function goViewDetails(id) { setSelectedCenterId(id); setScreen("details"); }

  function previewImpact() {
    setRole("farmer");
    if (query.crop && farmerLoc) setScreen("result");
    else setScreen("home");
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg, fontFamily: "'Inter','Noto Sans Devanagari',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600&display=swap');`}</style>

      {/* Demo-only chrome: real product ships Farmer & Operator as separate apps */}
      <div className="flex items-center justify-center gap-2 py-2 px-3 text-[11px]" style={{ background: "#111827" }}>
        <span className="text-gray-400 mr-1">{tr("demoControls", lang)}:</span>
        <button onClick={() => setRole("farmer")} className="px-2.5 py-1 rounded-full font-semibold" style={{ background: role === "farmer" ? COLORS.secondary : "transparent", color: role === "farmer" ? "#fff" : "#9CA3AF", border: "1px solid #374151" }}>
          {tr("farmerApp", lang)}
        </button>
        <button onClick={() => setRole("operator")} className="px-2.5 py-1 rounded-full font-semibold" style={{ background: role === "operator" ? COLORS.secondary : "transparent", color: role === "operator" ? "#fff" : "#9CA3AF", border: "1px solid #374151" }}>
          {tr("operatorDash", lang)}
        </button>
      </div>

      {role === "farmer" ? (
        <div className="max-w-md mx-auto" style={{ background: COLORS.bg }}>
          {screen === "home" && <HomeScreen lang={lang} setLang={setLang} onStart={() => setScreen("crop")} onChat={() => setScreen("chat")} />}
          {screen === "crop" && (
            <CropSelectScreen lang={lang} value={query.crop} onPick={(id) => setQuery((q) => ({ ...q, crop: id }))} onNext={() => setScreen("quantity")} onBack={() => setScreen("home")} />
          )}
          {screen === "quantity" && (
            <QuantityScreen lang={lang} value={query.quantity} onChange={(v) => setQuery((q) => ({ ...q, quantity: v }))} onNext={() => setScreen("location")} onBack={() => setScreen("crop")} />
          )}
          {screen === "location" && (
            <LocationScreen lang={lang} query={query} setQuery={setQuery} onNext={() => setScreen("loading")} onBack={() => setScreen("quantity")} />
          )}
          {screen === "loading" && (() => { setTimeout(() => setScreen((s) => (s === "loading" ? "result" : s)), 1150); return <LoadingScreen lang={lang} />; })()}
          {screen === "result" && farmerLoc && (
            <ResultScreen lang={lang} query={query} farmerLoc={farmerLoc} centers={centers} onBack={() => setScreen("home")} onTryAnother={() => setScreen("crop")} onViewDetails={goViewDetails} />
          )}
          {screen === "details" && (
            <DetailsScreen lang={lang} centre={centers.find((c) => c.id === selectedCenterId)} farmerLoc={farmerLoc} onBack={() => setScreen(query.crop && farmerLoc ? "result" : "home")} />
          )}
          {screen === "chat" && <ChatScreen lang={lang} centers={centers} onBack={() => setScreen("home")} onViewDetails={goViewDetails} />}
        </div>
      ) : (
        <div>
          {!operatorAuthed ? (
            <OperatorLogin lang={lang} onLogin={() => setOperatorAuthed(true)} />
          ) : (
            <OperatorDashboard
              lang={lang}
              centers={centers}
              centerId={operatorCenterId}
              setCenterId={setOperatorCenterId}
              updateCenter={updateCenter}
              activityLog={activityLog}
              onPreviewImpact={previewImpact}
              onLogout={() => setOperatorAuthed(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
