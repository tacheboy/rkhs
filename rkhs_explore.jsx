const { useState, useEffect, useRef } = React;

// ── Math display helper ──────────────────────────────────────────────────────
const mathScriptStyle = {
  fontSize: "0.72em",
  lineHeight: 0,
};

function readScriptGroup(text, start) {
  if (text[start] === "{") {
    const end = text.indexOf("}", start + 1);
    if (end !== -1) {
      return { value: text.slice(start + 1, end), next: end + 1 };
    }
  }

  return { value: text[start] || "", next: start + 1 };
}

function renderMathText(text) {
  const parts = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if ((char === "_" || char === "^") && i + 1 < text.length) {
      const group = readScriptGroup(text, i + 1);
      const Tag = char === "_" ? "sub" : "sup";
      parts.push(
        <Tag key={`${char}-${i}`} style={mathScriptStyle}>
          {group.value}
        </Tag>
      );
      i = group.next - 1;
      continue;
    }

    parts.push(char);
  }

  return parts;
}

const renderMathChildren = (children) =>
  React.Children.toArray(children).map((child, i) =>
    typeof child === "string" ? (
      <React.Fragment key={i}>{renderMathText(child)}</React.Fragment>
    ) : (
      child
    )
  );

const M = ({ children, block }) =>
  block ? (
    <div className="my-3 overflow-x-auto text-center font-mono text-sm text-amber-200 bg-black/30 rounded-lg px-4 py-3 border border-amber-900/40">
      {renderMathChildren(children)}
    </div>
  ) : (
    <span className="font-mono text-amber-300 text-[0.85em]">{renderMathChildren(children)}</span>
  );

const Def = ({ title, children }) => (
  <div className="border-l-4 border-amber-400 bg-amber-950/40 rounded-r-xl px-4 py-3 my-3">
    <div className="text-amber-400 font-semibold text-xs uppercase tracking-widest mb-1">{title}</div>
    <div className="text-slate-200 text-sm leading-relaxed">{children}</div>
  </div>
);

const Thm = ({ title, children }) => (
  <div className="border-l-4 border-sky-400 bg-sky-950/40 rounded-r-xl px-4 py-3 my-3">
    <div className="text-sky-400 font-semibold text-xs uppercase tracking-widest mb-1">{title}</div>
    <div className="text-slate-200 text-sm leading-relaxed">{children}</div>
  </div>
);

const Insight = ({ children }) => (
  <div className="flex gap-2 bg-emerald-950/40 border border-emerald-700/40 rounded-xl px-4 py-3 my-3">
    <span className="text-emerald-400 text-lg mt-0.5">💡</span>
    <div className="text-emerald-200 text-sm leading-relaxed">{children}</div>
  </div>
);

const Warning = ({ children }) => (
  <div className="flex gap-2 bg-rose-950/40 border border-rose-700/40 rounded-xl px-4 py-3 my-3">
    <span className="text-rose-400 text-lg mt-0.5">⚠️</span>
    <div className="text-rose-200 text-sm leading-relaxed">{children}</div>
  </div>
);

// ── Interactive: Kernel Matrix Builder ───────────────────────────────────────
function KernelBuilder() {
  const [u, setU] = useState([0.707, 0.707]); // orthonormal basis vector
  const [angle, setAngle] = useState(45);

  useEffect(() => {
    const rad = (angle * Math.PI) / 180;
    setU([Math.cos(rad), Math.sin(rad)]);
  }, [angle]);

  // K = u u^T  (rank-1 case: V = span of one unit vector)
  const K = [[u[0] * u[0], u[0] * u[1]], [u[1] * u[0], u[1] * u[1]]];
  const fmt = (x) => x.toFixed(3);

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
      <div className="text-slate-300 text-sm font-semibold mb-3">🔧 Interactive: Kernel of a 1-D Subspace in ℝ²</div>
      <p className="text-slate-400 text-xs mb-4">
        Let V ⊂ ℝ² be the span of a single unit vector <M>u = (cos θ, sin θ)</M>. The kernel is
        K = uuᵀ. Drag the angle θ to see how K changes.
      </p>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Canvas */}
        <svg width="180" height="180" className="flex-shrink-0 bg-slate-950 rounded-xl border border-slate-700">
          <defs>
            <marker id="arrowK" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
            </marker>
            <marker id="arrowK2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#7dd3fc" />
            </marker>
          </defs>
          {/* Axes */}
          <line x1="90" y1="10" x2="90" y2="170" stroke="#334155" strokeWidth="1" />
          <line x1="10" y1="90" x2="170" y2="90" stroke="#334155" strokeWidth="1" />
          {/* u vector */}
          <line x1="90" y1="90"
            x2={90 + u[0] * 65} y2={90 - u[1] * 65}
            stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowK)" />
          {/* k1 = K[:,0] = (u[0]², u[0]u[1]) */}
          <line x1="90" y1="90"
            x2={90 + K[0][0] * 65} y2={90 - K[1][0] * 65}
            stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrowK2)" />
          {/* Span line */}
          <line x1={90 - u[0] * 80} y1={90 + u[1] * 80}
            x2={90 + u[0] * 80} y2={90 - u[1] * 80}
            stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2,4" opacity="0.5" />
          <text x="93" y="18" fill="#f59e0b" fontSize="11">u</text>
          <text x={90 + K[0][0] * 65 + 5} y={90 - K[1][0] * 65} fill="#7dd3fc" fontSize="10">k₁</text>
          <text x="155" y="87" fill="#475569" fontSize="10">x</text>
          <text x="93" y="168" fill="#475569" fontSize="10">y</text>
        </svg>
        {/* Controls + Matrix */}
        <div className="flex-1">
          <div className="mb-3">
            <label className="text-slate-400 text-xs">Angle θ = {angle}°</label>
            <input type="range" min="0" max="360" value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-amber-400 mt-1" />
          </div>
          <div className="font-mono text-xs text-slate-300 mb-2">u = ({fmt(u[0])}, {fmt(u[1])})</div>
          <div className="font-mono text-xs text-amber-200 bg-black/40 rounded-lg p-3 border border-amber-900/30">
            <div className="text-amber-400 mb-1 text-xs">K = uuᵀ =</div>
            <div>⎡ {fmt(K[0][0])}  {fmt(K[0][1])} ⎤</div>
            <div>⎣ {fmt(K[1][0])}  {fmt(K[1][1])} ⎦</div>
          </div>
          <div className="mt-2 font-mono text-xs text-slate-400">
            trace(K) = {fmt(K[0][0] + K[1][1])} &nbsp;| &nbsp;
            det(K) ≈ {fmt(K[0][0] * K[1][1] - K[0][1] * K[1][0])}
          </div>
          <div className="text-slate-500 text-xs mt-2">K is always PSD (eigenvalues ≥ 0, det ≥ 0)</div>
        </div>
      </div>
    </div>
  );
}

// ── Interactive: 2D Inner Product Geometry ──────────────────────────────────
function IPGeometry() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);
  // Q = diag(a, b), inner product <u,v> = v^T Q u
  // K = Q^{-1} = diag(1/a, 1/b)
  // Ellipse: Q-ball {v: v^T Q v = 1}, i.e., a x² + b y² = 1
  // k1 = K e1 = (1/a, 0), k2 = K e2 = (0, 1/b)
  const k1 = [1 / a, 0];
  const k2 = [0, 1 / b];
  const scale = 70;
  const cx = 100, cy = 100;

  // Ellipse semi-axes: rx = 1/sqrt(a), ry = 1/sqrt(b)
  const rx = scale / Math.sqrt(a);
  const ry = scale / Math.sqrt(b);

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
      <div className="text-slate-300 text-sm font-semibold mb-3">🔭 Interactive: Geometry of ⟨u,v⟩ = v⊤Qu</div>
      <p className="text-slate-400 text-xs mb-4">
        With Q = diag(a, b), the unit ball {"{v : ⟨v,v⟩=1}"} is an ellipse. The kernel K = Q⁻¹ = diag(1/a, 1/b).
        Columns k₁, k₂ of K are shown — notice they are the closest points to origin on the lines x=1 and y=1.
      </p>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <svg width="200" height="200" className="flex-shrink-0 bg-slate-950 rounded-xl border border-slate-700">
          <defs>
            <marker id="ak1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
            </marker>
            <marker id="ak2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#4ade80" />
            </marker>
          </defs>
          {/* Axes */}
          <line x1={cx} y1="10" x2={cx} y2="190" stroke="#334155" strokeWidth="1" />
          <line x1="10" y1={cy} x2="190" y2={cy} stroke="#334155" strokeWidth="1" />
          {/* Constraint lines x=1 and y=1 */}
          <line x1={cx + scale} y1="10" x2={cx + scale} y2="190" stroke="#f87171" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />
          <line x1="10" y1={cy - scale} x2="190" y2={cy - scale} stroke="#4ade80" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />
          <text x={cx + scale + 2} y="18" fill="#f87171" fontSize="9">x=1</text>
          <text x="12" y={cy - scale - 3} fill="#4ade80" fontSize="9">y=1</text>
          {/* Ellipse */}
          <ellipse cx={cx} cy={cy} rx={Math.min(rx, 90)} ry={Math.min(ry, 90)} fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="5,3" />
          {/* k1 = (1/a, 0) */}
          {scale / a <= 180 && (
            <line x1={cx} y1={cy} x2={cx + scale / a} y2={cy}
              stroke="#f87171" strokeWidth="2" markerEnd="url(#ak1)" />
          )}
          {/* k2 = (0, 1/b) */}
          {scale / b <= 180 && (
            <line x1={cx} y1={cy} x2={cx} y2={cy - scale / b}
              stroke="#4ade80" strokeWidth="2" markerEnd="url(#ak2)" />
          )}
          <text x={cx + scale / a + 3} y={cy - 4} fill="#f87171" fontSize="11">k₁</text>
          <text x={cx + 4} y={cy - scale / b - 3} fill="#4ade80" fontSize="11">k₂</text>
        </svg>
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-slate-400 text-xs">a = {a.toFixed(1)} (Q₁₁)</label>
            <input type="range" min="0.5" max="6" step="0.1" value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full accent-red-400 mt-1" />
          </div>
          <div>
            <label className="text-slate-400 text-xs">b = {b.toFixed(1)} (Q₂₂)</label>
            <input type="range" min="0.5" max="6" step="0.1" value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-green-400 mt-1" />
          </div>
          <div className="font-mono text-xs bg-black/40 rounded-lg p-3 border border-slate-700">
            <div className="text-slate-400 mb-1">Q = diag({a.toFixed(1)}, {b.toFixed(1)})</div>
            <div className="text-amber-200">K = Q⁻¹ = diag({(1/a).toFixed(3)}, {(1/b).toFixed(3)})</div>
            <div className="text-red-300 mt-1">k₁ = ({(1/a).toFixed(3)}, 0)  ‖k₁‖² = {(1/a).toFixed(3)}</div>
            <div className="text-green-300">k₂ = (0, {(1/b).toFixed(3)})  ‖k₂‖² = {(1/b).toFixed(3)}</div>
          </div>
          <div className="text-slate-500 text-xs">
            Note: K_ii = ‖k_i‖². As a→∞, k₁→0 (V collapses along x-axis direction).
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Interactive: Three Equivalent Definitions Quiz ──────────────────────────
function DefinitionsQuiz() {
  const [revealed, setRevealed] = useState([false, false, false]);
  const toggle = (i) => setRevealed((r) => r.map((v, j) => (j === i ? !v : v)));

  const defs = [
    {
      label: "Definition 1 — Reproducing Property",
      color: "amber",
      summary: "k_i is the unique vector in V satisfying ⟨v, k_i⟩ = eᵢᵀv for all v ∈ V.",
      detail: "This is the analytical definition. It says: the inner product with k_i acts exactly like coordinate extraction. It's used to prove existence and uniqueness via a linear equation argument (Lemma 2.1).",
    },
    {
      label: "Definition 2 — Orthonormal Basis",
      color: "sky",
      summary: "K = u₁u₁ᵀ + u₂u₂ᵀ + ⋯ + uᵣuᵣᵀ where {u₁,...,uᵣ} is an orthonormal basis for V.",
      detail: "This is the constructive definition. It immediately shows K is PSD (since K = UUᵀ ≥ 0). The basis {uᵢ} is not unique, but K is! It's the orthogonal projector onto V.",
    },
    {
      label: "Definition 3 — Gram Matrix",
      color: "emerald",
      summary: "K is such that the kᵢ span V AND ⟨k_j, k_i⟩ = K_ij.",
      detail: "The most algebraically powerful: K is simultaneously the Gram matrix of the kᵢ AND the columns of K span V. This self-referential property — K encodes both the geometry and the spanning set — is the heart of RKHS theory.",
    },
  ];

  const colorMap = {
    amber: { border: "border-amber-400", bg: "bg-amber-950/30", label: "text-amber-400", reveal: "bg-amber-900/20" },
    sky: { border: "border-sky-400", bg: "bg-sky-950/30", label: "text-sky-400", reveal: "bg-sky-900/20" },
    emerald: { border: "border-emerald-400", bg: "bg-emerald-950/30", label: "text-emerald-400", reveal: "bg-emerald-900/20" },
  };

  return (
    <div className="my-4 space-y-3">
      <div className="text-slate-400 text-xs mb-2">Tap each definition card to reveal the key insight:</div>
      {defs.map((d, i) => {
        const c = colorMap[d.color];
        return (
          <div key={i} className={`border-l-4 ${c.border} ${c.bg} rounded-r-xl p-4 cursor-pointer transition-all`}
            onClick={() => toggle(i)}>
            <div className={`${c.label} font-semibold text-xs uppercase tracking-widest mb-1`}>{d.label}</div>
            <div className="text-slate-200 text-sm">{d.summary}</div>
            {revealed[i] && (
              <div className={`mt-3 ${c.reveal} rounded-lg p-3 text-slate-300 text-xs leading-relaxed border border-slate-700/40`}>
                {d.detail}
              </div>
            )}
            <div className={`text-xs mt-2 ${c.label} opacity-60`}>{revealed[i] ? "▲ Collapse" : "▼ Reveal insight"}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Interactive: Cauchy Sequence Visualizer ──────────────────────────────────
function CauchyVisualizer() {
  const [n, setN] = useState(5);
  // Sequence: a_n = 1 - 1/n (converges to 1 from below) — a classic Cauchy seq
  const terms = Array.from({ length: n }, (_, i) => 1 - 1 / (i + 1));
  const isCauchy = true;

  // Also show partial sums of harmonic series (NOT Cauchy in value but let's show a divergent partial sum)
  const [mode, setMode] = useState("cauchy");
  const divergeTerms = Array.from({ length: n }, (_, i) =>
    Array.from({ length: i + 1 }, (_, j) => 1 / (j + 1)).reduce((a, b) => a + b, 0)
  );

  const display = mode === "cauchy" ? terms : divergeTerms;
  const maxVal = Math.max(...display, 1);
  const barH = 90;

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
      <div className="text-slate-300 text-sm font-semibold mb-3">⏩ Interactive: Cauchy Sequences & Completeness</div>
      <div className="flex gap-2 mb-4">
        {[["cauchy", "Convergent: aₙ = 1−1/n"], ["diverge", "Divergent: Σ1/k (harmonic)"]].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${mode === m ? "bg-amber-500/20 border-amber-500 text-amber-300" : "border-slate-600 text-slate-400 hover:border-slate-400"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mb-3">
        <label className="text-slate-400 text-xs">Show first N = {n} terms</label>
        <input type="range" min="3" max="15" value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="w-full accent-amber-400 mt-1" />
      </div>
      <div className="flex items-end gap-1 h-24 mb-2">
        {display.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end">
            <div className="text-slate-500 text-[8px] mb-0.5">{v.toFixed(2)}</div>
            <div
              style={{ height: `${(v / maxVal) * barH}px`, minHeight: 2 }}
              className={`w-full rounded-t transition-all ${mode === "cauchy" ? "bg-amber-500/70" : "bg-rose-500/70"}`} />
          </div>
        ))}
      </div>
      <div className="text-slate-500 text-xs flex justify-between">
        <span>n=1</span><span>n={n}</span>
      </div>
      {mode === "cauchy" ? (
        <div className="mt-3 bg-emerald-950/30 border border-emerald-700/30 rounded-lg p-3 text-xs text-emerald-200">
          ✅ This IS Cauchy: |aₙ − aₘ| = |1/m − 1/n| → 0. Limit = 1. If 1 ∉ V, the sequence "points to a scratch."
        </div>
      ) : (
        <div className="mt-3 bg-rose-950/30 border border-rose-700/30 rounded-lg p-3 text-xs text-rose-200">
          ❌ The harmonic partial sums are NOT Cauchy. Consecutive gaps don't go to zero fast enough — sₙ→∞.
        </div>
      )}
    </div>
  );
}

// ── Interactive: RKHS Definition Checker ──────────────────────────────────────
function RKHSChecker() {
  const spaces = [
    { name: "ℝⁿ with standard ⟨·,·⟩", complete: true, bounded: true, isRKHS: true, reason: "Finite-dimensional → automatically complete and evaluation functionals bounded." },
    { name: "C²[0,1] with L² norm", complete: false, bounded: false, isRKHS: false, reason: "Not complete (square waves not in space). Evaluation functionals unbounded — tent functions show ‖fᵢ‖→0 but fᵢ(½)→∞." },
    { name: "C¹[0,1] with Sobolev norm ‖f‖²=∫f²+∫f'²", complete: false, bounded: true, isRKHS: false, reason: "Evaluation functionals ARE bounded (Example 3.6: max|f(x)| ≤ 2‖f‖). But not complete — its completion H¹[0,1] is the RKHS, with K(t,s)=½e^{−|t−s|}." },
    { name: "Paley-Wiener (bandlimited fns)", complete: true, bounded: true, isRKHS: true, reason: "Complete (Cauchy ↔ Cauchy in Fourier domain) and bounded evaluation. Kernel K(t,τ) = sin(a(t−τ))/(π(t−τ))." },
    { name: "L²[0,1]", complete: true, bounded: false, isRKHS: false, reason: "Complete (it's a Hilbert space) but evaluation functionals are unbounded — elements are equivalence classes, pointwise value is undefined." },
    { name: "H¹[0,1], f(0)=0, ‖f‖²=∫f'²", complete: true, bounded: true, isRKHS: true, reason: "Completion of C¹ with f(0)=0. Kernel K(t,s)=min(t,s) — covariance of Brownian motion!" },
  ];
  const [sel, setSel] = useState(null);

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
      <div className="text-slate-300 text-sm font-semibold mb-3">🧪 Is It a RKHS? — Click to Diagnose</div>
      <div className="text-slate-400 text-xs mb-4">
        A RKHS needs: (1) Hilbert space (complete inner product space) + (2) bounded evaluation functionals lₓ(f) = f(x).
      </div>
      <div className="grid grid-cols-1 gap-2 mb-4">
        {spaces.map((s, i) => (
          <button key={i} onClick={() => setSel(i === sel ? null : i)}
            className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${sel === i ? "border-amber-500 bg-amber-950/40" : "border-slate-700 hover:border-slate-500 bg-slate-800/40"}`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-200">{s.name}</span>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${s.complete ? "bg-sky-900 text-sky-300" : "bg-slate-700 text-slate-400"}`}>
                  {s.complete ? "✓ complete" : "✗ complete"}
                </span>
                <span className={`px-2 py-0.5 rounded-full ${s.isRKHS ? "bg-emerald-900 text-emerald-300" : "bg-rose-900/50 text-rose-400"}`}>
                  {s.isRKHS ? "RKHS ✓" : "not RKHS"}
                </span>
              </div>
            </div>
            {sel === i && (
              <div className="mt-3 text-slate-300 text-xs leading-relaxed bg-slate-900/60 rounded-lg p-3">
                <div className="flex gap-4 mb-2">
                  <span>Complete: <span className={s.complete ? "text-sky-400" : "text-rose-400"}>{s.complete ? "Yes" : "No"}</span></span>
                  <span>Eval bounded: <span className={s.bounded ? "text-sky-400" : "text-rose-400"}>{s.bounded ? "Yes" : "No"}</span></span>
                </div>
                {s.reason}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Knowledge Check Quiz ─────────────────────────────────────────────────────
function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});

  return (
    <div className="my-4 space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
          <div className="text-slate-200 text-sm font-medium mb-3">{qi + 1}. {q.question}</div>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isChecked = checked[qi];
              const isCorrect = oi === q.correct;
              let cls = "border-slate-700 text-slate-300 hover:border-slate-500";
              if (isSelected && !isChecked) cls = "border-amber-500 bg-amber-950/30 text-amber-200";
              if (isChecked && isCorrect) cls = "border-emerald-500 bg-emerald-950/30 text-emerald-200";
              if (isChecked && isSelected && !isCorrect) cls = "border-rose-500 bg-rose-950/30 text-rose-200 line-through opacity-60";
              return (
                <button key={oi}
                  disabled={isChecked}
                  onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className={`w-full text-left px-4 py-2 rounded-xl border text-sm transition-all ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
          {answers[qi] !== undefined && !checked[qi] && (
            <button onClick={() => setChecked((c) => ({ ...c, [qi]: true }))}
              className="mt-3 text-xs px-4 py-1.5 bg-amber-600/20 border border-amber-600/40 text-amber-300 rounded-lg hover:bg-amber-600/30 transition-all">
              Check Answer
            </button>
          )}
          {checked[qi] && (
            <div className={`mt-3 text-xs p-3 rounded-lg leading-relaxed ${answers[qi] === q.correct ? "bg-emerald-950/40 text-emerald-200 border border-emerald-700/30" : "bg-rose-950/40 text-rose-200 border border-rose-700/30"}`}>
              {answers[qi] === q.correct ? "✅ Correct! " : `❌ Not quite. `}{q.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Proof Accordion ──────────────────────────────────────────────────────────
function ProofAccordion({ title, steps }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  return (
    <div className="my-3 border border-slate-700/50 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 bg-slate-800/60 hover:bg-slate-700/40 transition-all flex items-center justify-between">
        <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">📐 {title}</span>
        <span className="text-slate-500 text-xs">{open ? "▲" : "▼ Show proof walk-through"}</span>
      </button>
      {open && (
        <div className="p-4 bg-slate-900/40">
          <div className="flex gap-2 mb-4 flex-wrap">
            {steps.map((s, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`text-xs px-3 py-1 rounded-lg border transition-all ${step === i ? "bg-sky-600/20 border-sky-500 text-sky-300" : "border-slate-600 text-slate-400"}`}>
                Step {i + 1}
              </button>
            ))}
          </div>
          <div className="bg-sky-950/30 border border-sky-700/30 rounded-xl p-4 text-sm text-slate-200 leading-relaxed">
            {steps[step]}
          </div>
          <div className="flex justify-between mt-3">
            <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
              className="text-xs px-3 py-1 border border-slate-600 text-slate-400 rounded-lg disabled:opacity-30 hover:border-slate-400 transition-all">← Prev</button>
            <span className="text-slate-600 text-xs self-center">{step + 1} / {steps.length}</span>
            <button disabled={step === steps.length - 1} onClick={() => setStep(s => s + 1)}
              className="text-xs px-3 py-1 border border-slate-600 text-slate-400 rounded-lg disabled:opacity-30 hover:border-slate-400 transition-all">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chapter 2 Content ─────────────────────────────────────────────────────────
const ch2Sections = [
  {
    id: "2.1", title: "The Kernel of an Inner Product Subspace",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          The central question: given V ⊂ ℝⁿ with an inner product, how do we <em>represent</em> this configuration
          in a way that is (a) one-to-one, (b) respects topology, and (c) has a straightforward inverse?
          Bases fail — there is no canonical choice. RKHS theory's answer: the <strong className="text-amber-300">kernel matrix K</strong>.
        </p>
        <Def title="Definition 2.1 — The Kernel (3 Equivalent Forms)">
          Let V ⊂ ℝⁿ be an inner product space. The kernel K = [k₁ k₂ ⋯ kₙ] ∈ ℝⁿˣⁿ is defined by any of:
          <ol className="mt-2 space-y-2 list-decimal list-inside text-slate-300 text-sm">
            <li><strong className="text-amber-300">Reproducing:</strong> each kᵢ ∈ V satisfies ⟨v, kᵢ⟩ = eᵢᵀv for all v ∈ V</li>
            <li><strong className="text-sky-300">Spectral:</strong> K = u₁u₁ᵀ + ⋯ + uᵣuᵣᵀ (orthonormal basis expansion)</li>
            <li><strong className="text-emerald-300">Gram:</strong> the kᵢ span V and ⟨kⱼ, kᵢ⟩ = Kᵢⱼ</li>
          </ol>
        </Def>
        <DefinitionsQuiz />
        <Insight>
          Definition 2 instantly shows K ≥ 0 (positive semi-definite) since K = UUᵀ. Definition 3 is the most
          powerful algebraically: K is simultaneously the spanning set AND its own Gram matrix.
        </Insight>
        <ProofAccordion title="Proof: Existence & Uniqueness of K (Lemma 2.1)" steps={[
          "We need to find kᵢ ∈ V such that ⟨v, kᵢ⟩ = eᵢᵀv for all v ∈ V. Let {v₁,…,vᵣ} be a basis for V.",
          "By linearity, it suffices to require ⟨vⱼ, kᵢ⟩ = eᵢᵀvⱼ for j = 1,…,r. Define L: V → ℝʳ by L(k) = (⟨v₁,k⟩, …, ⟨vᵣ,k⟩). This is linear and square (domain and range both dim r).",
          "Injectivity: If L(k) = L(k̃), then ⟨v, k−k̃⟩ = 0 for all v ∈ V (since {vⱼ} span V). Setting v = k−k̃ gives ‖k−k̃‖² = 0, so k = k̃.",
          "Since L is square and injective, it is also surjective. Therefore the equation L(kᵢ) = (eᵢᵀv₁, …, eᵢᵀvᵣ) has a unique solution. QED.",
        ]} />
        <div className="mt-4">
          <Thm title="Key Bijection">
            For fixed n: there is a <strong>bijective</strong> correspondence between inner product spaces V ⊂ ℝⁿ
            and PSD matrices K ∈ ℝⁿˣⁿ. Given V there is a unique K; given K ≥ 0 there is a unique V.
          </Thm>
        </div>
        <KernelBuilder />
      </div>
    ),
  },
  {
    id: "2.2", title: "Sequences of Inner Product Spaces",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          We want our representation to <em>respect topology</em>: if (V₁, ⟨·,·⟩₁), (V₂, ⟨·,·⟩₂), … converges
          to (V, ⟨·,·⟩), then their kernel representations should converge too. The kernel representation
          achieves this beautifully.
        </p>
        <Def title="Convergence via Kernels">
          The limit of a sequence of inner product spaces V₁, V₂, … ⊂ ℝⁿ is the space V∞ whose kernel
          is K∞ = limₙ Kₙ (if the limit exists).
        </Def>
        <Insight>
          Since K = u₁u₁ᵀ + ⋯ + uᵣuᵣᵀ, a sequence of r-dimensional spaces can converge to a lower-dimensional
          space if one or more basis vectors → 0. This captures dimension collapse gracefully — orthonormal bases
          cannot do this (they must suddenly "jump").
        </Insight>
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
          <div className="text-slate-300 text-sm font-semibold mb-3">📐 Example 2.4 — Collapsing Inner Product</div>
          <p className="text-slate-400 text-xs mb-3">
            In ℝ², let ⟨u,v⟩ₙ = v⊤ diag(1, n²) u. The n-th inner product has orthonormal basis
            {"{(1,0), (0, 1/n)}"}. The kernel Kₙ = diag(1, n⁻²) → diag(1, 0) = K∞.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 10].map((n) => (
              <div key={n} className="bg-slate-950 rounded-xl p-3 border border-slate-700 text-center">
                <div className="text-slate-400 text-xs mb-2">n = {n}</div>
                <div className="font-mono text-xs text-amber-200">
                  <div>K = diag(</div>
                  <div>  1.000,</div>
                  <div>  {(1 / n / n).toFixed(4)})</div>
                </div>
                <div className="mt-2">
                  <svg width="60" height="60" viewBox="-1.5 -1.5 3 3" className="mx-auto">
                    <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#334155" strokeWidth="0.05" />
                    <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#334155" strokeWidth="0.05" />
                    <ellipse cx="0" cy="0" rx="1" ry={1 / n} fill="none" stroke="#f59e0b" strokeWidth="0.08" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <div className="text-slate-500 text-xs mt-3 text-center">Ellipse collapses to a line segment as n→∞. The 2D space converges to a 1D subspace.</div>
        </div>
        <Warning>
          Unlike RKHS theory, a sequence of positive definite Qₙ becoming singular (eigenvalue→∞) means Qₙ
          has no limit. But Kₙ = Qₙ⁻¹ → K∞ with zero eigenvalues — RKHS theory encompasses degenerate inner products.
        </Warning>
      </div>
    ),
  },
  {
    id: "2.3", title: "Extrinsic Geometry and Interpolation",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          Working with V ⊂ ℝⁿ (not an abstract V) gives us <em>extrinsic coordinates</em>. The orientation
          of V inside ℝⁿ matters. This enables solving the interpolation problem elegantly.
        </p>
        <Def title="Single-Point Interpolation Problem">
          Find x ∈ V ⊂ ℝⁿ of smallest norm such that eᵢᵀx = 1 for a fixed i.
        </Def>
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
          <div className="text-slate-300 text-sm font-semibold mb-3">✏️ Example 2.6 — Kernel Solves Interpolation</div>
          <div className="space-y-3 text-sm text-slate-300">
            <p>Write x = Kα. The constraints are:</p>
            <M block>eᵢᵀx = 1  ⟹  kᵢᵀα = 1</M>
            <M block>⟨x, v⟩ = 0 for all v with eᵢᵀv = 0  ⟹  α = ceᵢ</M>
            <p>Substituting: kᵢᵀ(ceᵢ) = 1 ⟹ cKᵢᵢ = 1 ⟹ c = 1/Kᵢᵢ. Therefore:</p>
            <M block>x = Kᵢᵢ⁻¹ kᵢ</M>
            <p className="text-emerald-300">The solution is always the i-th column of K, scaled! As V changes, K changes, but x = Kᵢᵢ⁻¹ kᵢ always.</p>
          </div>
        </div>
        <Thm title="Geometric Interpretation (Lemma 2.8)">
          kᵢ is the closest point in V to the origin on the hyperplane {"{z : eᵢᵀz = 1}"}, scaled so that
          ⟨kᵢ, kᵢ⟩ = eᵢᵀkᵢ = Kᵢᵢ. In other words, kᵢ is the gradient of the i-th coordinate functional.
        </Thm>
        <Insight>
          This geometric picture is key: kᵢ is always perpendicular to the level set {"{v : eᵢᵀv = const}"}. This
          is exactly the optimality condition for the interpolation problem — no ad hoc basis needed.
        </Insight>
        <Quiz questions={[
          {
            question: "Why does kᵢ = 0 when Kᵢᵢ = 0?",
            options: [
              "Because the i-th column of K has no information",
              "Because every vector v ∈ V has eᵢᵀv = 0, so the constraint eᵢᵀx = 1 has no solution",
              "Because the inner product is degenerate",
              "Because K is not invertible"
            ],
            correct: 1,
            explanation: "Kᵢᵢ = ⟨kᵢ, kᵢ⟩ = eᵢᵀkᵢ. If Kᵢᵢ = 0 then kᵢ has zero i-th coordinate. Since kᵢ ∈ V, every vector v = Kα ∈ V has eᵢᵀv = 0 — the i-th coordinate is always zero in V, so interpolating to value 1 is impossible.",
          },
        ]} />
      </div>
    ),
  },
  {
    id: "2.4", title: "Visualising RKHSs",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          The ellipse {"{v ∈ V : ⟨v,v⟩ = 1}"} uniquely encodes the inner product. The columns k₁, k₂ of K
          vary <em>continuously and smoothly</em> as the inner product changes — unlike orthonormal bases.
        </p>
        <IPGeometry />
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
          <div className="text-slate-300 text-sm font-semibold mb-3">🔄 Why kᵢ are better than orthonormal bases</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-rose-950/30 border border-rose-700/30 rounded-xl p-3">
              <div className="text-rose-300 font-semibold mb-2">Orthonormal basis {"{u₁, u₂}"}</div>
              <p className="text-slate-300">After rotating the ellipse 180°, it returns to original shape. But {"{e₁, ½e₂}"} rotated 180° gives {"{−e₁, −½e₂}"} — a discontinuous jump.</p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-700/30 rounded-xl p-3">
              <div className="text-emerald-300 font-semibold mb-2">Kernel columns {"{k₁, k₂}"}</div>
              <p className="text-slate-300">k₁ and k₂ vary smoothly and continuously as the ellipse rotates. No discontinuity — they encode orientation in ℝⁿ, not just the abstract subspace.</p>
            </div>
          </div>
        </div>
        <Insight>
          For 1-D subspaces of ℝ², k₁ and k₂ must be linearly dependent (both span V). Together they describe V,
          its inner product, AND its orientation in ℝ². An orthonormal basis {"{u}"} only describes V and the norm, not orientation.
        </Insight>
      </div>
    ),
  },
  {
    id: "2.5", title: "RKHSs over the Complex Field",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          RKHS theory extends to complex vector spaces V ⊂ ℂⁿ with minimal changes.
        </p>
        <Def title="Complex Kernel">
          The only change: replace K = u₁u₁ᵀ + ⋯ + uᵣuᵣᵀ with K = u₁u₁ᴴ + ⋯ + uᵣuᵣᴴ (Hermitian transpose).
          K is always Hermitian (K = Kᴴ) and PSD.
        </Def>
        <Warning>
          In complex inner products, ⟨u, v⟩ = ⟨v, u⟩* (conjugate). Swapping order introduces conjugation.
          This forces K to be Hermitian rather than symmetric.
        </Warning>
        <Insight>
          The Bergman space (Example 4.4 in Ch.4) is a complex RKHS with kernel K(z,w) = 1/(π(1−zw̄)²) on the unit disk.
          Complex RKHSs are especially natural for analytic function spaces.
        </Insight>
        <Quiz questions={[
          {
            question: "In a complex RKHS, if K(x,y) = 3+2i, what is K(y,x)?",
            options: ["3+2i", "3−2i", "−3−2i", "Cannot determine"],
            correct: 1,
            explanation: "K is Hermitian: K(x,y) = K(y,x)*. So K(y,x) = (3+2i)* = 3−2i.",
          },
        ]} />
      </div>
    ),
  },
];

// ── Chapter 4 Content ─────────────────────────────────────────────────────────
const ch4Sections = [
  {
    id: "4.1", title: "Completions and Hilbert Spaces",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          In infinite dimensions, a subspace V ⊂ W may be <em>not closed</em>: limit points of sequences in V
          might not be in V. The completion V̂ fills all such "scratches" — it is the unique maximal space
          obtained by adding all these missing limits.
        </p>
        <Def title="Cauchy Sequence">
          A sequence vₙ in a normed space is Cauchy if: ∀ε &gt; 0, ∃N such that ‖vₙ − vₘ‖ &lt; ε whenever n,m ≥ N.
          Every convergent sequence is Cauchy. If a Cauchy sequence in V doesn't converge, it "points to a scratch."
        </Def>
        <CauchyVisualizer />
        <Def title="Hilbert Space">
          An inner product space that is complete with respect to its norm (every Cauchy sequence converges
          to a point in the space) is called a Hilbert space.
        </Def>
        <ProofAccordion title="Why completeness matters for existence proofs" steps={[
          "Goal: prove a solution f to a differential equation exists, without exhibiting it explicitly.",
          "Construct approximate solutions fₙ (e.g., by decreasing numerical step size). Cannot prove fₙ→f directly since f is unknown.",
          "Instead, prove {fₙ} is a Cauchy sequence. This requires only controlling ‖fₙ − fₘ‖, not the limit.",
          "By completeness, the Cauchy sequence converges to some f̃ in the space.",
          "Verify f̃ satisfies the equation (usually by a limit argument). Done! f = f̃ exists.",
        ]} />
        <Insight>
          The completion removes the 'scratches': If V ⊂ W is not closed, there are dents in V's surface
          (sequences heading towards points just outside V). The completion V̂ fills all such dents uniquely —
          no matter how you embed V in a larger space W, you can't re-introduce those same scratches.
        </Insight>
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
          <div className="text-slate-300 text-sm font-semibold mb-3">📚 Key Examples of Complete/Incomplete Spaces</div>
          <div className="space-y-2 text-xs">
            {[
              { name: "ℝⁿ", complete: true, note: "Finite dimension → always complete" },
              { name: "l²", complete: true, note: "Pointwise Cauchy → convergent; ‖f‖² = Σfᵢ² < ∞" },
              { name: "C²[0,1] with L² norm", complete: false, note: "Sequences of continuous fns can converge to square waves ∉ C²" },
              { name: "V = {sequences with finitely many non-zero terms}", complete: false, note: "f=(1,½,¼,…) is in l² but not in V; sequences in V converge to it" },
              { name: "L²[0,1] (completion of C²)", complete: true, note: "The 'right' space — but elements are equivalence classes, not pointwise functions" },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${s.complete ? "bg-emerald-950/30 border border-emerald-800/30" : "bg-rose-950/30 border border-rose-800/30"}`}>
                <span className={s.complete ? "text-emerald-400" : "text-rose-400"}>{s.complete ? "✓" : "✗"}</span>
                <span className="text-slate-200 font-mono">{s.name}</span>
                <span className="text-slate-400 flex-1">{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "4.2", title: "Definition of a RKHS",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          Armed with completeness and evaluation functionals, we can state the full RKHS definition.
          The insight: in finite dimensions, evaluation functionals lₓ(f) = f(x) = eᵢᵀf are always bounded.
          In infinite dimensions, this must be imposed as an explicit requirement.
        </p>
        <Def title="Definition 4.1 — Reproducing Kernel Hilbert Space">
          Let X be an arbitrary set. A subspace V ⊂ ℝˣ (space of all real functions on X) with an inner product
          is a <strong className="text-amber-300">RKHS</strong> if:
          <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-300">
            <li><strong className="text-sky-300">V is complete</strong> (V is a Hilbert space)</li>
            <li><strong className="text-emerald-300">Bounded evaluation:</strong> for every x ∈ X, the map f ↦ f(x) is bounded — i.e., ∃ cₓ such that |f(x)| ≤ cₓ‖f‖ for all f ∈ V</li>
          </ol>
        </Def>
        <Def title="Definition 4.2 — The Kernel Function">
          If V ⊂ ℝˣ is a RKHS, its kernel is the function K: X × X → ℝ satisfying:
          <M block>⟨f, K(·,y)⟩ = f(y)  for all f ∈ V, y ∈ X</M>
          Here K(·,y) is the function x ↦ K(x,y) and is itself an element of V.
        </Def>
        <Insight>
          The Riesz representation theorem guarantees K(·,y) exists: any bounded linear functional on a Hilbert space
          is representable as an inner product with some fixed element. Bounded evaluation → ∃K(·,y) ∈ V such that ⟨f, K(·,y)⟩ = f(y).
        </Insight>
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
          <div className="text-slate-300 text-sm font-semibold mb-3">🔗 Finite vs Infinite: The Connection</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700">
              <div className="text-amber-300 font-semibold mb-2">Finite (Def 2.1)</div>
              <div className="text-slate-300 space-y-1">
                <div>X = {"{1,…,n}"}, V ⊂ ℝⁿ</div>
                <div>kᵢ ∈ V with ⟨v, kᵢ⟩ = eᵢᵀv</div>
                <div>K ∈ ℝⁿˣⁿ, K(i,j) = Kᵢⱼ</div>
                <div>Complete: auto (finite-dim)</div>
                <div>Bounded: auto (finite-dim)</div>
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700">
              <div className="text-sky-300 font-semibold mb-2">Infinite (Def 4.1-4.2)</div>
              <div className="text-slate-300 space-y-1">
                <div>X arbitrary, V ⊂ ℝˣ</div>
                <div>K(·,y) ∈ V with ⟨f, K(·,y)⟩ = f(y)</div>
                <div>K: X×X → ℝ</div>
                <div>Complete: <span className="text-rose-300">must impose</span></div>
                <div>Bounded eval: <span className="text-rose-300">must impose</span></div>
              </div>
            </div>
          </div>
        </div>
        <RKHSChecker />
        <Quiz questions={[
          {
            question: "Why does L²[0,1] fail to be a RKHS despite being a Hilbert space?",
            options: [
              "Its kernel function doesn't exist",
              "Evaluation functionals f ↦ f(x) are unbounded — elements are equivalence classes, pointwise value is undefined",
              "It's not a function space",
              "The inner product doesn't satisfy symmetry"
            ],
            correct: 1,
            explanation: "L² elements are equivalence classes of functions that can differ on sets of measure zero. So f(x) is not well-defined for a particular x — you can change f at any single point without changing the L² equivalence class. This means lₓ is not just unbounded but literally undefined.",
          },
          {
            question: "What does 'bounded evaluation functional' at x mean geometrically?",
            options: [
              "f(x) is always between -1 and 1",
              "If fn → 0 in norm, then fn(x) → 0 pointwise",
              "The function f is bounded on X",
              "The kernel K(x,x) is finite"
            ],
            correct: 1,
            explanation: "Bounded means |lₓ(f)| = |f(x)| ≤ cₓ‖f‖. So if ‖fn‖ → 0 (norm convergence), then |fn(x)| ≤ cₓ‖fn‖ → 0. Norm convergence implies pointwise convergence — a key RKHS property.",
          },
        ]} />
      </div>
    ),
  },
  {
    id: "4.3", title: "Examples of RKHSs",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          Three canonical examples, each showing how the abstract definition manifests concretely.
        </p>
        {[
          {
            label: "Example 4.2 — Paley-Wiener Space (Bandlimited Functions)",
            color: "amber",
            body: <>
              <p className="text-slate-300 text-sm mb-2">V = bandlimited functions f: ℝ→ℝ with bandwidth a (Fourier support in [−a, a]).</p>
              <M block>⟨f, g⟩ = ∫₋∞^∞ f(t)g(t) dt</M>
              <M block>K(t, τ) = sin(a(t−τ)) / (π(t−τ))</M>
              <p className="text-slate-400 text-xs">This is the sinc kernel. Verify: ⟨f, K(·,τ)⟩ = f(τ) follows from Fourier inversion. Completeness follows since Cauchy in V ↔ Cauchy in Fourier domain (L² is complete).</p>
            </>,
          },
          {
            label: "Example 4.3 — Sobolev Space H¹₀ (Brownian Motion Kernel)",
            color: "sky",
            body: <>
              <p className="text-slate-300 text-sm mb-2">V = absolutely continuous f: [0,1]→ℝ with f(0)=0 and f' ∈ L².</p>
              <M block>⟨f, g⟩ = ∫₀¹ f'(t)g'(t) dt</M>
              <M block>K(t, s) = min(t, s)</M>
              <p className="text-slate-400 text-xs">Verify: if g(t) = K(t,s) = min(t,s), then g'(t) = 1 for t &lt; s, 0 for t &gt; s. So ⟨f, K(·,s)⟩ = ∫₀ˢ f'(t) dt = f(s)−f(0) = f(s). ✓</p>
              <p className="text-slate-400 text-xs mt-1">🎯 K(t,s) = min(t,s) is also the covariance function of a Wiener process (Brownian motion)!</p>
            </>,
          },
          {
            label: "Example 4.4 — Bergman Space (Complex Analytic Functions)",
            color: "emerald",
            body: <>
              <p className="text-slate-300 text-sm mb-2">V = analytic, square-integrable functions on the unit disk S = {"{|z| < 1}"} ⊂ ℂ.</p>
              <M block>⟨f, g⟩ = ∫_S f(z)g(z) dz</M>
              <M block>K(z, w) = 1 / (π(1 − zw̄)²)</M>
              <p className="text-slate-400 text-xs">A complex RKHS. The Bergman kernel arises from the orthogonal projection onto analytic functions. For other domains the kernel generally can't be expressed in closed form.</p>
            </>,
          },
        ].map((ex, i) => {
          const colorMap = {
            amber: "border-amber-500 bg-amber-950/30 text-amber-400",
            sky: "border-sky-500 bg-sky-950/30 text-sky-400",
            emerald: "border-emerald-500 bg-emerald-950/30 text-emerald-400",
          };
          return (
            <div key={i} className={`border-l-4 rounded-r-xl px-4 py-4 my-3 ${colorMap[ex.color]}`}>
              <div className="font-semibold text-xs uppercase tracking-widest mb-2">{ex.label}</div>
              {ex.body}
            </div>
          );
        })}
      </div>
    ),
  },
  {
    id: "4.4", title: "Basic Properties",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          The fundamental theorem: RKHSs are in bijective correspondence with positive semi-definite functions.
        </p>
        <Thm title="Fundamental Theorem">
          A symmetric function K: X×X → ℝ is positive semi-definite iff it is the kernel of a unique RKHS V ⊂ ℝˣ.
          <M block>∀r ≥ 1, ∀c₁,…,cᵣ ∈ ℝ, ∀x₁,…,xᵣ ∈ X:  Σᵢ Σⱼ cᵢcⱼ K(xᵢ,xⱼ) ≥ 0</M>
        </Thm>
        <Insight>
          This means you can design a RKHS by designing a PSD kernel! Any PSD function K gives you a legitimate
          RKHS. This is why kernel methods in ML are so powerful — K encodes the geometry and function space.
        </Insight>
        <Def title="Three Notions of Convergence in a RKHS">
          <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-300 text-sm">
            <li><strong className="text-amber-300">Strong:</strong> ‖fₙ−f‖ → 0 (norm convergence)</li>
            <li><strong className="text-sky-300">Weak:</strong> ⟨fₙ,g⟩ → ⟨f,g⟩ for all g ∈ V</li>
            <li><strong className="text-emerald-300">Pointwise:</strong> fₙ(x) → f(x) for all x ∈ X</li>
          </ol>
          In a RKHS: <strong>strong ⟹ pointwise</strong> and <strong>weak ⟹ pointwise</strong>.
          (In general Hilbert spaces, pointwise convergence is unrelated to weak/strong.)
        </Def>
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
          <div className="text-slate-300 text-sm font-semibold mb-3">🏗️ Dense Subspace V₀</div>
          <p className="text-slate-400 text-xs leading-relaxed">
            V₀ = span{"{K(·,y) : y ∈ X}"} is dense in V. Any f ∈ V can be approximated arbitrarily well by
            finite sums Σ αᵢ K(·,yᵢ). This is the kernel trick in action — representing functions by their evaluations.
          </p>
          <M block>f ≈ Σᵢ αᵢ K(·,yᵢ)  (finite sum, in norm)</M>
        </div>
        <Quiz questions={[
          {
            question: "K(x,y) = hK(·,x), K(·,y)i. So K is...",
            options: [
              "The Gram matrix of {K(·,y)} — not symmetric in general",
              "Always symmetric: K(x,y) = K(y,x), shown by symmetry of inner product",
              "Positive definite (not just semi-definite)",
              "Independent of the choice of inner product"
            ],
            correct: 1,
            explanation: "From ⟨K(·,x), K(·,y)⟩ = K(y,x) (plug f=K(·,x) into the reproducing property at point y). By symmetry of the inner product: K(x,y) = ⟨K(·,y),K(·,x)⟩ = ⟨K(·,x),K(·,y)⟩ = K(y,x).",
          },
        ]} />
      </div>
    ),
  },
  {
    id: "4.5", title: "Completing a Function Space",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          If V₀ ⊂ ℝˣ is an inner product space that isn't complete, can its completion be a RKHS (a function
          space on X)? Almost — but there's a subtle condition.
        </p>
        <Thm title="Proposition 4.1 — RKHS Completion Criterion">
          V₀ ⊂ ℝˣ has a RKHS completion V (with V₀ ⊂ V ⊂ ℝˣ) if and only if:
          <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-200">
            <li>Evaluation functionals on V₀ are bounded</li>
            <li>If fₙ ∈ V₀ is Cauchy and converges pointwise to 0, then ‖fₙ‖ → 0</li>
          </ol>
        </Thm>
        <Warning>
          Condition 2 can fail! The Blaschke product example: a sequence of polynomials fₙ → f pointwise on
          a set X (where f vanishes on X) but ‖fₙ‖ ↛ 0. The issue: X didn't have enough points to distinguish
          the strong limit from zero. Fix: enlarge X to include limit points.
        </Warning>
        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 my-4">
          <div className="text-slate-300 text-sm font-semibold mb-3">🔧 Construction When Completion Exists</div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-2">
            <p>Assume V₀ ⊂ ℝˣ meets both conditions. The RKHS completion V consists of:</p>
            <M block>V = {"{f : X→ℝ | f = lim fₙ pointwise, for Cauchy {fₙ} ⊂ V₀}"}</M>
            <p>The norm on V is defined by ‖f‖ = limₙ ‖fₙ‖. Condition 2 ensures this is well-defined (different Cauchy sequences converging pointwise to f give the same norm).</p>
            <p className="text-emerald-300">Key fact: in a RKHS, strong convergence ↔ pointwise convergence for Cauchy sequences in V₀, so the completion can be "read off" pointwise.</p>
          </div>
        </div>
        <ProofAccordion title="Proof Sketch: Why the construction works" steps={[
          "Given: V₀ ⊂ ℝˣ with bounded evaluations and Condition 2. Let {fₙ} ⊂ V₀ be Cauchy.",
          "Bounded evaluations ⟹ fₙ(x) is Cauchy in ℝ for each x ∈ X. Since ℝ is complete, f(x) = limₙ fₙ(x) exists. Define V = {all such pointwise limits}.",
          "Define ‖f‖ = limₙ ‖fₙ‖ where {fₙ} is any Cauchy sequence with pointwise limit f. Condition 2 ensures this is independent of choice of {fₙ}.",
          "Verify: the parallelogram law holds (so ‖·‖ comes from an inner product). V is complete by construction.",
          "Verify the completion property: any Cauchy sequence in V₀ converges strongly (not just pointwise) to its pointwise limit — using ‖f − fₙ‖ = limₘ ‖fₘ − fₙ‖ → 0.",
        ]} />
      </div>
    ),
  },
  {
    id: "4.6", title: "Joint Properties of a RKHS and its Kernel",
    content: () => (
      <div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          The correspondence V ↔ K translates properties of V into properties of K, and vice versa.
          Four important joint properties:
        </p>
        {[
          {
            title: "4.6.1 — Continuity",
            content: <>
              <p className="text-sm text-slate-300 mb-2">If X is a metric space, all elements of V are continuous iff:</p>
              <ol className="text-sm text-slate-300 list-decimal list-inside space-y-1">
                <li>x ↦ K(x,y) is continuous for all y ∈ X</li>
                <li>For every x, K(y,y) is bounded in a ball around x</li>
              </ol>
              <div className="mt-2 text-xs text-slate-400">Condition 2 prevents K(·,xₙ) from growing without bound, which by Banach-Steinhaus would force some g ∈ V to be discontinuous.</div>
            </>,
          },
          {
            title: "4.6.2 — Invertibility of Gram Matrices",
            content: <>
              <p className="text-sm text-slate-300 mb-2">
                For any x₁,…,xᵣ ∈ X, the matrix Aᵢⱼ = K(xᵢ,xⱼ) is PSD. It is non-singular iff
                Σcᵢ K(·,xᵢ) = 0 ⟹ c₁=⋯=cᵣ=0. This holds whenever V is "rich enough."
              </p>
              <M block>Σᵢ cᵢ K(·,xᵢ) = 0  ⟺  Σᵢ cᵢ f(xᵢ) = 0  for all f ∈ V</M>
              <div className="text-xs text-slate-400">E.g., Bergman kernel (4.2): the RKHS contains all polynomials, so no non-trivial linear dependence among {"{K(·,xᵢ)}"} — all Gram matrices are non-singular.</div>
            </>,
          },
          {
            title: "4.6.3 — Restriction of the Index Set",
            content: <>
              <p className="text-sm text-slate-300 mb-2">
                If V is a RKHS on X and X' ⊂ X, restrict V to V' = {"{f|_{X'} : f ∈ V}"}. The kernel of V' is
                K'(x,y) = K(x,y) for x,y ∈ X'. The norm on V' is:
              </p>
              <M block>‖f'‖_&#123;V'&#125; = inf{"{‖g‖_V : g ∈ V, g|_{X'} = f'}"}</M>
              <div className="text-xs text-slate-400">This is the "smallest-norm extension" norm — consistent with K(·,x) solving the one-point interpolation problem.</div>
            </>,
          },
          {
            title: "4.6.4 — Sums of Kernels",
            content: <>
              <p className="text-sm text-slate-300 mb-2">
                If K₁ and K₂ are kernels on X with RKHSs V₁ and V₂, then K = K₁ + K₂ is a kernel with RKHS:
              </p>
              <M block>V = V₁ ⊕ V₂ = {"{f₁ + f₂ : f₁ ∈ V₁, f₂ ∈ V₂}"}</M>
              <div className="text-xs text-slate-400">This is the direct sum of function spaces. The norm is ‖f₁+f₂‖² = min_&#123;f₁+f₂=f&#125; (‖f₁‖²+‖f₂‖²). Kernel addition = RKHS direct sum.</div>
            </>,
          },
        ].map((item, i) => (
          <div key={i} className="border border-slate-700/50 rounded-xl p-4 my-3 bg-slate-900/40">
            <div className="text-amber-300 font-semibold text-sm mb-2">{item.title}</div>
            {item.content}
          </div>
        ))}
        <Insight>
          The sum-of-kernels property is foundational for multiple kernel learning and Gaussian processes with
          composite covariance functions. Each kernel adds a "component" to the function space.
        </Insight>
      </div>
    ),
  },
];

// ── Main App ──────────────────────────────────────────────────────────────────
function RKHSTutorial() {
  const [chapter, setChapter] = useState(2);
  const [sectionIdx, setSectionIdx] = useState(0);
  const sections = chapter === 2 ? ch2Sections : ch4Sections;
  const active = sections[sectionIdx];
  const contentRef = useRef(null);

  useEffect(() => {
    setSectionIdx(0);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [chapter]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [sectionIdx]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100"
      style={{ fontFamily: "'Georgia', serif", background: "radial-gradient(ellipse at 20% 20%, #0f172a 0%, #020617 60%, #0a0a1a 100%)" }}>
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Interactive Tutorial</div>
              <h1 className="text-lg font-bold text-slate-100" style={{ fontFamily: "'Georgia', serif" }}>
                A Primer on Reproducing Kernel Hilbert Spaces
              </h1>
            </div>
            {/* Chapter Selector */}
            <div className="flex gap-2">
              {[2, 4].map((ch) => (
                <button key={ch} onClick={() => setChapter(ch)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${chapter === ch
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-900/20"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"}`}>
                  Chapter {ch}
                  <div className="text-xs font-normal opacity-70">{ch === 2 ? "Finite-dim" : "Infinite-dim"}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-1">
            <div className="text-slate-500 text-xs uppercase tracking-widest mb-3 px-2">
              Chapter {chapter}: {chapter === 2 ? "Finite-dimensional RKHSs" : "Infinite-dimensional RKHSs"}
            </div>
            {sections.map((s, i) => (
              <button key={s.id} onClick={() => setSectionIdx(i)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all leading-tight ${sectionIdx === i
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
                <span className="font-mono text-[10px] opacity-60 mr-1">{s.id}</span>
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0" ref={contentRef}>
          {/* Mobile section selector */}
          <div className="md:hidden mb-4">
            <select value={sectionIdx} onChange={(e) => setSectionIdx(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm">
              {sections.map((s, i) => <option key={s.id} value={i}>§{s.id} — {s.title}</option>)}
            </select>
          </div>

          {/* Section header */}
          <div className="mb-6">
            <div className="text-amber-500/60 text-xs font-mono uppercase tracking-widest mb-1">§{active.id}</div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1" style={{ fontFamily: "'Georgia', serif" }}>
              {active.title}
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent rounded-full" />
          </div>

          {/* Section content */}
          <div className="prose-slate">
            {active.content()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
            <button disabled={sectionIdx === 0} onClick={() => setSectionIdx(s => s - 1)}
              className="text-sm px-4 py-2 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-30 transition-all">
              ← §{sections[Math.max(0, sectionIdx - 1)].id}
            </button>
            <div className="text-slate-600 text-xs self-center">{sectionIdx + 1} / {sections.length}</div>
            <button disabled={sectionIdx === sections.length - 1} onClick={() => setSectionIdx(s => s + 1)}
              className="text-sm px-4 py-2 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-30 transition-all">
              §{sections[Math.min(sections.length - 1, sectionIdx + 1)].id} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.RKHSTutorial = RKHSTutorial;
