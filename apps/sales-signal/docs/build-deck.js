const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icons
const {
  FaMicrophone, FaBrain, FaPhoneAlt, FaUserShield,
  FaChartLine, FaRocket, FaBolt, FaHandshake,
  FaExclamationTriangle, FaCheckCircle, FaArrowRight,
  FaCog, FaMapMarkerAlt, FaUsers, FaClock, FaLaptopCode,
  FaStar, FaGlobe
} = require("react-icons/fa");

function renderIconSvg(IconComponent, color = "#FFFFFF", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// --- Color palette ---
const BG      = "0B0F17";
const BG2     = "121A26";
const BG3     = "1A2434";
const FG      = "E6EDF7";
const MUTED   = "8B99AF";
const ACCENT  = "4FD1C5";
const WARN    = "F4A261";
const BAD     = "E76F51";
const GOOD    = "4ADE80";
const BORDER  = "23314A";

// --- Helper factories (never reuse option objects) ---
const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.35 });

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Ethan Kawough";
  pres.title = "SalesSignal";

  // Pre-render icons
  const icons = {
    mic:     await iconToBase64Png(FaMicrophone, "#" + ACCENT),
    brain:   await iconToBase64Png(FaBrain, "#" + ACCENT),
    phone:   await iconToBase64Png(FaPhoneAlt, "#" + ACCENT),
    shield:  await iconToBase64Png(FaUserShield, "#" + ACCENT),
    chart:   await iconToBase64Png(FaChartLine, "#" + ACCENT),
    rocket:  await iconToBase64Png(FaRocket, "#" + ACCENT),
    bolt:    await iconToBase64Png(FaBolt, "#" + WARN),
    hand:    await iconToBase64Png(FaHandshake, "#" + ACCENT),
    warn:    await iconToBase64Png(FaExclamationTriangle, "#" + BAD),
    check:   await iconToBase64Png(FaCheckCircle, "#" + GOOD),
    arrow:   await iconToBase64Png(FaArrowRight, "#" + ACCENT),
    cog:     await iconToBase64Png(FaCog, "#" + ACCENT),
    map:     await iconToBase64Png(FaMapMarkerAlt, "#" + ACCENT),
    users:   await iconToBase64Png(FaUsers, "#" + ACCENT),
    clock:   await iconToBase64Png(FaClock, "#" + ACCENT),
    laptop:  await iconToBase64Png(FaLaptopCode, "#" + ACCENT),
    star:    await iconToBase64Png(FaStar, "#" + WARN),
    globe:   await iconToBase64Png(FaGlobe, "#" + ACCENT),
    arrowW:  await iconToBase64Png(FaArrowRight, "#" + FG),
    checkW:  await iconToBase64Png(FaCheckCircle, "#" + ACCENT),
  };

  // ========================================================================
  // SLIDE 1 — Title
  // ========================================================================
  let s1 = pres.addSlide();
  s1.background = { color: BG };
  // Large title
  s1.addText("SalesSignal", {
    x: 0.8, y: 1.2, w: 8.4, h: 1.4,
    fontSize: 54, fontFace: "Arial Black", color: ACCENT,
    bold: true, margin: 0,
  });
  // Tagline
  s1.addText("The AI sales assistant for door-to-door reps.", {
    x: 0.8, y: 2.6, w: 8.4, h: 0.7,
    fontSize: 22, fontFace: "Calibri", color: FG, margin: 0,
  });
  // Accent line
  s1.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 2.4, w: 2.0, h: 0.06, fill: { color: ACCENT },
  });
  // Meta
  s1.addText("Ethan Kawough  |  AMD x lablab.ai Hackathon  |  May 2026", {
    x: 0.8, y: 4.6, w: 8.4, h: 0.5,
    fontSize: 13, fontFace: "Calibri", color: MUTED, margin: 0,
  });
  s1.addImage({ data: icons.mic, x: 8.5, y: 1.4, w: 1.0, h: 1.0 });

  // ========================================================================
  // SLIDE 2 — The Problem
  // ========================================================================
  let s2 = pres.addSlide();
  s2.background = { color: BG };
  s2.addText("2.3M field reps, zero AI", {
    x: 0.8, y: 0.4, w: 8.4, h: 0.9,
    fontSize: 36, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  // Three stat cards
  const statData = [
    { num: "60+", label: "conversations per\nrep per day", icon: icons.users },
    { num: "0%", label: "AI-assisted at\nthe doorstep", icon: icons.brain },
    { num: "$0", label: "spent on field\nrep intelligence", icon: icons.chart },
  ];
  statData.forEach((st, i) => {
    const cx = 0.8 + i * 3.0;
    s2.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 1.6, w: 2.7, h: 2.2,
      fill: { color: BG2 }, shadow: mkShadow(),
      line: { color: BORDER, width: 1 },
    });
    s2.addImage({ data: st.icon, x: cx + 0.3, y: 1.85, w: 0.45, h: 0.45 });
    s2.addText(st.num, {
      x: cx + 0.9, y: 1.75, w: 1.5, h: 0.65,
      fontSize: 32, fontFace: "Arial Black", color: ACCENT, bold: true, margin: 0,
    });
    s2.addText(st.label, {
      x: cx + 0.3, y: 2.6, w: 2.2, h: 0.9,
      fontSize: 13, fontFace: "Calibri", color: MUTED, margin: 0,
    });
  });

  s2.addText([
    { text: "Best lead of the day lives in a voice memo and dies there.\n", options: { color: FG, fontSize: 15 } },
    { text: "Managers review nothing. Reps forget names, bills, objections.", options: { color: MUTED, fontSize: 13 } },
  ], { x: 0.8, y: 4.2, w: 8.4, h: 0.9, fontFace: "Calibri", margin: 0 });

  // ========================================================================
  // SLIDE 3 — Competitors
  // ========================================================================
  let s3 = pres.addSlide();
  s3.background = { color: BG };
  s3.addText("Text-only analytics can't hear\na homeowner cool off", {
    x: 0.8, y: 0.4, w: 8.4, h: 1.1,
    fontSize: 32, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  // Competitor comparison table
  const compRows = [
    [
      { text: "", options: { fill: { color: BG3 }, color: MUTED, bold: true, fontSize: 11 } },
      { text: "Siro", options: { fill: { color: BG3 }, color: MUTED, bold: true, fontSize: 11 } },
      { text: "Rilla", options: { fill: { color: BG3 }, color: MUTED, bold: true, fontSize: 11 } },
      { text: "SalesSignal", options: { fill: { color: BG3 }, color: ACCENT, bold: true, fontSize: 11 } },
    ],
    ["Acoustic emotion", { text: "No", options: { color: BAD } }, { text: "No", options: { color: BAD } }, { text: "Yes", options: { color: GOOD } }],
    ["CRM auto-write", { text: "No", options: { color: BAD } }, { text: "No", options: { color: BAD } }, { text: "Yes", options: { color: GOOD } }],
    ["CRM-agnostic", { text: "No", options: { color: BAD } }, { text: "ServiceTitan only", options: { color: BAD } }, { text: "GHL + HubSpot", options: { color: GOOD } }],
    ["Consent compliance", { text: "No", options: { color: BAD } }, { text: "No", options: { color: BAD } }, { text: "Geo-aware", options: { color: GOOD } }],
    ["Cost", { text: "$3K/user/yr", options: { color: WARN } }, { text: "$4-5K/user/yr", options: { color: WARN } }, { text: "$0.24/conv", options: { color: GOOD } }],
  ];
  s3.addTable(compRows, {
    x: 0.8, y: 1.8, w: 8.4,
    border: { pt: 0.5, color: BORDER },
    colW: [2.2, 1.9, 2.2, 2.1],
    fontSize: 12, fontFace: "Calibri", color: FG,
    fill: { color: BG2 },
    rowH: [0.35, 0.35, 0.35, 0.35, 0.35, 0.35],
  });

  s3.addText("Siro raised $75M without any of the last four rows.", {
    x: 0.8, y: 4.5, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: WARN, italic: true, margin: 0,
  });

  // ========================================================================
  // SLIDE 4 — What We Built (Pipeline)
  // ========================================================================
  let s4 = pres.addSlide();
  s4.background = { color: BG };
  s4.addText("Wearable  →  5 models  →  CRM, in under 5 seconds", {
    x: 0.8, y: 0.4, w: 8.4, h: 0.8,
    fontSize: 30, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  // Pipeline flow boxes
  const pipeline = [
    { label: "Omi\nDevKit 2", sub: "BLE audio", icon: icons.mic, color: BG3 },
    { label: "Deepgram\nNova-2", sub: "Diarize + sentiment", icon: icons.brain, color: BG3 },
    { label: "SenseVoice\nEmotion", sub: "7 acoustic classes", icon: icons.bolt, color: BG3 },
    { label: "CrewAI\n3 Agents", sub: "Parse → Score → Write", icon: icons.cog, color: BG3 },
    { label: "GHL +\nHubSpot", sub: "Contact + note + deal", icon: icons.check, color: BG3 },
  ];
  pipeline.forEach((p, i) => {
    const bx = 0.3 + i * 1.95;
    s4.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: 1.6, w: 1.7, h: 2.4,
      fill: { color: p.color }, shadow: mkShadow(),
      line: { color: BORDER, width: 1 },
    });
    s4.addImage({ data: p.icon, x: bx + 0.6, y: 1.8, w: 0.5, h: 0.5 });
    s4.addText(p.label, {
      x: bx + 0.1, y: 2.4, w: 1.5, h: 0.7,
      fontSize: 13, fontFace: "Arial Black", color: FG, align: "center", margin: 0,
    });
    s4.addText(p.sub, {
      x: bx + 0.1, y: 3.15, w: 1.5, h: 0.5,
      fontSize: 10, fontFace: "Calibri", color: MUTED, align: "center", margin: 0,
    });
    if (i < pipeline.length - 1) {
      s4.addImage({ data: icons.arrowW, x: bx + 1.75, y: 2.55, w: 0.2, h: 0.2 });
    }
  });

  s4.addText("All running on AMD MI300X via vLLM 0.19.0 (ROCm)", {
    x: 0.8, y: 4.4, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: ACCENT, margin: 0,
  });

  // ========================================================================
  // SLIDE 5 — Sentiment Fusion Breakthrough
  // ========================================================================
  let s5 = pres.addSlide();
  s5.background = { color: BG };
  s5.addText([
    { text: 'Text says ', options: { color: FG } },
    { text: '"sounds good."', options: { color: GOOD, bold: true } },
    { text: '  Voice says ', options: { color: FG } },
    { text: 'angry.', options: { color: BAD, bold: true } },
    { text: '\nThat\'s a dead lead.', options: { color: WARN, breakLine: true } },
  ], {
    x: 0.8, y: 0.4, w: 8.4, h: 1.2,
    fontSize: 30, fontFace: "Arial Black", margin: 0,
  });

  // Example card
  s5.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.9, w: 8.4, h: 2.0,
    fill: { color: BG2 }, shadow: mkShadow(),
    line: { color: BORDER, width: 1 },
  });
  s5.addText('"Sounds great, I\'ll think about it."', {
    x: 1.2, y: 2.0, w: 7.6, h: 0.5,
    fontSize: 18, fontFace: "Calibri", color: FG, italic: true, margin: 0,
  });

  const fusionItems = [
    { label: "TEXT SENTIMENT", value: "+0.4 (positive)", color: GOOD },
    { label: "ACOUSTIC EMOTION", value: "angry (0.83 conf)", color: BAD },
    { label: "FUSED LABEL", value: "SUPPRESSED OBJECTION", color: WARN },
  ];
  fusionItems.forEach((fi, i) => {
    const fy = 2.65 + i * 0.38;
    s5.addText(fi.label, {
      x: 1.2, y: fy, w: 2.5, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: MUTED, margin: 0, bold: true,
    });
    s5.addText(fi.value, {
      x: 3.8, y: fy, w: 5.0, h: 0.35,
      fontSize: 14, fontFace: "Calibri", color: fi.color, margin: 0, bold: true,
    });
  });

  s5.addText("Text-only systems (Siro, Rilla, Gong) see this as positive. We catch it.", {
    x: 0.8, y: 4.3, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: MUTED, margin: 0,
  });

  // ========================================================================
  // SLIDE 6 — Multi-Agent Architecture
  // ========================================================================
  let s6 = pres.addSlide();
  s6.background = { color: BG };
  s6.addText("Three specialists beat one generalist", {
    x: 0.8, y: 0.4, w: 8.4, h: 0.8,
    fontSize: 34, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  const agents = [
    { name: "Parser Agent", desc: "Extracts name, phone, email,\naddress, objections, timeline", time: "~700ms", icon: icons.cog },
    { name: "Scorer + Analyst", desc: "Lead score 1-10 with rationale\n+ conversation dynamics", time: "~800ms", icon: icons.chart },
    { name: "CRM Writer", desc: "Composes AI note, pushes to\nGHL and HubSpot in parallel", time: "~700ms", icon: icons.check },
  ];
  agents.forEach((a, i) => {
    const ax = 0.5 + i * 3.1;
    s6.addShape(pres.shapes.RECTANGLE, {
      x: ax, y: 1.5, w: 2.85, h: 2.6,
      fill: { color: BG2 }, shadow: mkShadow(),
      line: { color: BORDER, width: 1 },
    });
    s6.addImage({ data: a.icon, x: ax + 0.3, y: 1.7, w: 0.4, h: 0.4 });
    s6.addText(a.name, {
      x: ax + 0.8, y: 1.7, w: 1.8, h: 0.45,
      fontSize: 16, fontFace: "Arial Black", color: ACCENT, margin: 0,
    });
    s6.addText(a.desc, {
      x: ax + 0.3, y: 2.3, w: 2.3, h: 0.9,
      fontSize: 12, fontFace: "Calibri", color: FG, margin: 0,
    });
    s6.addText(a.time, {
      x: ax + 0.3, y: 3.45, w: 2.3, h: 0.4,
      fontSize: 12, fontFace: "Calibri", color: MUTED, margin: 0,
    });
    if (i < agents.length - 1) {
      s6.addImage({ data: icons.arrowW, x: ax + 2.95, y: 2.55, w: 0.2, h: 0.2 });
    }
  });

  s6.addText("All three: Llama 3.1 8B Instruct on AMD MI300X, different system prompts.", {
    x: 0.8, y: 4.5, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: ACCENT, margin: 0,
  });

  // ========================================================================
  // SLIDE 7 — AMD MI300X
  // ========================================================================
  let s7 = pres.addSlide();
  s7.background = { color: BG };
  s7.addText("Built on the biggest GPU\nmemory on the market", {
    x: 0.8, y: 0.3, w: 8.4, h: 1.1,
    fontSize: 34, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  // Left column: specs
  const specs = [
    { label: "Image", value: "vllm/vllm-openai-rocm:v0.19.0" },
    { label: "Model", value: "Llama 3.1 8B Instruct" },
    { label: "Precision", value: "bfloat16" },
    { label: "Context", value: "8K tokens" },
    { label: "Throughput", value: "80-100 tok/s" },
  ];
  specs.forEach((sp, i) => {
    const sy = 1.7 + i * 0.45;
    s7.addText(sp.label, {
      x: 0.8, y: sy, w: 1.5, h: 0.35,
      fontSize: 12, fontFace: "Calibri", color: MUTED, bold: true, margin: 0,
    });
    s7.addText(sp.value, {
      x: 2.4, y: sy, w: 3.0, h: 0.35,
      fontSize: 13, fontFace: "Calibri", color: FG, margin: 0,
    });
  });

  // Right column: latency chart as bar chart
  s7.addChart(pres.charts.BAR, [{
    name: "Latency",
    labels: ["Parser", "Scorer", "Writer", "CRM Push"],
    values: [700, 800, 700, 700],
  }], {
    x: 5.5, y: 1.5, w: 4.0, h: 3.0, barDir: "bar",
    chartColors: [ACCENT],
    chartArea: { fill: { color: BG2 }, roundedCorners: true },
    catAxisLabelColor: MUTED,
    valAxisLabelColor: MUTED,
    valGridLine: { color: BORDER, size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: FG,
    dataLabelPosition: "outEnd",
    showLegend: false,
    showTitle: true,
    title: "Latency (ms)",
    titleColor: MUTED,
    titleFontSize: 10,
  });

  // Gotcha callout
  s7.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 4.1, w: 4.2, h: 0.9,
    fill: { color: BG3 },
    line: { color: WARN, width: 1 },
  });
  s7.addText([
    { text: "Gotcha solved: ", options: { bold: true, color: WARN, fontSize: 11 } },
    { text: "VLLM_ROCM_USE_AITER_FP4BMM=0 is mandatory.\nMXFP4 bmm is broken on MI300X — segfault without it.", options: { color: MUTED, fontSize: 11 } },
  ], { x: 1.0, y: 4.15, w: 3.8, h: 0.8, fontFace: "Calibri", margin: 0 });

  // ========================================================================
  // SLIDE 8 — CRM-Agnostic
  // ========================================================================
  let s8 = pres.addSlide();
  s8.background = { color: BG };
  s8.addText("Same contact, both CRMs,\none conversation", {
    x: 0.8, y: 0.3, w: 8.4, h: 1.0,
    fontSize: 34, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  // Two CRM cards side by side
  const crms = [
    { name: "GoHighLevel", features: ["Contact upserted", "AI note attached", "Opportunity created", "Pipeline stage set"] },
    { name: "HubSpot", features: ["Contact upserted", "AI note attached", "Deal created", "Association linked"] },
  ];
  crms.forEach((crm, i) => {
    const cx = 0.8 + i * 4.4;
    s8.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 1.6, w: 4.0, h: 2.5,
      fill: { color: BG2 }, shadow: mkShadow(),
      line: { color: BORDER, width: 1 },
    });
    s8.addImage({ data: icons.checkW, x: cx + 0.3, y: 1.8, w: 0.35, h: 0.35 });
    s8.addText(crm.name, {
      x: cx + 0.75, y: 1.78, w: 2.8, h: 0.4,
      fontSize: 18, fontFace: "Arial Black", color: ACCENT, margin: 0,
    });
    s8.addText(crm.features.map(f => f).join("\n"), {
      x: cx + 0.3, y: 2.4, w: 3.4, h: 1.4,
      fontSize: 13, fontFace: "Calibri", color: FG, margin: 0,
      bullet: false,
    });
  });

  s8.addText([
    { text: "No migration. No routing tax. ", options: { bold: true, color: FG } },
    { text: "Rilla locks you into ServiceTitan with a 5-seat minimum.", options: { color: MUTED } },
  ], {
    x: 0.8, y: 4.5, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", margin: 0,
  });

  // ========================================================================
  // SLIDE 9 — Built-in Compliance
  // ========================================================================
  let s9 = pres.addSlide();
  s9.background = { color: BG };
  s9.addText("Geo-aware consent, audit trail,\nBIPA-aware", {
    x: 0.8, y: 0.3, w: 8.4, h: 1.0,
    fontSize: 32, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  // Three consent tiers
  const tiers = [
    { label: "ONE-PARTY", sub: "38 states", desc: "Rep self-consents.\nDisclosure still shown.", color: GOOD, icon: icons.check },
    { label: "TWO-PARTY", sub: "12 states + DC", desc: "Both parties must agree.\nVerbal + button confirm.", color: WARN, icon: icons.shield },
    { label: "BIPA (Illinois)", sub: "Biometric data", desc: "Electronic consent form.\n$1K-$5K per violation.", color: BAD, icon: icons.warn },
  ];
  tiers.forEach((t, i) => {
    const tx = 0.5 + i * 3.15;
    s9.addShape(pres.shapes.RECTANGLE, {
      x: tx, y: 1.55, w: 2.9, h: 2.5,
      fill: { color: BG2 }, shadow: mkShadow(),
      line: { color: BORDER, width: 1 },
    });
    s9.addImage({ data: t.icon, x: tx + 0.3, y: 1.75, w: 0.35, h: 0.35 });
    s9.addText(t.label, {
      x: tx + 0.75, y: 1.72, w: 1.8, h: 0.35,
      fontSize: 14, fontFace: "Arial Black", color: t.color, margin: 0,
    });
    s9.addText(t.sub, {
      x: tx + 0.75, y: 2.05, w: 1.8, h: 0.3,
      fontSize: 11, fontFace: "Calibri", color: MUTED, margin: 0,
    });
    s9.addText(t.desc, {
      x: tx + 0.3, y: 2.55, w: 2.3, h: 0.9,
      fontSize: 12, fontFace: "Calibri", color: FG, margin: 0,
    });
  });

  s9.addText("Siro and Rilla make consent your problem. We ship the solution.", {
    x: 0.8, y: 4.4, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: ACCENT, italic: true, margin: 0,
  });

  // ========================================================================
  // SLIDE 10 — Live Demo
  // ========================================================================
  let s10 = pres.addSlide();
  s10.background = { color: BG };
  s10.addText("Live Demo", {
    x: 0.8, y: 1.8, w: 8.4, h: 1.2,
    fontSize: 54, fontFace: "Arial Black", color: ACCENT, bold: true,
    align: "center", margin: 0,
  });
  s10.addText("Switch to the admin panel", {
    x: 0.8, y: 3.0, w: 8.4, h: 0.6,
    fontSize: 20, fontFace: "Calibri", color: MUTED, align: "center", margin: 0,
  });
  s10.addImage({ data: icons.laptop, x: 4.5, y: 3.8, w: 1.0, h: 1.0 });

  // ========================================================================
  // SLIDE 11 — Roadmap (Layer 3 Coaching)
  // ========================================================================
  let s11 = pres.addSlide();
  s11.background = { color: BG };
  s11.addText("50 conversations in, we coach\nyour rep personally", {
    x: 0.8, y: 0.3, w: 8.4, h: 1.0,
    fontSize: 32, fontFace: "Arial Black", color: FG, bold: true, margin: 0,
  });

  // Roadmap card
  s11.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.6, w: 8.4, h: 2.6,
    fill: { color: BG2 }, shadow: mkShadow(),
    line: { color: BORDER, width: 1 },
  });

  s11.addText("LAYER 3 — AI COACHING (ROADMAP)", {
    x: 1.2, y: 1.8, w: 7.6, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: WARN, bold: true, margin: 0,
  });

  const coaching = [
    { text: "Aggregate openSMILE prosodic features across 50+ sessions per rep" },
    { text: "Identify patterns: energy drops, pacing issues, filler words" },
    { text: 'Generate personalized coaching: "Your vocal energy drops after 90s — practice pacing"' },
    { text: "We already capture these features. This is the data path, not a promise." },
  ];
  s11.addText(
    coaching.map((c, i) => ({
      text: c.text,
      options: { bullet: true, breakLine: i < coaching.length - 1, color: i === 3 ? ACCENT : FG, fontSize: 14, italic: i === 3 },
    })),
    { x: 1.2, y: 2.3, w: 7.6, h: 1.6, fontFace: "Calibri", margin: 0 }
  );

  s11.addImage({ data: icons.star, x: 8.5, y: 1.8, w: 0.4, h: 0.4 });

  // ========================================================================
  // SLIDE 12 — Ask / Close
  // ========================================================================
  let s12 = pres.addSlide();
  s12.background = { color: BG };
  s12.addText("SalesSignal", {
    x: 0.8, y: 0.8, w: 8.4, h: 1.2,
    fontSize: 50, fontFace: "Arial Black", color: ACCENT, bold: true, margin: 0,
  });
  s12.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.9, w: 2.0, h: 0.06, fill: { color: ACCENT },
  });

  // Key value props
  const props = [
    { text: "$0.24 per conversation", icon: icons.bolt },
    { text: "CRM-agnostic (GHL + HubSpot)", icon: icons.globe },
    { text: "Compliance built in", icon: icons.shield },
    { text: "Ready for pilots", icon: icons.rocket },
  ];
  props.forEach((p, i) => {
    const py = 2.3 + i * 0.55;
    s12.addImage({ data: p.icon, x: 1.0, y: py + 0.02, w: 0.35, h: 0.35 });
    s12.addText(p.text, {
      x: 1.55, y: py, w: 5.0, h: 0.4,
      fontSize: 18, fontFace: "Calibri", color: FG, margin: 0,
    });
  });

  s12.addText("Ethan Kawough  |  github.com/ekawough/salesSignal", {
    x: 0.8, y: 4.6, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: MUTED, margin: 0,
  });

  // ========================================================================
  // Save
  // ========================================================================
  await pres.writeFile({ fileName: "C:/Users/Ethan/New folder/salesSignal/docs/SalesSignal-Deck.pptx" });
  console.log("Deck saved to SalesSignal-Deck.pptx");
}

main().catch(e => { console.error(e); process.exit(1); });
