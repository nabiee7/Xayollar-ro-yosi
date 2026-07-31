import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft, Save, FilePlus2, UploadCloud, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Pencil, Eraser, Paintbrush, Feather, Ruler, PaintBucket, Shapes, Type, Wand2, MousePointer2,
  Plus, Eye, EyeOff, Lock, MoreVertical, Trash2, Square, Circle, Triangle, Star, Heart,
  MessageCircle, PenTool, Highlighter, SprayCan, Sparkles, X, Pipette,
} from "lucide-react";

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@700&family=Nunito:wght@400;600;700&display=swap";

// ─── CANVAS CONSTANTS ────────────────────────────────────────────────────────
const CANVAS_W = 1000;
const CANVAS_H = 700;

// ─── TYPES ───────────────────────────────────────────────────────────────────
type ToolId = "pen" | "eraser" | "brush" | "marker" | "line" | "fill" | "shapes" | "text" | "magic" | "select";
type BrushPreset = "standard" | "fine" | "brush" | "calligraphy" | "marker" | "spray";
type ShapeId = "square" | "circle" | "triangle" | "star" | "heart" | "bubble";

interface LayerState {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
}

function colorsClose(a: number[], b: number[], tolerance = 32) {
  return Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance && Math.abs(a[3] - b[3]) <= tolerance;
}

function floodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillHex: string) {
  const { width, height } = ctx.canvas;
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;
  const x = Math.floor(startX), y = Math.floor(startY);
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const startPos = (y * width + x) * 4;
  const startColor = [data[startPos], data[startPos + 1], data[startPos + 2], data[startPos + 3]];
  const fill = hexToRgba(fillHex);
  if (colorsClose(startColor, fill, 8)) return;
  const stack: [number, number][] = [[x, y]];
  let guard = 0;
  const maxIter = width * height * 1.2;
  while (stack.length && guard < maxIter) {
    guard++;
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
    const pos = (cy * width + cx) * 4;
    if (!colorsClose([data[pos], data[pos + 1], data[pos + 2], data[pos + 3]], startColor)) continue;
    data[pos] = fill[0]; data[pos + 1] = fill[1]; data[pos + 2] = fill[2]; data[pos + 3] = fill[3];
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  ctx.putImageData(img, 0, 0);
}

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const TOOLS: { id: ToolId; label: string; icon: any }[] = [
  { id: "pen", label: "Qalam", icon: Pencil },
  { id: "eraser", label: "O'chirg'ich", icon: Eraser },
  { id: "brush", label: "Bo'yoq cho'tka", icon: Paintbrush },
  { id: "marker", label: "Mo'yqalam", icon: Feather },
  { id: "line", label: "Qalinlik", icon: Ruler },
  { id: "fill", label: "To'ldirish", icon: PaintBucket },
  { id: "shapes", label: "Shakllar", icon: Shapes },
  { id: "text", label: "Matn", icon: Type },
  { id: "magic", label: "Sehrli asbob", icon: Wand2 },
  { id: "select", label: "Tanlash", icon: MousePointer2 },
];

const BRUSH_PRESETS: { id: BrushPreset; icon: any }[] = [
  { id: "standard", icon: Pencil },
  { id: "fine", icon: PenTool },
  { id: "brush", icon: Paintbrush },
  { id: "calligraphy", icon: Feather },
  { id: "marker", icon: Highlighter },
  { id: "spray", icon: SprayCan },
];

const SHAPES_LIST: { id: ShapeId; icon: any }[] = [
  { id: "square", icon: Square },
  { id: "circle", icon: Circle },
  { id: "triangle", icon: Triangle },
  { id: "star", icon: Star },
  { id: "heart", icon: Heart },
  { id: "bubble", icon: MessageCircle },
];

const PALETTE: string[][] = [
  ["#0B0812", "#3F3B52", "#8B85A3", "#FFFFFF"],
  ["#EF4444", "#F59E0B", "#FACC15", "#22C55E"],
  ["#10B981", "#14B8A6", "#38BDF8", "#3B82F6"],
  ["#6366F1", "#A855F7", "#EC4899", "#F3D89C"],
];

interface ElementItem { id: string; title: string; category: "Qahramonlar" | "Fonlar" | "Buyumlar"; emoji: string; img: string; }

const ELEMENTS: ElementItem[] = [
  { id: "el-1", title: "Sehrgar qiz", category: "Qahramonlar", emoji: "🧙‍♀️", img: "/elements/sehrgar-qiz.png" },
  { id: "el-2", title: "O'g'il bola", category: "Qahramonlar", emoji: "🧒", img: "/elements/ogil-bola.png" },
  { id: "el-3", title: "Sehrgar chol", category: "Qahramonlar", emoji: "🧙", img: "/elements/sehrgar-chol.png" },
  { id: "el-4", title: "Ajdaho", category: "Qahramonlar", emoji: "🐉", img: "/elements/ajdaho.png" },
  { id: "el-5", title: "Peri", category: "Qahramonlar", emoji: "🧚", img: "/elements/peri.png" },
  { id: "el-6", title: "Tulki", category: "Qahramonlar", emoji: "🦊", img: "/elements/tulki.png" },
  { id: "el-7", title: "Sehrli qal'a", category: "Fonlar", emoji: "🏰", img: "/elements/qala.png" },
  { id: "el-8", title: "Sehrli daraxt", category: "Fonlar", emoji: "🌳", img: "/elements/daraxt.png" },
  { id: "el-9", title: "Sehrli tayoq", category: "Buyumlar", emoji: "✨", img: "/elements/tayoq.png" },
  { id: "el-10", title: "Fonar", category: "Buyumlar", emoji: "🏮", img: "/elements/fonar.png" },
  { id: "el-11", title: "Iksir shishasi", category: "Buyumlar", emoji: "🧪", img: "/elements/iksir.png" },
  { id: "el-12", title: "Sandiq", category: "Buyumlar", emoji: "🗝️", img: "/elements/sandiq.png" },
];

// ─── SMALL PRESENTATIONAL PIECES ─────────────────────────────────────────────
function ElementThumb({ item, onPick }: { item: ElementItem; onPick: (item: ElementItem) => void }) {
  const [failed, setFailed] = useState(false);
  const hasImg = !failed;
  return (
    <button className="element-card" onClick={() => onPick(item)} title={item.title}>
      {hasImg ? (
        // Replace src with the real illustration asset when available
        <img src={item.img} alt={item.title} onError={() => setFailed(true)} />
      ) : (
        <span className="element-emoji">{item.emoji}</span>
      )}
    </button>
  );
}

// ─── AMBIENT BACKGROUND — sehrli chizuv-studiyasi atmosferasi ───────────────
// Faqat vizual dekor: aylanuvchi sehr doirasi, suzuvchi bo'yoq-chang zarralari,
// milt-milt yulduzlar va katta nurli tumanlar. Hech qanday state/logikaga
// ta'sir qilmaydi, pointer-events yo'q.
function DrawAmbientBackground() {
  const dustColors = ["#A855F7", "#F3D89C", "#38BDF8", "#EC4899", "#22C55E"];
  const dust = Array.from({ length: 20 }, (_, i) => i);
  const motes = Array.from({ length: 22 }, (_, i) => i);

  return (
    <div className="draw-ambient" aria-hidden="true">
      <div className="draw-orb draw-orb-a" />
      <div className="draw-orb draw-orb-b" />
      <div className="draw-orb draw-orb-c" />
      <div className="draw-orb draw-orb-d" />

      <svg className="draw-magic-circle" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(168,85,247,0.22)" strokeWidth="1" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(243,216,156,0.18)" strokeWidth="1" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="118" fill="none" stroke="rgba(168,85,247,0.16)" strokeWidth="1" />
        <g stroke="rgba(196,181,253,0.22)" strokeWidth="1">
          <line x1="200" y1="20" x2="200" y2="380" />
          <line x1="20" y1="200" x2="380" y2="200" />
          <line x1="60" y1="60" x2="340" y2="340" />
          <line x1="340" y1="60" x2="60" y2="340" />
        </g>
        <circle cx="200" cy="20" r="4" fill="rgba(243,216,156,0.5)" />
        <circle cx="200" cy="380" r="4" fill="rgba(243,216,156,0.5)" />
        <circle cx="20" cy="200" r="4" fill="rgba(243,216,156,0.5)" />
        <circle cx="380" cy="200" r="4" fill="rgba(243,216,156,0.5)" />
      </svg>
      <svg className="draw-magic-circle draw-magic-circle-rev" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="95" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="2 8" />
      </svg>

      {motes.map((i) => (
        <span
          key={`mote-${i}`}
          className="draw-mote"
          style={{
            top: `${(i * 43) % 100}%`,
            left: `${(i * 29) % 100}%`,
            animationDelay: `${(i % 12) * 0.5}s`,
            animationDuration: `${3.5 + (i % 6)}s`,
          }}
        />
      ))}

      {dust.map((i) => (
        <span
          key={`dust-${i}`}
          className="draw-dust"
          style={{
            top: `${(i * 17) % 100}%`,
            background: dustColors[i % dustColors.length],
            boxShadow: `0 0 10px 2px ${dustColors[i % dustColors.length]}88`,
            animationDelay: `${(i % 10) * 1.6}s`,
            animationDuration: `${16 + (i % 8) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function DrawingPage() {
  const navigate = useNavigate();

  // Tool / style state
  const [tool, setTool] = useState<ToolId>("pen");
  const [brushPreset, setBrushPreset] = useState<BrushPreset>("standard");
  const [selectedShape, setSelectedShape] = useState<ShapeId>("circle");
  const [color, setColor] = useState("#A855F7");
  const [customColors, setCustomColors] = useState<string[]>(["#7C3AED", "#F3D89C", "#38BDF8"]);
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [zoom, setZoom] = useState(100);

  // Layers
  const [layers, setLayers] = useState<LayerState[]>([
    { id: "l3", name: "Qatlam 3", visible: true, locked: false },
    { id: "l2", name: "Qatlam 2", visible: true, locked: false },
    { id: "l1", name: "Qatlam 1", visible: true, locked: false },
    { id: "fon", name: "Fon", visible: true, locked: true },
  ]);
  const [activeLayerId, setActiveLayerId] = useState("l3");
  const [layerMenuId, setLayerMenuId] = useState<string | null>(null);
  const layerCounter = useRef(4);

  // Canvas refs — one canvas element per layer id
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const undoStacks = useRef<Record<string, string[]>>({});
  const redoStacks = useRef<Record<string, string[]>>({});
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokeStartSnapshot = useRef<string | null>(null);

  // Mobile UI
  const [mobileSheet, setMobileSheet] = useState<null | "tools" | "layers" | "colors" | "elements">(null);
  const [rightTab, setRightTab] = useState<"colors" | "elements">("colors");
  const [elementCategory, setElementCategory] = useState<"Barchasi" | "Qahramonlar" | "Fonlar" | "Buyumlar">("Barchasi");
  const [toast, setToast] = useState<string | null>(null);

  const colorInputRef = useRef<HTMLInputElement>(null);
  const textEditor = useRef<{ x: number; y: number } | null>(null);
  const [textDraft, setTextDraft] = useState<{ x: number; y: number; value: string } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  // ── init: white background on Fon layer ──
  useEffect(() => {
    const fonCanvas = canvasRefs.current["fon"];
    if (fonCanvas) {
      const ctx = fonCanvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCtx = (layerId: string) => canvasRefs.current[layerId]?.getContext("2d") || null;

  const pushUndo = (layerId: string) => {
    const canvas = canvasRefs.current[layerId];
    if (!canvas) return;
    const stack = undoStacks.current[layerId] || [];
    stack.push(canvas.toDataURL());
    if (stack.length > 25) stack.shift();
    undoStacks.current[layerId] = stack;
    redoStacks.current[layerId] = [];
  };

  const restoreFromDataUrl = (layerId: string, dataUrl: string) => {
    const canvas = canvasRefs.current[layerId];
    const ctx = getCtx(layerId);
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  const handleUndo = () => {
    const stack = undoStacks.current[activeLayerId] || [];
    if (!stack.length) return;
    const canvas = canvasRefs.current[activeLayerId];
    if (canvas) {
      const redo = redoStacks.current[activeLayerId] || [];
      redo.push(canvas.toDataURL());
      redoStacks.current[activeLayerId] = redo;
    }
    const prev = stack.pop()!;
    undoStacks.current[activeLayerId] = stack;
    restoreFromDataUrl(activeLayerId, prev);
  };

  const handleRedo = () => {
    const stack = redoStacks.current[activeLayerId] || [];
    if (!stack.length) return;
    const canvas = canvasRefs.current[activeLayerId];
    if (canvas) {
      const undo = undoStacks.current[activeLayerId] || [];
      undo.push(canvas.toDataURL());
      undoStacks.current[activeLayerId] = undo;
    }
    const next = stack.pop()!;
    redoStacks.current[activeLayerId] = stack;
    restoreFromDataUrl(activeLayerId, next);
  };

  // ── coordinate mapping ──
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    return { x, y };
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const isDrawTool = tool === "pen" || tool === "brush" || tool === "marker" || tool === "line";

  const applyStrokeStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.globalAlpha = opacity / 100;
    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    switch (brushPreset) {
      case "fine":
        ctx.lineWidth = Math.max(1, brushSize * 0.5);
        ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash([]);
        break;
      case "brush":
        ctx.lineWidth = brushSize * 1.6;
        ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash([]);
        ctx.globalAlpha = (opacity / 100) * 0.85;
        break;
      case "calligraphy":
        ctx.lineWidth = brushSize * 1.1;
        ctx.lineCap = "square"; ctx.lineJoin = "round"; ctx.setLineDash([]);
        break;
      case "marker":
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = "square"; ctx.lineJoin = "round"; ctx.setLineDash([]);
        ctx.globalAlpha = (opacity / 100) * 0.45;
        break;
      case "spray":
        ctx.lineWidth = brushSize; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash([]);
        break;
      default:
        ctx.lineWidth = brushSize; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash([]);
    }
    if (tool === "eraser") { ctx.lineWidth = brushSize * 1.4; }
  };

  const sprayDab = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const density = 10;
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * brushSize * 1.5;
      const dx = x + Math.cos(angle) * radius;
      const dy = y + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(dx, dy, Math.random() * 1.4 + 0.3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = (opacity / 100) * 0.5;
      ctx.fill();
    }
  };

  const drawShapeAt = (ctx: CanvasRenderingContext2D, x: number, y: number, shape: ShapeId, size: number) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.lineWidth = 3;
    switch (shape) {
      case "square":
        ctx.strokeRect(x - size, y - size, size * 2, size * 2);
        break;
      case "circle":
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.stroke();
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(x, y - size); ctx.lineTo(x - size, y + size); ctx.lineTo(x + size, y + size);
        ctx.closePath(); ctx.stroke();
        break;
      case "star": {
        const spikes = 5, outerR = size, innerR = size / 2.4;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const a = (Math.PI / spikes) * i - Math.PI / 2;
          const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
        break;
      }
      case "heart": {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        ctx.bezierCurveTo(x, y, x - size, y, x - size, y + topCurveHeight);
        ctx.bezierCurveTo(x - size, y + (size + topCurveHeight) / 1.4, x, y + (size + topCurveHeight) / 1.1, x, y + size * 1.4);
        ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.1, x + size, y + (size + topCurveHeight) / 1.4, x + size, y + topCurveHeight);
        ctx.bezierCurveTo(x + size, y, x, y, x, y + topCurveHeight);
        ctx.stroke();
        break;
      }
      case "bubble":
        ctx.beginPath();
        ctx.ellipse(x, y, size * 1.2, size * 0.85, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - size * 0.2, y + size * 0.7);
        ctx.lineTo(x - size * 0.5, y + size * 1.3);
        ctx.lineTo(x + size * 0.15, y + size * 0.8);
        ctx.stroke();
        break;
    }
    ctx.restore();
  };

  // ── pointer handlers ──
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeLayer || activeLayer.locked) { showToast("Bu qatlam qulflangan"); return; }
    const ctx = getCtx(activeLayerId);
    if (!ctx) return;
    const { x, y } = getPos(e);

    if (tool === "shapes") {
      pushUndo(activeLayerId);
      drawShapeAt(ctx, x, y, selectedShape, brushSize * 6);
      return;
    }
    if (tool === "fill") {
      pushUndo(activeLayerId);
      floodFill(ctx, x, y, color);
      return;
    }
    if (tool === "magic") {
      pushUndo(activeLayerId);
      for (let i = 0; i < 7; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * brushSize * 6;
        drawShapeAt(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, "star", Math.random() * 6 + 3);
      }
      return;
    }
    if (tool === "text") {
      textEditor.current = { x, y };
      setTextDraft({ x, y, value: "" });
      return;
    }
    if (tool === "select") return;

    if (isDrawTool) {
      pushUndo(activeLayerId);
      isDrawing.current = true;
      lastPoint.current = { x, y };
      applyStrokeStyle(ctx);
      if (brushPreset === "spray") { sprayDab(ctx, x, y); return; }
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = getCtx(activeLayerId);
    if (!ctx || !activeLayer || activeLayer.locked) return;
    const { x, y } = getPos(e);

    if (tool === "line" && lastPoint.current) {
      // straight-line preview: redraw from stroke start each move using last undo snapshot
      return; // simplified: line tool commits on pointer up using start->current
    }
    if (brushPreset === "spray" && (tool === "brush" || tool === "pen" || tool === "marker")) {
      sprayDab(ctx, x, y);
      lastPoint.current = { x, y };
      return;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPoint.current = { x, y };
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx(activeLayerId);
    if (tool === "line" && ctx && lastPoint.current && isDrawing.current) {
      const { x, y } = getPos(e);
      applyStrokeStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    isDrawing.current = false;
    lastPoint.current = null;
    if (ctx) ctx.closePath();
  };

  const commitTextDraft = () => {
    if (!textDraft || !textDraft.value.trim()) { setTextDraft(null); return; }
    const ctx = getCtx(activeLayerId);
    if (ctx) {
      pushUndo(activeLayerId);
      ctx.globalAlpha = opacity / 100;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;
      ctx.font = `${Math.max(16, brushSize * 5)}px 'Nunito', sans-serif`;
      ctx.fillText(textDraft.value, textDraft.x, textDraft.y);
    }
    setTextDraft(null);
  };

  // ── element / shape stamping from side panels ──
  const stampElement = (item: ElementItem) => {
    const ctx = getCtx(activeLayerId);
    if (!ctx || !activeLayer || activeLayer.locked) { showToast("Bu qatlam qulflangan"); return; }
    pushUndo(activeLayerId);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.font = "120px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.emoji, CANVAS_W / 2, CANVAS_H / 2);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    showToast(`${item.title} qo'shildi`);
  };

  // ── layer management ──
  const addLayer = () => {
    const id = `l-new-${layerCounter.current++}`;
    const name = `Qatlam ${layers.filter(l => l.id !== "fon").length + 1}`;
    setLayers(prev => [{ id, name, visible: true, locked: false }, ...prev.filter(l => l.id !== "fon"), prev.find(l => l.id === "fon")!]);
    setActiveLayerId(id);
  };

  const toggleVisible = (id: string) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const deleteLayer = (id: string) => {
    if (id === "fon") return;
    setLayers(prev => {
      const next = prev.filter(l => l.id !== id);
      if (activeLayerId === id && next.length) setActiveLayerId(next[0].id);
      return next;
    });
    setLayerMenuId(null);
  };

  // ── top bar actions ──
  const handleNewDrawing = () => {
    if (!window.confirm("Yangi rasm boshlansinmi? Joriy chizma o'chiriladi.")) return;
    layers.forEach(l => {
      const ctx = getCtx(l.id);
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      if (l.id === "fon") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
      undoStacks.current[l.id] = [];
      redoStacks.current[l.id] = [];
    });
    showToast("Yangi rasm boshlandi");
  };

  const handleSave = () => {
    const out = document.createElement("canvas");
    out.width = CANVAS_W; out.height = CANVAS_H;
    const octx = out.getContext("2d")!;
    // draw bottom-most first: reverse of list order
    [...layers].reverse().forEach(l => {
      if (!l.visible) return;
      const c = canvasRefs.current[l.id];
      if (c) octx.drawImage(c, 0, 0);
    });
    const link = document.createElement("a");
    link.download = "xayollar-royosi-rasm.png";
    link.href = out.toDataURL("image/png");
    link.click();
    showToast("Rasm saqlandi");
  };

  const handlePublish = () => {
    // Hook up to your publish/upload API here
    showToast("Rasm nashr qilindi ✦");
  };

  const addCustomColor = (hex: string) => {
    setCustomColors(prev => (prev.includes(hex) ? prev : [...prev, hex].slice(-8)));
    setColor(hex);
  };

  const zoomIn = () => setZoom(z => Math.min(200, z + 10));
  const zoomOut = () => setZoom(z => Math.max(50, z - 10));
  const zoomReset = () => setZoom(100);

  const filteredElements = elementCategory === "Barchasi" ? ELEMENTS : ELEMENTS.filter(e => e.category === elementCategory);

  // ═══════════════════════ RENDER ═══════════════════════
  return (
    <div className="draw-shell">
      <DrawAmbientBackground />
      <style>{`
        @import url('${FONT_IMPORT_URL}');

        * { box-sizing: border-box; }
        .draw-shell {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% -10%, #1a1030 0%, #0B0817 55%, #0B0817 100%);
          color: #F1E8FF;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
        }
        .draw-shell > *:not(.draw-ambient) { position: relative; z-index: 1; }

        /* ── AMBIENT BACKGROUND ── */
        .draw-ambient {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .draw-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.4;
          animation: draw-orb-drift 28s ease-in-out infinite;
        }
        .draw-orb-a {
          width: 50vw; height: 50vw; max-width: 640px; max-height: 640px;
          top: -16%; left: -12%;
          background: radial-gradient(circle, rgba(124,58,237,0.6), transparent 70%);
          animation-duration: 30s;
        }
        .draw-orb-b {
          width: 44vw; height: 44vw; max-width: 560px; max-height: 560px;
          bottom: -14%; right: -10%;
          background: radial-gradient(circle, rgba(192,38,211,0.5), transparent 70%);
          animation-duration: 36s;
          animation-delay: -10s;
        }
        .draw-orb-c {
          width: 32vw; height: 32vw; max-width: 420px; max-height: 420px;
          top: 46%; left: 60%;
          background: radial-gradient(circle, rgba(243,216,156,0.32), transparent 70%);
          animation-duration: 40s;
          animation-delay: -20s;
        }
        .draw-orb-d {
          width: 26vw; height: 26vw; max-width: 340px; max-height: 340px;
          top: 8%; right: 22%;
          background: radial-gradient(circle, rgba(56,189,248,0.28), transparent 70%);
          animation-duration: 24s;
          animation-delay: -6s;
        }
        @keyframes draw-orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 7%) scale(1.1); }
          66% { transform: translate(-4%, -5%) scale(0.92); }
        }

        .draw-magic-circle {
          position: absolute;
          bottom: -12%; right: -10%;
          width: min(60vw, 720px);
          height: min(60vw, 720px);
          opacity: 0.55;
          animation: draw-circle-spin 90s linear infinite;
        }
        .draw-magic-circle-rev {
          animation: draw-circle-spin-rev 60s linear infinite;
        }
        @keyframes draw-circle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes draw-circle-spin-rev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .draw-mote {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #F3D89C;
          box-shadow: 0 0 7px 1.5px rgba(243,216,156,0.85);
          opacity: 0;
          animation-name: draw-mote-twinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes draw-mote-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5) translateY(0); }
          50% { opacity: 0.95; transform: scale(1.3) translateY(-6px); }
        }

        .draw-dust {
          position: absolute;
          left: -3%;
          width: 5px; height: 5px;
          border-radius: 50%;
          opacity: 0;
          animation-name: draw-dust-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes draw-dust-drift {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          8% { opacity: 0.8; }
          50% { transform: translateX(55vw) translateY(-6vh); opacity: 0.55; }
          92% { opacity: 0.3; }
          100% { transform: translateX(112vw) translateY(4vh); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .draw-orb, .draw-magic-circle, .draw-mote, .draw-dust {
            animation: none !important;
          }
        }

        /* ── Top bar ── */
        .draw-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 16px clamp(16px,3vw,32px);
          border-bottom: 1px solid rgba(168,85,247,0.18);
          background: rgba(13,10,26,0.75);
          backdrop-filter: blur(16px);
          flex-wrap: wrap;
        }
        .back-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3);
          color: #E9DEFF; padding: 9px 16px; border-radius: 99px; cursor: pointer;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.9rem;
          transition: all 0.2s;
        }
        .back-btn:hover { background: rgba(168,85,247,0.22); }
        .draw-title-wrap { text-align: center; }
        .draw-title {
          font-family: 'Cinzel Decorative', serif; font-weight: 700;
          font-size: clamp(1.1rem, 2.4vw, 1.6rem);
          background: linear-gradient(135deg, #F3D89C 0%, #A855F7 60%, #E9D5FF 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          display: flex; align-items: center; gap: 8px; justify-content: center;
        }
        .draw-subtitle { font-size: 0.78rem; color: #9B8EC4; letter-spacing: 0.03em; margin-top: 2px; }
        .top-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .top-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 16px; border-radius: 99px; cursor: pointer;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.85rem;
          border: 1px solid rgba(168,85,247,0.3); background: rgba(168,85,247,0.08); color: #E9DEFF;
          transition: all 0.2s;
        }
        .top-btn:hover { background: rgba(168,85,247,0.2); }
        .top-btn.primary {
          border: none; color: #fff;
          background: linear-gradient(135deg, #7C3AED, #A855F7, #C026D3);
          box-shadow: 0 0 24px rgba(168,85,247,0.45);
        }
        .top-btn.primary:hover { box-shadow: 0 0 34px rgba(168,85,247,0.65); }

        /* ── Body layout ── */
        .draw-body {
          flex: 1; display: grid;
          grid-template-columns: 260px 1fr 300px;
          gap: 20px; padding: 20px clamp(16px,3vw,32px);
        }
        .panel {
          background: rgba(20,14,35,0.55);
          border: 1px solid rgba(168,85,247,0.18);
          border-radius: 20px; padding: 16px;
          backdrop-filter: blur(10px);
        }
        .panel-title {
          font-family: 'Cinzel', serif; font-size: 0.78rem; letter-spacing: 0.14em;
          color: #C4B5FD; text-transform: uppercase; margin-bottom: 12px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .icon-add {
          width: 24px; height: 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); color: #C4B5FD; cursor: pointer;
        }
        .icon-add:hover { background: rgba(168,85,247,0.3); }

        /* left: tools */
        .draw-left { display: flex; flex-direction: column; gap: 16px; }
        .tool-list { display: flex; flex-direction: column; gap: 6px; }
        .tool-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 12px; border: 1px solid transparent;
          background: transparent; color: #C4B5FD; cursor: pointer; text-align: left;
          font-family: 'Nunito', sans-serif; font-size: 0.88rem; font-weight: 600;
          transition: all 0.15s; width: 100%;
        }
        .tool-btn:hover { background: rgba(168,85,247,0.1); }
        .tool-btn.active {
          background: rgba(168,85,247,0.22);
          border-color: rgba(168,85,247,0.5);
          color: #F1E8FF;
          box-shadow: 0 0 16px rgba(168,85,247,0.25);
        }

        .layer-row {
          display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px;
          cursor: pointer; border: 1px solid transparent; position: relative;
        }
        .layer-row.active { background: rgba(168,85,247,0.16); border-color: rgba(168,85,247,0.35); }
        .layer-thumb {
          width: 34px; height: 34px; border-radius: 8px; background: #fff;
          border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;
        }
        .layer-name { flex: 1; font-size: 0.84rem; font-weight: 600; color: #E9DEFF; }
        .icon-btn {
          width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; color: #9B8EC4; cursor: pointer; border-radius: 6px;
        }
        .icon-btn:hover { color: #F1E8FF; background: rgba(168,85,247,0.15); }
        .layer-menu {
          position: absolute; right: 8px; top: 38px; z-index: 20;
          background: #17112B; border: 1px solid rgba(168,85,247,0.3); border-radius: 10px;
          padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .layer-menu button {
          display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px;
          background: none; border: none; color: #F87171; font-size: 0.8rem; font-weight: 700;
          cursor: pointer; border-radius: 8px; white-space: nowrap;
        }
        .layer-menu button:hover { background: rgba(248,113,113,0.12); }

        /* center: toolbar + canvas */
        .draw-center { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
        .canvas-toolbar {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          background: rgba(20,14,35,0.55); border: 1px solid rgba(168,85,247,0.18);
          border-radius: 16px; padding: 10px 16px; flex-wrap: wrap;
        }
        .toolbar-group { display: flex; align-items: center; gap: 6px; }
        .zoom-btn, .hist-btn {
          width: 32px; height: 32px; border-radius: 10px; border: 1px solid rgba(168,85,247,0.25);
          background: rgba(168,85,247,0.08); color: #E9DEFF; display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .zoom-btn:hover, .hist-btn:hover { background: rgba(168,85,247,0.22); }
        .zoom-label { font-size: 0.85rem; font-weight: 700; color: #C4B5FD; min-width: 48px; text-align: center; }

        .canvas-stage {
          position: relative; flex: 1;
          background: rgba(10,7,20,0.5);
          border: 1px solid rgba(168,85,247,0.18);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          overflow: auto; padding: 20px; min-height: 360px;
        }
        .canvas-frame {
          position: relative;
          width: min(100%, 900px);
          aspect-ratio: ${CANVAS_W} / ${CANVAS_H};
          transform-origin: center center;
          box-shadow: 0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06);
          border-radius: 6px; overflow: hidden;
        }
        .layer-canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
        .text-draft-input {
          position: absolute; background: rgba(0,0,0,0.4); border: 1px dashed #A855F7;
          color: #F1E8FF; font-family: 'Nunito', sans-serif; padding: 2px 6px; border-radius: 4px; outline: none;
        }

        .bottom-bar {
          display: flex; align-items: center; gap: clamp(14px,2vw,28px); flex-wrap: wrap;
          background: rgba(20,14,35,0.55); border: 1px solid rgba(168,85,247,0.18);
          border-radius: 16px; padding: 12px 18px;
        }
        .slider-block { display: flex; flex-direction: column; gap: 4px; min-width: 130px; }
        .slider-block label { font-size: 0.75rem; color: #9B8EC4; display: flex; justify-content: space-between; }
        input[type="range"] { accent-color: #A855F7; width: 100%; }
        .color-swatch-btn {
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.25); cursor: pointer;
        }
        .brush-preset-row { display: flex; gap: 6px; margin-left: auto; }
        .brush-preset-btn {
          width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.2); color: #C4B5FD; cursor: pointer;
        }
        .brush-preset-btn.active { background: rgba(168,85,247,0.28); border-color: #A855F7; color: #fff; }

        /* right panel */
        .draw-right { display: flex; flex-direction: column; gap: 16px; }
        .right-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
        .right-tab {
          flex: 1; padding: 8px; border-radius: 10px; text-align: center; font-size: 0.8rem; font-weight: 700;
          border: 1px solid rgba(168,85,247,0.2); background: transparent; color: #9B8EC4; cursor: pointer;
        }
        .right-tab.active { background: rgba(168,85,247,0.22); color: #F1E8FF; border-color: rgba(168,85,247,0.5); }
        .swatch-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
        .swatch {
          width: 100%; aspect-ratio: 1; border-radius: 10px; cursor: pointer;
          border: 2px solid transparent; transition: transform 0.15s;
        }
        .swatch.selected { border-color: #F3D89C; transform: scale(1.08); }
        .custom-color-input {
          -webkit-appearance: none; appearance: none; width: 100%; height: 46px;
          border: none; border-radius: 12px; background: none; cursor: pointer; padding: 0;
        }
        .cat-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin: 12px 0; }
        .cat-tab {
          padding: 5px 11px; border-radius: 99px; font-size: 0.72rem; font-weight: 700;
          background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.2); color: #9B8EC4; cursor: pointer;
        }
        .cat-tab.active { background: rgba(168,85,247,0.25); color: #F1E8FF; border-color: #A855F7; }
        .element-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .element-card {
          aspect-ratio: 1; border-radius: 12px; border: 1px solid rgba(168,85,247,0.2);
          background: radial-gradient(ellipse at 40% 30%, rgba(124,58,237,0.28), rgba(15,10,26,0.9));
          display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden;
        }
        .element-card:hover { border-color: #A855F7; }
        .element-card img { width: 100%; height: 100%; object-fit: cover; }
        .element-emoji { font-size: 1.6rem; }
        .shape-row { display: grid; grid-template-columns: repeat(6,1fr); gap: 8px; margin-top: 8px; }
        .shape-btn {
          aspect-ratio: 1; border-radius: 10px; border: 1px solid rgba(168,85,247,0.2);
          background: rgba(168,85,247,0.06); color: #C4B5FD; display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .shape-btn.active { background: rgba(168,85,247,0.28); border-color: #A855F7; color: #fff; }

        .ai-card {
          border-radius: 16px; padding: 16px;
          background: linear-gradient(135deg, rgba(124,58,237,0.22), rgba(219,39,119,0.14));
          border: 1px solid rgba(168,85,247,0.35);
        }
        .ai-card-title { display: flex; align-items: center; gap: 8px; font-family:'Cinzel',serif; font-weight:700; font-size:0.92rem; margin-bottom:8px; color:#F1E8FF; }
        .ai-card textarea {
          width: 100%; resize: none; border-radius: 10px; border: 1px solid rgba(168,85,247,0.3);
          background: rgba(10,7,20,0.5); color: #E9DEFF; padding: 8px 10px; font-family: 'Nunito', sans-serif;
          font-size: 0.82rem; min-height: 54px; margin-bottom: 10px;
        }
        .ai-card button {
          width: 100%; padding: 10px; border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #7C3AED, #A855F7); color: #fff; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        /* toast */
        .draw-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(20,14,35,0.95); border: 1px solid rgba(168,85,247,0.4);
          color: #F1E8FF; padding: 10px 22px; border-radius: 99px; font-size: 0.85rem; font-weight: 700;
          z-index: 200; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* mobile bottom tabs + sheets */
        .mobile-tabbar { display: none; }
        .sheet-overlay {
          display: none;
        }

        @media (max-width: 1100px) {
          .draw-body { grid-template-columns: 220px 1fr; }
          .draw-right { display: none; }
        }

        @media (max-width: 760px) {
          .draw-body { grid-template-columns: 1fr; padding: 14px; gap: 14px; }
          .draw-left { display: none; }
          .draw-top { padding: 12px 16px; }
          .top-actions .top-btn span { display: none; }
          .top-actions .top-btn { padding: 9px 12px; }
          .canvas-stage { min-height: 46vh; padding: 10px; }
          .bottom-bar { padding-bottom: 78px; }

          .mobile-tabbar {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 60;
            background: rgba(13,10,26,0.95); backdrop-filter: blur(16px);
            border-top: 1px solid rgba(168,85,247,0.25);
            padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
            justify-content: space-around;
          }
          .mobile-tab {
            display: flex; flex-direction: column; align-items: center; gap: 3px;
            background: none; border: none; color: #9B8EC4; font-size: 0.62rem; font-weight: 700; cursor: pointer;
            padding: 6px 10px; border-radius: 10px;
          }
          .mobile-tab.active { color: #F1E8FF; background: rgba(168,85,247,0.18); }

          .sheet-overlay.open {
            display: block; position: fixed; inset: 0; z-index: 70;
            background: rgba(6,4,12,0.6); backdrop-filter: blur(2px);
          }
          .sheet {
            position: absolute; left: 0; right: 0; bottom: 0; max-height: 72vh; overflow-y: auto;
            background: #150F26; border-top: 1px solid rgba(168,85,247,0.35);
            border-radius: 22px 22px 0 0; padding: 18px; padding-bottom: calc(18px + env(safe-area-inset-bottom));
          }
          .sheet-handle { width: 40px; height: 4px; border-radius: 99px; background: rgba(255,255,255,0.2); margin: 0 auto 14px; }
          .sheet-close { position: absolute; top: 14px; right: 14px; color: #9B8EC4; background: none; border: none; cursor: pointer; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="draw-top">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Orqaga
        </button>
        <div className="draw-title-wrap">
          <div className="draw-title"><Sparkles size={20} /> Rasm chizish <Sparkles size={20} /></div>
          <div className="draw-subtitle">Tasavvuringizni qog'ozga tushiring ✦</div>
        </div>
        <div className="top-actions">
          <button className="top-btn" onClick={handleSave}><Save size={16} /><span>Saqlash</span></button>
          <button className="top-btn" onClick={handleNewDrawing}><FilePlus2 size={16} /><span>Yangi rasm</span></button>
          <button className="top-btn primary" onClick={handlePublish}><UploadCloud size={16} /><span>Nashr qilish</span></button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="draw-body">
        {/* LEFT: tools + layers (hidden on mobile, shown via sheet) */}
        <div className="draw-left">
          <div className="panel">
            <div className="panel-title">Asboblar</div>
            <div className="tool-list">
              {TOOLS.map(t => (
                <button
                  key={t.id}
                  className={`tool-btn ${tool === t.id ? "active" : ""}`}
                  onClick={() => setTool(t.id)}
                >
                  <t.icon size={17} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              Qatlamlar
              <button className="icon-add" onClick={addLayer}><Plus size={14} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {layers.map(l => (
                <div
                  key={l.id}
                  className={`layer-row ${activeLayerId === l.id ? "active" : ""}`}
                  onClick={() => setActiveLayerId(l.id)}
                >
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); toggleVisible(l.id); }}>
                    {l.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <div className="layer-thumb" />
                  <span className="layer-name">{l.name}</span>
                  {l.locked ? (
                    <Lock size={14} color="#9B8EC4" />
                  ) : (
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setLayerMenuId(layerMenuId === l.id ? null : l.id); }}>
                      <MoreVertical size={15} />
                    </button>
                  )}
                  {layerMenuId === l.id && (
                    <div className="layer-menu" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => deleteLayer(l.id)}><Trash2 size={13} /> O'chirish</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: toolbar + canvas + bottom bar */}
        <div className="draw-center">
          <div className="canvas-toolbar">
            <div className="toolbar-group">
              <button className="hist-btn" onClick={handleUndo}><Undo2 size={16} /></button>
              <button className="hist-btn" onClick={handleRedo}><Redo2 size={16} /></button>
            </div>
            <div className="toolbar-group">
              <button className="zoom-btn" onClick={zoomOut}><ZoomOut size={16} /></button>
              <span className="zoom-label">{zoom}%</span>
              <button className="zoom-btn" onClick={zoomIn}><ZoomIn size={16} /></button>
              <button className="zoom-btn" onClick={zoomReset}><Maximize2 size={15} /></button>
            </div>
          </div>

          <div className="canvas-stage">
            <div className="canvas-frame" style={{ transform: `scale(${zoom / 100})` }}>
              {[...layers].reverse().map(l => (
                <canvas
                  key={l.id}
                  ref={(el) => { canvasRefs.current[l.id] = el; }}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  className="layer-canvas"
                  style={{
                    display: l.visible ? "block" : "none",
                    zIndex: layers.length - layers.findIndex(x => x.id === l.id),
                    pointerEvents: l.id === activeLayerId ? "auto" : "none",
                    cursor: tool === "select" ? "default" : "crosshair",
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                />
              ))}
              {textDraft && (
                <input
                  autoFocus
                  className="text-draft-input"
                  style={{ left: `${(textDraft.x / CANVAS_W) * 100}%`, top: `${(textDraft.y / CANVAS_H) * 100 - 4}%` }}
                  value={textDraft.value}
                  onChange={(e) => setTextDraft({ ...textDraft, value: e.target.value })}
                  onBlur={commitTextDraft}
                  onKeyDown={(e) => { if (e.key === "Enter") commitTextDraft(); if (e.key === "Escape") setTextDraft(null); }}
                />
              )}
            </div>
          </div>

          <div className="bottom-bar">
            <div className="slider-block">
              <label><span>Qalinlik</span><span>{brushSize}px</span></label>
              <input type="range" min={1} max={40} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
            </div>
            <div className="slider-block">
              <label><span>Shaffoflik</span><span>{opacity}%</span></label>
              <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            </div>
            <div className="slider-block" style={{ minWidth: "auto" }}>
              <label>Rang</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="color-swatch-btn"
                  style={{ background: color }}
                  onClick={() => colorInputRef.current?.click()}
                />
                <button className="icon-btn" onClick={() => colorInputRef.current?.click()} title="Rang tanlash">
                  <Pipette size={16} />
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={color}
                  style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
                  onChange={(e) => addCustomColor(e.target.value)}
                />
              </div>
            </div>
            <div className="brush-preset-row">
              {BRUSH_PRESETS.map(p => (
                <button
                  key={p.id}
                  className={`brush-preset-btn ${brushPreset === p.id ? "active" : ""}`}
                  onClick={() => setBrushPreset(p.id)}
                  title={p.id}
                >
                  <p.icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: colors / elements (hidden < 1100px, shown via mobile sheet) */}
        <div className="draw-right">
          <div className="panel">
            <div className="right-tabs">
              <button className={`right-tab ${rightTab === "colors" ? "active" : ""}`} onClick={() => setRightTab("colors")}>Ranglar</button>
              <button className={`right-tab ${rightTab === "elements" ? "active" : ""}`} onClick={() => setRightTab("elements")}>Elementlar</button>
            </div>

            {rightTab === "colors" ? (
              <>
                {PALETTE.map((row, i) => (
                  <div className="swatch-grid" key={i}>
                    {row.map(hex => (
                      <button
                        key={hex}
                        className={`swatch ${color === hex ? "selected" : ""}`}
                        style={{ background: hex }}
                        onClick={() => setColor(hex)}
                      />
                    ))}
                  </div>
                ))}
                <div className="panel-title" style={{ marginTop: 4 }}>O'zimniki</div>
                <div className="swatch-grid">
                  {customColors.map(hex => (
                    <button
                      key={hex}
                      className={`swatch ${color === hex ? "selected" : ""}`}
                      style={{ background: hex }}
                      onClick={() => setColor(hex)}
                    />
                  ))}
                  <button className="icon-add" style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }} onClick={() => colorInputRef.current?.click()}>
                    <Plus size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="cat-tabs">
                  {(["Barchasi", "Qahramonlar", "Fonlar", "Buyumlar"] as const).map(c => (
                    <button key={c} className={`cat-tab ${elementCategory === c ? "active" : ""}`} onClick={() => setElementCategory(c)}>{c}</button>
                  ))}
                </div>
                <div className="element-grid">
                  {filteredElements.map(item => <ElementThumb key={item.id} item={item} onPick={stampElement} />)}
                </div>
                <div className="panel-title" style={{ marginTop: 16 }}>Shakllar</div>
                <div className="shape-row">
                  {SHAPES_LIST.map(s => (
                    <button
                      key={s.id}
                      className={`shape-btn ${selectedShape === s.id && tool === "shapes" ? "active" : ""}`}
                      onClick={() => { setSelectedShape(s.id); setTool("shapes"); }}
                    >
                      <s.icon size={16} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="ai-card">
            <div className="ai-card-title"><Wand2 size={16} /> AI yordamida rasm yaratish</div>
            <textarea placeholder="G'oyangizni yozing, biz siz uchun rasm yaratamiz!" />
            <button onClick={() => showToast("So'rov yuborildi ✦")}>
              <Sparkles size={15} /> Yaratish
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM TABS ── */}
      <div className="mobile-tabbar">
        <button className={`mobile-tab ${mobileSheet === "tools" ? "active" : ""}`} onClick={() => setMobileSheet("tools")}>
          <Pencil size={18} /> Asboblar
        </button>
        <button className={`mobile-tab ${mobileSheet === "layers" ? "active" : ""}`} onClick={() => setMobileSheet("layers")}>
          <Shapes size={18} /> Qatlamlar
        </button>
        <button className={`mobile-tab ${mobileSheet === "colors" ? "active" : ""}`} onClick={() => setMobileSheet("colors")}>
          <Pipette size={18} /> Ranglar
        </button>
        <button className={`mobile-tab ${mobileSheet === "elements" ? "active" : ""}`} onClick={() => setMobileSheet("elements")}>
          <Sparkles size={18} /> Elementlar
        </button>
      </div>

      {/* ── MOBILE SHEETS ── */}
      <div className={`sheet-overlay ${mobileSheet ? "open" : ""}`} onClick={() => setMobileSheet(null)}>
        <div className="sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle" />
          <button className="sheet-close" onClick={() => setMobileSheet(null)}><X size={18} /></button>

          {mobileSheet === "tools" && (
            <div className="tool-list">
              {TOOLS.map(t => (
                <button key={t.id} className={`tool-btn ${tool === t.id ? "active" : ""}`} onClick={() => { setTool(t.id); setMobileSheet(null); }}>
                  <t.icon size={17} /> {t.label}
                </button>
              ))}
            </div>
          )}

          {mobileSheet === "layers" && (
            <>
              <div className="panel-title">
                Qatlamlar
                <button className="icon-add" onClick={addLayer}><Plus size={14} /></button>
              </div>
              {layers.map(l => (
                <div key={l.id} className={`layer-row ${activeLayerId === l.id ? "active" : ""}`} onClick={() => setActiveLayerId(l.id)}>
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); toggleVisible(l.id); }}>
                    {l.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <div className="layer-thumb" />
                  <span className="layer-name">{l.name}</span>
                  {l.locked ? <Lock size={14} color="#9B8EC4" /> : (
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); deleteLayer(l.id); }}><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </>
          )}

          {mobileSheet === "colors" && (
            <>
              {PALETTE.map((row, i) => (
                <div className="swatch-grid" key={i}>
                  {row.map(hex => (
                    <button key={hex} className={`swatch ${color === hex ? "selected" : ""}`} style={{ background: hex }} onClick={() => setColor(hex)} />
                  ))}
                </div>
              ))}
              <input type="color" className="custom-color-input" value={color} onChange={(e) => addCustomColor(e.target.value)} />
            </>
          )}

          {mobileSheet === "elements" && (
            <>
              <div className="cat-tabs">
                {(["Barchasi", "Qahramonlar", "Fonlar", "Buyumlar"] as const).map(c => (
                  <button key={c} className={`cat-tab ${elementCategory === c ? "active" : ""}`} onClick={() => setElementCategory(c)}>{c}</button>
                ))}
              </div>
              <div className="element-grid">
                {filteredElements.map(item => <ElementThumb key={item.id} item={item} onPick={(it) => { stampElement(it); setMobileSheet(null); }} />)}
              </div>
              <div className="panel-title" style={{ marginTop: 16 }}>Shakllar</div>
              <div className="shape-row">
                {SHAPES_LIST.map(s => (
                  <button key={s.id} className={`shape-btn ${selectedShape === s.id ? "active" : ""}`} onClick={() => { setSelectedShape(s.id); setTool("shapes"); setMobileSheet(null); }}>
                    <s.icon size={16} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <div className="draw-toast">{toast}</div>}
    </div>
  );
}