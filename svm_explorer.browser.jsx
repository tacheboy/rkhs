const { useState, useRef, useMemo, useCallback } = React;

/* ══ SVM SOLVER (subgradient descent on primal soft-margin) ══════════════════ */
function solveSVM(pts, C = 100) {
  if (!pts || pts.length < 2) return null;
  if (!pts.some(p => p.lbl === 1) || !pts.some(p => p.lbl === -1)) return null;
  let w0 = 0.01, w1 = 0.01, b = 0;
  const n = pts.length;
  for (let t = 1; t <= 6000; t++) {
    const η = 0.4 / (t + 80);
    let g0 = w0 / n, g1 = w1 / n, gb = 0;
    for (const { x, y, lbl } of pts) {
      if (lbl * (w0 * x + w1 * y + b) < 1) {
        g0 -= C * lbl * x / n;
        g1 -= C * lbl * y / n;
        gb -= C * lbl / n;
      }
    }
    w0 -= η * g0; w1 -= η * g1; b -= η * gb;
  }
  const nrm = Math.hypot(w0, w1);
  return {
    w: [w0, w1], b,
    margin: nrm > 1e-4 ? 2 / nrm : 99,
    svs: new Set(pts.filter(({ x, y, lbl }) => lbl * (w0 * x + w1 * y + b) <= 1.06))
  };
}

/* ══ CANVAS GEOMETRY ═════════════════════════════════════════════════════════ */
const VW = 460, VH = 340, SC = 68, VCX = VW / 2, VCY = VH / 2;
const ts = (x, y) => [VCX + x * SC, VCY - y * SC];

/* ══ PALETTE ═════════════════════════════════════════════════════════════════ */
const K = {
  bg: '#060d1c', pnl: '#0b1729', pnl2: '#0f2040',
  bdr: 'rgba(56,189,248,0.14)', acc: '#38bdf8',
  pos: '#f97316', neg: '#8b5cf6', sv: '#34d399',
  bd: '#38bdf8', mg: 'rgba(56,189,248,0.07)',
  grd: 'rgba(255,255,255,0.04)', ax: 'rgba(255,255,255,0.1)',
  txt: '#94a3b8', txt2: '#e2e8f0',
};

/* ══ DEFAULT DATA ════════════════════════════════════════════════════════════ */
const SEP = [
  { x: 1.8, y: 0.9, lbl: 1 }, { x: 2.2, y: 0.1, lbl: 1 }, { x: 1.2, y: 1.7, lbl: 1 },
  { x: 2.6, y: 1.4, lbl: 1 }, { x: 1.5, y: 2.1, lbl: 1 },
  { x: -1.8, y: -0.9, lbl: -1 }, { x: -2.2, y: -0.2, lbl: -1 }, { x: -1.2, y: -1.7, lbl: -1 },
  { x: -2.6, y: -1.1, lbl: -1 }, { x: -1.5, y: -0.1, lbl: -1 },
];
const SOFT = [
  { x: 1.6, y: 0.8, lbl: 1 }, { x: 2.1, y: 0.1, lbl: 1 }, { x: 1.1, y: 1.6, lbl: 1 }, { x: 2.5, y: 1.2, lbl: 1 },
  { x: -1.6, y: -0.8, lbl: -1 }, { x: -2.1, y: -0.2, lbl: -1 }, { x: -1.1, y: -1.6, lbl: -1 }, { x: -2.5, y: -1.2, lbl: -1 },
  { x: 0.3, y: 0.6, lbl: -1 }, { x: -0.4, y: -0.5, lbl: 1 },
  { x: 0.7, y: -0.4, lbl: -1 }, { x: -0.7, y: 0.5, lbl: 1 },
];

/* ══ UI ATOMS ════════════════════════════════════════════════════════════════ */
const Card = ({ children, accent }) => (
  <div style={{
    background: K.pnl, border: `1px solid ${K.bdr}`, borderRadius: 8, padding: 16,
    ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
    marginBottom: 12
  }}>{children}</div>
);

const Label = ({ children, color = K.acc }) => (
  <div style={{ fontSize: 10.5, fontWeight: 700, color, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 12 }}>
    {children}
  </div>
);

const Bullet = ({ children }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
    <span style={{ color: K.acc, fontSize: 10, marginTop: 4, flexShrink: 0 }}>▹</span>
    <span style={{ color: K.txt, fontSize: 12.5, lineHeight: 1.6 }}>{children}</span>
  </div>
);

const Btn = ({ children, onClick, variant = 'default' }) => (
  <button onClick={onClick} style={{
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
    border: `1px solid ${variant === 'active' ? K.acc : K.bdr}`,
    background: variant === 'active' ? 'rgba(56,189,248,0.12)' : K.pnl2,
    color: variant === 'active' ? K.acc : K.txt2,
    transition: 'all 0.15s'
  }}>{children}</button>
);

/* ══ SVG LAYERS ══════════════════════════════════════════════════════════════ */
const Grid = () => (
  <g>
    {[-2, -1, 1, 2].map(i => (
      <g key={i}>
        <line x1={ts(i, -5)[0]} y1={ts(i, -5)[1]} x2={ts(i, 5)[0]} y2={ts(i, 5)[1]} stroke={K.grd} strokeWidth={0.5} />
        <line x1={ts(-5, i)[0]} y1={ts(-5, i)[1]} x2={ts(5, i)[0]} y2={ts(5, i)[1]} stroke={K.grd} strokeWidth={0.5} />
      </g>
    ))}
    <line x1={ts(0, -5)[0]} y1={ts(0, -5)[1]} x2={ts(0, 5)[0]} y2={ts(0, 5)[1]} stroke={K.ax} strokeWidth={0.8} />
    <line x1={ts(-5, 0)[0]} y1={ts(-5, 0)[1]} x2={ts(5, 0)[0]} y2={ts(5, 0)[1]} stroke={K.ax} strokeWidth={0.8} />
  </g>
);

const Boundary = ({ svm, clipId }) => {
  if (!svm) return null;
  const { w: [w0, w1], b } = svm;
  if (Math.abs(w0) < 1e-5 && Math.abs(w1) < 1e-5) return null;

  const lc = (off) => {
    if (Math.abs(w1) > 1e-4) {
      const yAt = x => (off - b - w0 * x) / w1;
      return [ts(-14, yAt(-14)), ts(14, yAt(14))];
    }
    const xv = Math.abs(w0) > 1e-4 ? (off - b) / w0 : 0;
    return [ts(xv, -14), ts(xv, 14)];
  };

  const [[a1, b1], [a2, b2], [a3, b3]] = [lc(0), lc(1), lc(-1)];
  const band = [a2, b2, b3, a3].map(p => p.join(',')).join(' ');

  return (
    <g clipPath={`url(#${clipId})`}>
      <polygon points={band} fill={K.mg} />
      <line x1={a3[0]} y1={a3[1]} x2={b3[0]} y2={b3[1]} stroke={K.bd} strokeWidth={1} strokeDasharray="5 4" opacity={0.45} />
      <line x1={a2[0]} y1={a2[1]} x2={b2[0]} y2={b2[1]} stroke={K.bd} strokeWidth={1} strokeDasharray="5 4" opacity={0.45} />
      <line x1={a1[0]} y1={a1[1]} x2={b1[0]} y2={b1[1]} stroke={K.bd} strokeWidth={2.5} />
    </g>
  );
};

const Points = ({ pts, svm }) => (
  <>
    {pts.map((p, i) => {
      const [sx, sy] = ts(p.x, p.y);
      const isSV = svm?.svs?.has(p);
      return (
        <g key={i}>
          {isSV && <circle cx={sx} cy={sy} r={11} fill="none" stroke={K.sv} strokeWidth={1.5} opacity={0.85} />}
          <circle cx={sx} cy={sy} r={5.5} fill={p.lbl === 1 ? K.pos : K.neg} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
        </g>
      );
    })}
  </>
);

/* ══ CANVAS PANEL ════════════════════════════════════════════════════════════ */
function CanvasPanel({ pts, svm, svgRef, onClick, interactive = false, clipId = 'cp1', footer }) {
  return (
    <div>
      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} onClick={onClick}
        style={{ width: '100%', display: 'block', borderRadius: 8, background: K.bg, border: `1px solid ${K.bdr}`, cursor: interactive ? 'crosshair' : 'default' }}>
        <defs><clipPath id={clipId}><rect x={0} y={0} width={VW} height={VH} /></clipPath></defs>
        <Grid />
        <Boundary svm={svm} clipId={clipId} />
        <Points pts={pts} svm={svm} />
        {svm && svm.margin < 50 && (
          <text x={VW - 10} y={18} textAnchor="end" fill={K.acc} fontSize={11} fontFamily="monospace" opacity={0.85}>
            margin = {svm.margin.toFixed(3)}
          </text>
        )}
        {svm && (
          <text x={VW - 10} y={33} textAnchor="end" fill={K.txt} fontSize={10} fontFamily="monospace" opacity={0.7}>
            SVs = {svm.svs.size}
          </text>
        )}
      </svg>
      {footer}
    </div>
  );
}

/* ══ STATS CARD ══════════════════════════════════════════════════════════════ */
const StatsCard = ({ svm, pts }) => {
  const rows = [
    ['Total points', pts.length],
    ['Class +1 (●)', pts.filter(p => p.lbl === 1).length],
    ['Class −1 (●)', pts.filter(p => p.lbl === -1).length],
    ['Support vectors', svm?.svs?.size ?? '—'],
    ['Margin', svm && svm.margin < 50 ? svm.margin.toFixed(4) : '—'],
  ];
  return (
    <Card>
      <Label>Live Stats</Label>
      {rows.map(([label, val]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
          <span style={{ color: K.txt, fontSize: 13 }}>{label}</span>
          <span style={{ color: K.txt2, fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{val}</span>
        </div>
      ))}
    </Card>
  );
};

/* ══ KERNEL TRICK TAB ════════════════════════════════════════════════════════ */
function KernelTab() {
  const [ex, setEx] = useState('circle');

  const circlePts = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const θ = 2 * Math.PI * i / 12;
      pts.push({ x: 0.7 * Math.cos(θ), y: 0.7 * Math.sin(θ), lbl: 1 });
      pts.push({ x: 2.0 * Math.cos(θ + 0.15), y: 1.5 * Math.sin(θ + 0.15), lbl: -1 });
    }
    return pts;
  }, []);

  const xorPts = [
    { x: 1.1, y: 1.0, lbl: 1 }, { x: 1.4, y: 0.7, lbl: 1 }, { x: 0.8, y: 1.4, lbl: 1 },
    { x: -1.1, y: -1.0, lbl: 1 }, { x: -1.4, y: -0.7, lbl: 1 }, { x: -0.8, y: -1.4, lbl: 1 },
    { x: 1.1, y: -1.0, lbl: -1 }, { x: 1.4, y: -0.7, lbl: -1 }, { x: 0.8, y: -1.4, lbl: -1 },
    { x: -1.1, y: 1.0, lbl: -1 }, { x: -1.4, y: 0.7, lbl: -1 }, { x: -0.8, y: 1.4, lbl: -1 },
  ];

  const pts = ex === 'circle' ? circlePts : xorPts;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['circle', 'Concentric Circles (RBF)'], ['xor', 'XOR (Polynomial)']].map(([k, lbl]) => (
          <Btn key={k} onClick={() => setEx(k)} variant={ex === k ? 'active' : 'default'}>{lbl}</Btn>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: Input space */}
        <div>
          <div style={{ fontSize: 12, color: K.txt, marginBottom: 8, fontStyle: 'italic' }}>
            Input space L — not linearly separable
          </div>
          <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', display: 'block', borderRadius: 8, background: K.bg, border: `1px solid ${K.bdr}` }}>
            <defs><clipPath id="cpk"><rect x={0} y={0} width={VW} height={VH} /></clipPath></defs>
            <Grid />
            {/* Indicative (non-linear) decision boundary */}
            <g clipPath="url(#cpk)">
              {ex === 'circle'
                ? <ellipse cx={VCX} cy={VCY} rx={SC * 1.35} ry={SC * 1.12} fill="none" stroke={K.bd} strokeWidth={2} strokeDasharray="6 3" opacity={0.65} />
                : <>
                  <line x1={ts(0, -5)[0]} y1={ts(0, -5)[1]} x2={ts(0, 5)[0]} y2={ts(0, 5)[1]} stroke={K.bd} strokeWidth={2} opacity={0.65} />
                  <line x1={ts(-5, 0)[0]} y1={ts(-5, 0)[1]} x2={ts(5, 0)[0]} y2={ts(5, 0)[1]} stroke={K.bd} strokeWidth={2} opacity={0.65} />
                </>}
            </g>
            <Points pts={pts} />
            <text x={VW / 2} y={VH - 10} textAnchor="middle" fill={K.acc} fontSize={10.5} opacity={0.6}>
              ← non-linear boundary (kernel SVM can learn this)
            </text>
          </svg>
        </div>

        {/* Right: Explanation */}
        <div>
          {/* Mapping diagram */}
          <Card>
            <Label>Kernel Mapping: K(xᵢ,xⱼ) = Φ(xᵢ)·Φ(xⱼ)</Label>
            <svg viewBox="0 0 300 150" style={{ width: '100%' }}>
              <defs>
                <marker id="arrd" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill={K.bd} />
                </marker>
                <marker id="arrg" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill={K.sv} />
                </marker>
              </defs>
              <rect x={8} y={45} width={70} height={62} rx={6} fill="rgba(56,189,248,0.06)" stroke={K.bdr} />
              <text x={43} y={73} textAnchor="middle" fill={K.txt2} fontSize={15} fontWeight="700">L</text>
              <text x={43} y={91} textAnchor="middle" fill={K.txt} fontSize={10}>Input space</text>
              <text x={43} y={105} textAnchor="middle" fill={K.txt} fontSize={9}>ℝ²</text>
              <line x1={80} y1={76} x2={144} y2={76} stroke={K.bd} strokeWidth={1.5} markerEnd="url(#arrd)" />
              <text x={112} y={68} textAnchor="middle" fill={K.bd} fontSize={12}>Φ</text>
              <rect x={146} y={45} width={70} height={62} rx={6} fill="rgba(56,189,248,0.06)" stroke={K.bdr} />
              <text x={181} y={73} textAnchor="middle" fill={K.txt2} fontSize={15} fontWeight="700">H</text>
              <text x={181} y={91} textAnchor="middle" fill={K.txt} fontSize={10}>Feature space</text>
              <text x={181} y={105} textAnchor="middle" fill={K.txt} fontSize={9}>{ex === 'xor' ? 'ℝ⁶' : '∞-dim'}</text>
              <path d="M 43 44 Q 112 4 181 44" fill="none" stroke={K.sv} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrg)" />
              <text x={112} y={22} textAnchor="middle" fill={K.sv} fontSize={12} fontWeight="700">K(xᵢ, xⱼ)</text>
              <text x={112} y={36} textAnchor="middle" fill={K.txt} fontSize={9}>= Φ(xᵢ) · Φ(xⱼ)</text>
              <text x={150} y={138} textAnchor="middle" fill={K.sv} fontSize={11}>✓ Never compute Φ explicitly</text>
            </svg>
          </Card>

          <Card>
            <Label>{ex === 'circle' ? 'RBF Kernel' : 'Polynomial Kernel'}</Label>
            {(ex === 'circle' ? [
              "K(x,y) = exp(−‖x−y‖²/2σ²) — Gaussian kernel",
              "Corresponds to Φ mapping to an ∞-dimensional space H",
              "Decision: f(x) = Σ αᵢyᵢK(sᵢ, x) + b (only SVs contribute)",
              "Theorem 5: with small σ, Gaussian SVM has infinite VC dimension — yet still generalizes well due to maximum-margin training",
              "Only one free param after training: σ (the width). Tune via cross-validation or VC bound.",
            ] : [
              "K(x,y) = (x·y + 1)² — degree-2 polynomial",
              "Explicit map Φ: ℝ² → ℝ⁶, Φ(x) = [x₁², x₂², √2x₁x₂, √2x₁, √2x₂, 1]",
              "In ℝ⁶, the XOR data IS linearly separable!",
              "Cost: O(d) for K vs O(dᵖ) for explicit Φ — the kernel trick's power",
              "Mercer's condition guarantees K(x,y) = Φ(x)·Φ(y) for some valid Φ",
            ]).map((b, i) => <Bullet key={i}>{b}</Bullet>)}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ══ FORMULAS TAB ════════════════════════════════════════════════════════════ */
function FormulasTab() {
  const [hover, setHover] = useState(null);
  const blocks = [
    {
      title: 'VC Bound (Eq. 3)', color: K.acc,
      formula: 'R(α) ≤ Rₑₘₚ(α) + √[ h(log(2l/h)+1) − log(η/4) ] / l',
      terms: [['R(α)', 'actual risk (generalization error)'], ['Rₑₘₚ(α)', 'training error'], ['h', 'VC dimension'], ['l', '# training samples'], ['η', 'confidence param']],
      note: "Independent of P(x,y)! The bound holds for any distribution."
    },
    {
      title: 'Primal (Hard Margin)', color: '#a78bfa',
      formula: 'min ½‖w‖²  s.t. yᵢ(w·xᵢ + b) ≥ 1  ∀i',
      terms: [['w', 'normal vector to hyperplane'], ['b', 'bias/offset'], ['margin', '2 / ‖w‖']],
      note: "Maximizing margin ↔ minimizing ‖w‖ — the core geometric insight."
    },
    {
      title: 'Dual (Separable)', color: '#a78bfa',
      formula: 'max Σαᵢ − ½ Σᵢⱼ αᵢαⱼyᵢyⱼ (xᵢ·xⱼ)   s.t. αᵢ≥0, Σαᵢyᵢ=0',
      terms: [['αᵢ > 0', 'only for support vectors (KKT)'], ['w = Σαᵢyᵢxᵢ', 'solution from dual'], ['xᵢ·xⱼ', 'replace with K(xᵢ,xⱼ) for nonlinear']],
      note: "Data appears only as dot products → kernel trick applies here."
    },
    {
      title: 'Soft Margin (C)', color: K.pos,
      formula: 'min ½‖w‖² + C·Σξᵢ   s.t. yᵢ(w·xᵢ+b) ≥ 1−ξᵢ, ξᵢ≥0',
      terms: [['ξᵢ', 'slack: how far inside the margin'], ['C large', 'strict (risk overfit)'], ['C small', 'lenient (risk underfit)'], ['dual change', 'αᵢ ∈ [0, C] instead of αᵢ ≥ 0']],
      note: "Σξᵢ upper-bounds the number of training errors."
    },
    {
      title: 'Structural Risk Min.', color: K.sv,
      formula: 'SRM: choose f* = argmin [ Rₑₘₚ(f) + VC_confidence(h) ]',
      terms: [['nested subsets', 'S₁⊂S₂⊂S₃... ordered by VC dim'], ['trade-off', 'lower h → tighter bound but higher train error'], ['SVM', 'implicitly does SRM by maximizing margin']],
      note: "SVMs can't fully prove SRM (data-dependent structure), but gap-tolerant classifiers can."
    },
    {
      title: 'Leave-One-Out Bound', color: K.sv,
      formula: 'E[P(error)] ≤ E[# support vectors] / # training samples',
      terms: [['intuition', 'removing a non-SV doesn\'t change the hyperplane'], ['so only SVs', 'can become test errors after LOO'], ['drawback', 'not always predictive in practice']],
      note: "Elegant and distribution-free, but often loose."
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {blocks.map((b, i) => (
        <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          style={{ background: K.pnl, border: `1px solid ${hover === i ? b.color : K.bdr}`, borderLeft: `3px solid ${b.color}`, borderRadius: 8, padding: 16, transition: 'border 0.2s' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: b.color, marginBottom: 10 }}>{b.title}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: K.txt2, background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 5, marginBottom: 12, lineHeight: 1.6 }}>
            {b.formula}
          </div>
          {b.terms.map(([s, d]) => (
            <div key={s} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
              <code style={{ color: b.color, fontSize: 11, minWidth: 90, flexShrink: 0 }}>{s}</code>
              <span style={{ color: K.txt, fontSize: 11.5 }}>{d}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: K.txt, fontStyle: 'italic', borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 8 }}>
            ↳ {b.note}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══ VC DIMENSION TAB ════════════════════════════════════════════════════════ */
function VCTab() {
  const [npts, setNpts] = useState(3);
  const [combo, setCombo] = useState(0);

  const triangle3 = [{ x: 0, y: 1.5 }, { x: -1.3, y: -0.75 }, { x: 1.3, y: -0.75 }];
  const four = [{ x: -1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }];

  const combos3 = Array.from({ length: 8 }, (_, i) => [i & 4 ? 1 : -1, i & 2 ? 1 : -1, i & 1 ? 1 : -1]);
  const combos4 = Array.from({ length: 16 }, (_, i) => [i & 8 ? 1 : -1, i & 4 ? 1 : -1, i & 2 ? 1 : -1, i & 1 ? 1 : -1]);

  const pts3 = triangle3.map((p, i) => ({ ...p, lbl: combos3[combo % 8][i] }));
  const pts4 = four.map((p, i) => ({ ...p, lbl: (combos4[combo % 16][i]) }));
  const disp = npts === 3 ? pts3 : pts4;
  const ncombos = npts === 3 ? 8 : 16;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <span style={{ color: K.txt, fontSize: 13, alignSelf: 'center' }}>Points:</span>
          <Btn onClick={() => { setNpts(3); setCombo(0); }} variant={npts === 3 ? 'active' : 'default'}>3 (shatterable)</Btn>
          <Btn onClick={() => { setNpts(4); setCombo(0); }} variant={npts === 4 ? 'active' : 'default'}>4 (NOT shatterable)</Btn>
        </div>

        <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', display: 'block', borderRadius: 8, background: K.bg, border: `1px solid ${K.bdr}` }}>
          <defs><clipPath id="cpv"><rect x={0} y={0} width={VW} height={VH} /></clipPath></defs>
          <Grid />
          {disp.map((p, i) => {
            const [sx, sy] = ts(p.x, p.y);
            return (
              <g key={i}>
                <circle cx={sx} cy={sy} r={16} fill={p.lbl === 1 ? 'rgba(249,115,22,0.15)' : 'rgba(139,92,246,0.15)'} />
                <circle cx={sx} cy={sy} r={8} fill={p.lbl === 1 ? K.pos : K.neg} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
                <text cx={sx} cy={sy}>
                  <tspan x={sx} y={sy + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight="700">
                    {p.lbl === 1 ? '+' : '−'}
                  </tspan>
                </text>
              </g>
            );
          })}
          <text x={10} y={VH - 10} fill={npts === 3 ? K.sv : '#f87171'} fontSize={11.5} fontFamily="monospace">
            {npts === 3 ? '✓ Any of 2³=8 labelings can be realized by some oriented line' : '✗ Not all 2⁴=16 labelings can be separated by a line'}
          </text>
        </svg>

        <div style={{ marginTop: 12 }}>
          <div style={{ color: K.txt, fontSize: 12, marginBottom: 8 }}>
            Labeling {combo % ncombos + 1} of {ncombos}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Array.from({ length: ncombos }, (_, i) => (
              <button key={i} onClick={() => setCombo(i)} style={{
                width: 32, height: 28, border: `1px solid ${combo === i ? K.acc : K.bdr}`,
                borderRadius: 5, background: combo === i ? 'rgba(56,189,248,0.15)' : K.pnl2,
                color: K.txt, cursor: 'pointer', fontSize: 11
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Card>
          <Label>VC Dimension</Label>
          <Bullet>h = max # points that can be shattered by the function family</Bullet>
          <Bullet>"Shattered" = every possible ±1 labeling is achievable by some member of the family</Bullet>
          <Bullet>For oriented hyperplanes in ℝⁿ: h = n+1 (Theorem 1 in Burges)</Bullet>
          <Bullet>For homogeneous polynomial kernel degree p in ℝᵈ: h = C(d+p-1, p) + 1 — grows very fast!</Bullet>
          <Bullet>For RBF kernels (C → ∞, σ → 0): infinite VC dimension</Bullet>
        </Card>

        <Card accent={K.acc}>
          <Label>Why SVMs still generalize</Label>
          <Bullet>High VC dim doesn't guarantee poor performance — it just means the VC bound is vacuous</Bullet>
          <Bullet>Gap-tolerant classifier analysis: VC dim h ≤ ⌈D²/M²⌉ + 1 (D=diameter, M=margin)</Bullet>
          <Bullet>SVM maximizes M → minimizes this bound → implements a form of capacity control</Bullet>
          <Bullet>Theorem 7: E[P(error)] ≤ E[D²/M²]/l — confirms margin matters for generalization</Bullet>
          <Bullet>LOO bound: E[error] ≤ E[#SVs] / l — few SVs ≈ good generalization (heuristically)</Bullet>
        </Card>

        <div style={{ background: K.pnl, border: `1px solid ${K.bdr}`, borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 11, color: K.acc, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>VC Dim Quick Reference</div>
          {[['Linear (ℝⁿ)', 'n + 1'], ['Poly (d,p)', 'C(d+p−1,p)+1'], ['RBF kernel', '∞ (if C,σ free)'], ['k-NN (k=1)', '∞']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
              <span style={{ color: K.txt, fontSize: 12 }}>{k}</span>
              <span style={{ color: K.txt2, fontFamily: 'monospace', fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN COMPONENT ══════════════════════════════════════════════════════════ */
function SVMExplorer() {
  const [tab, setTab] = useState(0);
  const [pts, setPts] = useState(SEP);
  const [nxt, setNxt] = useState(1);
  const [C, setC] = useState(1.0);
  const svgRef = useRef(null);

  const svm = useMemo(() => solveSVM(pts, 100), [pts]);
  const svmSoft = useMemo(() => solveSVM(SOFT, C), [C]);

  const handleClick = useCallback((e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * VW / rect.width;
    const sy = (e.clientY - rect.top) * VH / rect.height;
    const x = (sx - VCX) / SC;
    const y = (VCY - sy) / SC;
    if (Math.abs(x) > 3.2 || Math.abs(y) > 2.4) return;
    setPts(p => [...p, { x, y, lbl: nxt }]);
    setNxt(n => -n);
  }, [nxt]);

  const TABS = ['Hyperplane & Margin', 'Soft Margin (C)', 'Kernel Trick', 'VC Dimension', 'Key Formulas'];

  const marginBullets = [
    "Click the canvas to add points — alternates between orange (+1) and purple (−1)",
    "The solid cyan line is the decision boundary: w·x + b = 0",
    "Dashed lines are H₁ (score=+1) and H₂ (score=−1) — the margin boundaries",
    "Margin = 2/‖w‖ — the perpendicular distance between H₁ and H₂",
    "Ringed points (green) are support vectors — only these define w = Σ αᵢyᵢxᵢ",
    "Try moving non-SVs around — the boundary won't change until you cross a margin line",
  ];

  const softBullets = [
    "This dataset has overlapping classes — no perfect linear separator exists",
    "Slack variables ξᵢ ≥ 0 measure how far each point violates the margin: ξᵢ = max(0, 1 − yᵢ(w·xᵢ+b))",
    "Modified objective: min ½‖w‖² + C·Σξᵢ — balance margin vs. violations",
    "C→0: very lenient, wide margin, many violations; C→∞: hard margin (may not converge if non-separable)",
    "In the dual, only change is: αᵢ ∈ [0, C] instead of αᵢ ≥ 0 — elegant!",
    "αᵢ = C → point is an error or exactly on the margin boundary",
  ];

  return (
    <div style={{ background: K.bg, minHeight: '100vh', color: K.txt2, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '18px 24px 0', borderBottom: `1px solid ${K.bdr}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: K.acc, letterSpacing: '-0.3px' }}>
            SVM Explorer
          </h1>
          <span style={{ fontSize: 12, color: K.txt }}>Burges (1998) — Interactive Tutorial</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, fontSize: 11 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: K.pos, marginRight: 4 }} />class +1</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: K.neg, marginRight: 4 }} />class −1</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: `2px solid ${K.sv}`, marginRight: 4 }} />support vector</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 2, background: K.bd, marginRight: 4, verticalAlign: 'middle' }} />decision boundary</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map((name, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: '9px 18px', border: 'none', background: 'transparent',
              color: tab === i ? K.txt2 : K.txt, cursor: 'pointer', fontSize: 13,
              fontWeight: tab === i ? 600 : 400,
              borderBottom: tab === i ? `2px solid ${K.acc}` : '2px solid transparent',
              transition: 'all 0.15s'
            }}>{name}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        {tab === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            <CanvasPanel svgRef={svgRef} pts={pts} svm={svm} onClick={handleClick} interactive clipId="cp1"
              footer={
                <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                  <Btn onClick={() => { setPts(SEP); setNxt(1); }}>Reset</Btn>
                  <Btn onClick={() => { setPts([]); setNxt(1); }}>Clear</Btn>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: nxt === 1 ? K.pos : K.neg, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: K.txt }}>Next click → {nxt === 1 ? '+1' : '−1'}</span>
                  </div>
                </div>
              } />
            <div>
              <StatsCard svm={svm} pts={pts} />
              <Card>
                <Label>How it works</Label>
                {marginBullets.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
              </Card>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            <CanvasPanel pts={SOFT} svm={svmSoft} clipId="cp2"
              footer={
                <div style={{ background: K.pnl, border: `1px solid ${K.bdr}`, borderRadius: 8, padding: 16, marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: K.txt, fontSize: 13 }}>C (error penalty)</span>
                    <span style={{ color: K.acc, fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}>C = {C.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.05} max={10} step={0.05} value={C}
                    onChange={e => setC(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: K.acc, marginBottom: 6 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: K.txt }}>← wide margin (0.05)</span>
                    <span style={{ fontSize: 11, color: K.txt }}>strict (10) →</span>
                  </div>
                </div>
              } />
            <div>
              <StatsCard svm={svmSoft} pts={SOFT} />
              <Card>
                <Label>Soft Margin</Label>
                {softBullets.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
              </Card>
            </div>
          </div>
        )}

        {tab === 2 && <KernelTab />}
        {tab === 3 && <VCTab />}
        {tab === 4 && <FormulasTab />}
      </div>
    </div>
  );
}

window.SVMExplorer = SVMExplorer;
