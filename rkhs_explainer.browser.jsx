const { useState } = React;

const SECTIONS = [
  { id: "intro", label: "① The Big Picture", icon: "◈" },
  { id: "kernels", label: "② What is a Kernel?", icon: "⟨·,·⟩" },
  { id: "pd", label: "③ Positive Definiteness", icon: "≥0" },
  { id: "rkhs", label: "④ The RKHS", icon: "ℋ" },
  { id: "repr", label: "⑤ Reproducing Property", icon: "δ" },
  { id: "apps", label: "⑥ Applications", icon: "∑" },
];

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

const renderTexChildren = (children) =>
  React.Children.toArray(children).map((child, i) =>
    typeof child === "string" ? (
      <React.Fragment key={i}>{renderMathText(child)}</React.Fragment>
    ) : (
      child
    )
  );

const Tex = ({ children, block }) =>
  block ? (
    <div style={{
      fontFamily: "'Georgia', serif",
      fontSize: "1.05rem",
      letterSpacing: "0.02em",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: "3px solid #7dd3fc",
      padding: "12px 18px",
      borderRadius: "6px",
      margin: "12px 0",
      color: "#e0f2fe",
      overflowX: "auto"
    }}>{renderTexChildren(children)}</div>
  ) : (
    <span style={{
      fontFamily: "'Georgia', serif",
      color: "#bae6fd",
      padding: "0 2px"
    }}>{renderTexChildren(children)}</span>
  );

const Callout = ({ type, children }) => {
  const styles = {
    insight: { border: "1px solid #34d399", background: "rgba(52,211,153,0.07)", color: "#a7f3d0", accent: "#34d399", label: "Key Insight" },
    warning: { border: "1px solid #fbbf24", background: "rgba(251,191,36,0.07)", color: "#fde68a", accent: "#fbbf24", label: "Watch Out" },
    def: { border: "1px solid #a78bfa", background: "rgba(167,139,250,0.07)", color: "#ddd6fe", accent: "#a78bfa", label: "Definition" },
    theorem: { border: "1px solid #f472b6", background: "rgba(244,114,182,0.07)", color: "#fbcfe8", accent: "#f472b6", label: "Theorem" },
  };
  const s = styles[type] || styles.insight;
  return (
    <div style={{ border: s.border, background: s.background, borderRadius: "8px", padding: "14px 18px", margin: "16px 0" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: s.accent, marginBottom: "6px" }}>{s.label}</div>
      <div style={{ color: s.color, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
};

const Tag = ({ children }) => (
  <span style={{ background: "rgba(125,211,252,0.12)", border: "1px solid rgba(125,211,252,0.25)", color: "#7dd3fc", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontFamily: "monospace" }}>{children}</span>
);

// Interactive Kernel Matrix Visualizer
function KernelMatrixViz() {
  const [kernelType, setKernelType] = useState("rbf");
  const [sigma, setSigma] = useState(1.0);
  const [degree, setDegree] = useState(2);
  const n = 8;

  const points = Array.from({ length: n }, (_, i) => (i - n / 2 + 0.5) * 0.8);

  const computeK = (x, y) => {
    if (kernelType === "rbf") return Math.exp(-Math.pow(x - y, 2) / (2 * sigma * sigma));
    if (kernelType === "poly") return Math.pow(x * y + 1, degree);
    if (kernelType === "linear") return x * y;
    return 0;
  };

  const matrix = points.map(x => points.map(y => computeK(x, y)));
  const maxVal = Math.max(...matrix.flat().map(Math.abs));

  const getColor = (val) => {
    const t = (val / maxVal + 1) / 2;
    if (t > 0.5) {
      const s = (t - 0.5) * 2;
      return `rgb(${Math.round(30 + s * 100)}, ${Math.round(80 + s * 160)}, ${Math.round(200 + s * 55)})`;
    } else {
      const s = t * 2;
      return `rgb(${Math.round(180 - s * 150)}, ${Math.round(40 + s * 40)}, ${Math.round(40 + s * 20)})`;
    }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontWeight: 700, color: "#7dd3fc", marginBottom: "14px", fontSize: "0.95rem" }}>⬡ Interactive Gram Matrix K[i,j] = k(xᵢ, xⱼ)</div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["rbf", "poly", "linear"].map(k => (
          <button key={k} onClick={() => setKernelType(k)} style={{
            padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: "0.85rem",
            background: kernelType === k ? "#7dd3fc" : "rgba(255,255,255,0.06)",
            color: kernelType === k ? "#0c1a2e" : "#94a3b8",
            fontWeight: kernelType === k ? 700 : 400,
          }}>
            {k === "rbf" ? "Gaussian RBF" : k === "poly" ? "Polynomial" : "Linear"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 36px)`, gap: "2px" }}>
            {matrix.map((row, i) =>
              row.map((val, j) => (
                <div key={`${i}-${j}`} title={`k(x${i},x${j}) = ${val.toFixed(3)}`} style={{
                  width: 36, height: 36, borderRadius: "4px", background: getColor(val),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", cursor: "default"
                }}>{val.toFixed(1)}</div>
              ))
            )}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "8px", textAlign: "center" }}>Hover cells to see values</div>
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          {kernelType === "rbf" && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "8px" }}>σ (bandwidth) = {sigma.toFixed(1)}</div>
              <input type="range" min="0.2" max="3" step="0.1" value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: "100%", accentColor: "#7dd3fc" }} />
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "8px", lineHeight: 1.6 }}>
                Large σ → smoother, broader similarity.<br />
                Small σ → only nearby points similar.
              </div>
            </div>
          )}
          {kernelType === "poly" && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "8px" }}>Degree m = {degree}</div>
              <input type="range" min="1" max="5" step="1" value={degree} onChange={e => setDegree(+e.target.value)} style={{ width: "100%", accentColor: "#7dd3fc" }} />
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "8px", lineHeight: 1.6 }}>
                k(x,x') = (⟨x,x'⟩ + 1)ᵐ<br />
                Captures all monomial features up to degree m.
              </div>
            </div>
          )}
          {kernelType === "linear" && (
            <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.7 }}>
              k(x,x') = x·x'<br /><br />
              The simplest kernel — just the standard dot product. Corresponds to the identity feature map φ(x) = x.
            </div>
          )}

          <div style={{ marginTop: "16px", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.72rem", color: "#7dd3fc", fontWeight: 700, marginBottom: "4px" }}>Positive definiteness check</div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              All eigenvalues of K are ≥ 0 ✓<br />
              (This is what PD means for a matrix)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reproducing property visualizer
function ReproducingViz() {
  const [xStar, setXStar] = useState(0.3);
  const [sigma] = useState(0.4);
  const width = 340, height = 160;
  const domain = [-2, 2];

  const toSvgX = x => ((x - domain[0]) / (domain[1] - domain[0])) * width;
  const toSvgY = y => height / 2 - y * 60;

  // Sample function f as sum of kernels
  const alphas = [0.8, -0.5, 0.6, -0.3];
  const centers = [-1.2, -0.3, 0.6, 1.4];
  const k = (x, c) => Math.exp(-Math.pow(x - c, 2) / (2 * sigma * sigma));
  const f = x => alphas.reduce((s, a, i) => s + a * k(x, centers[i]), 0);
  const kStar = x => k(x, xStar);

  const pts = n => Array.from({ length: n }, (_, i) => domain[0] + (i / (n - 1)) * (domain[1] - domain[0]));
  const xs = pts(120);

  const pathD = arr => arr.map((x, i) => `${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(arr[i]).toFixed(1)}`).join(" ");
  const fPath = pathD(xs.map(f));
  const kPath = pathD(xs.map(kStar));

  const fAtX = f(xStar);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontWeight: 700, color: "#f472b6", marginBottom: "6px", fontSize: "0.95rem" }}>⟨f, k(·, x*)⟩_ℋ = f(x*) — The Reproducing Property</div>
      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "14px" }}>Drag the slider to move x*. Notice how the kernel k(·, x*) "probes" f at exactly that point.</div>

      <svg width={width} height={height} style={{ display: "block", margin: "0 auto" }}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#1e3a5f" strokeWidth={1} />
        <path d={fPath} fill="none" stroke="#7dd3fc" strokeWidth={2.5} />
        <path d={kPath} fill="none" stroke="#f472b6" strokeWidth={2} strokeDasharray="5,3" />
        <line x1={toSvgX(xStar)} y1={10} x2={toSvgX(xStar)} y2={height - 10} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4,3" />
        <circle cx={toSvgX(xStar)} cy={toSvgY(fAtX)} r={5} fill="#fbbf24" />
        <text x={toSvgX(xStar) + 7} y={toSvgY(fAtX) - 7} fill="#fbbf24" fontSize="11" fontFamily="monospace">f(x*) = {fAtX.toFixed(2)}</text>
        <text x={8} y={18} fill="#7dd3fc" fontSize="11" fontFamily="monospace">f(x)</text>
        <text x={8} y={34} fill="#f472b6" fontSize="11" fontFamily="monospace">k(·, x*)</text>
      </svg>

      <input type="range" min={domain[0]} max={domain[1]} step={0.02} value={xStar} onChange={e => setXStar(+e.target.value)}
        style={{ width: "100%", accentColor: "#fbbf24", marginTop: "10px" }} />
      <div style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", marginTop: "4px" }}>x* = {xStar.toFixed(2)}</div>

      <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ background: "rgba(125,211,252,0.06)", border: "1px solid rgba(125,211,252,0.15)", borderRadius: "6px", padding: "10px" }}>
          <div style={{ fontSize: "0.7rem", color: "#7dd3fc", marginBottom: "4px" }}>f(x) — blue curve</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Any function in ℋ, here written as Σ αᵢ k(·, xᵢ)</div>
        </div>
        <div style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.15)", borderRadius: "6px", padding: "10px" }}>
          <div style={{ fontSize: "0.7rem", color: "#f472b6", marginBottom: "4px" }}>k(·, x*) — pink dashed</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>The "representer" of evaluation. Taking inner product with f gives f(x*).</div>
        </div>
      </div>
    </div>
  );
}

// Ridge regression smoothness visualizer
function RidgeViz() {
  const [lambda, setLambda] = useState(0.5);
  const sigma = 0.4;
  const width = 340, height = 160;
  const domain = [-2.5, 2.5];

  // Fake "training" data
  const trainX = [-1.8, -1.1, -0.4, 0.2, 0.8, 1.4, 2.0];
  const trainY = [0.4, 0.7, -0.2, -0.6, 0.3, 0.8, 0.1];

  const k = (x, y) => Math.exp(-Math.pow(x - y, 2) / (2 * sigma * sigma));

  // Build kernel matrix and solve (K + λI)α = y
  const n = trainX.length;
  const K = trainX.map(x => trainX.map(y => k(x, y)));

  // Gauss elimination solver (simple)
  const solve = (A, b) => {
    const n = b.length;
    const M = A.map((row, i) => [...row.map((v, j) => j === i ? v + lambda : v), b[i]]);
    for (let col = 0; col < n; col++) {
      for (let row = col + 1; row < n; row++) {
        const factor = M[row][col] / M[col][col];
        for (let k = col; k <= n; k++) M[row][k] -= factor * M[col][k];
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = M[i][n];
      for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j];
      x[i] /= M[i][i];
    }
    return x;
  };

  const alpha = solve(K, trainY);
  const predict = x => alpha.reduce((s, a, i) => s + a * k(x, trainX[i]), 0);

  const xs = Array.from({ length: 100 }, (_, i) => domain[0] + (i / 99) * (domain[1] - domain[0]));
  const toSvgX = x => ((x - domain[0]) / (domain[1] - domain[0])) * width;
  const toSvgY = y => height / 2 - y * 55;
  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(predict(x)).toFixed(1)}`).join(" ");

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontWeight: 700, color: "#34d399", marginBottom: "6px", fontSize: "0.95rem" }}>⚖ Kernel Ridge Regression — λ controls smoothness</div>
      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "14px" }}>Adjust λ to see underfitting vs overfitting. Solution: α* = (K + λI)⁻¹y</div>

      <svg width={width} height={height} style={{ display: "block", margin: "0 auto", borderRadius: "6px", background: "rgba(0,0,0,0.2)" }}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#1e3a5f" strokeWidth={1} />
        <path d={pathD} fill="none" stroke="#34d399" strokeWidth={2.5} />
        {trainX.map((x, i) => <circle key={i} cx={toSvgX(x)} cy={toSvgY(trainY[i])} r={4} fill="#7dd3fc" stroke="#0c1a2e" strokeWidth={1} />)}
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
        <span style={{ fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>λ = {lambda.toFixed(3)}</span>
        <input type="range" min={0.001} max={5} step={0.005} value={lambda} onChange={e => setLambda(+e.target.value)} style={{ flex: 1, accentColor: "#34d399" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b", marginTop: "4px" }}>
        <span>← Overfit (small λ)</span>
        <span>Underfit (large λ) →</span>
      </div>

      <div style={{ marginTop: "12px", padding: "10px", background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "6px", fontSize: "0.75rem", color: "#a7f3d0", lineHeight: 1.7 }}>
        λ penalizes ‖f‖²_ℋ — the RKHS norm. Large λ forces a smoother function (smaller norm). Small λ prioritizes fitting each data point.
      </div>
    </div>
  );
}

const CONTENT = {
  intro: (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", marginBottom: "8px" }}>Reproducing Kernel Hilbert Spaces</h2>
      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "20px" }}>
        RKHS theory is one of the most elegant corners of functional analysis, and it has concrete algorithmic consequences. The core idea: <strong style={{ color: "#f8fafc" }}>work with potentially infinite-dimensional feature spaces implicitly</strong>, via a kernel function that computes inner products between features without ever constructing them.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { icon: "⟨φ(x),φ(x')⟩", title: "Kernel trick", desc: "Compute high/infinite-dim dot products cheaply" },
          { icon: "≥0", title: "Positive definite", desc: "The algebraic fingerprint of every valid kernel" },
          { icon: "f(x)=⟨f,k(·,x)⟩", title: "Reproducing property", desc: "Evaluation as an inner product — the magic of RKHS" },
          { icon: "‖f‖²_ℋ", title: "Smoothness control", desc: "The RKHS norm encodes function regularity" },
        ].map(c => (
          <div key={c.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", color: "#7dd3fc", marginBottom: "6px" }}>{c.icon}</div>
            <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.9rem", marginBottom: "4px" }}>{c.title}</div>
            <div style={{ color: "#64748b", fontSize: "0.78rem", lineHeight: 1.6 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <Callout type="insight">
        The lecture (Gretton, 2019) follows a precise path: define kernels constructively → prove positive definiteness → use PD to build the RKHS → prove the reproducing property → apply to MMD, kernel PCA, and ridge regression. We'll follow the same path, with more intuition at each step.
      </Callout>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.1rem", fontWeight: 700, marginTop: "24px", marginBottom: "12px" }}>Why do we care?</h3>
      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        The XOR example is telling. You cannot linearly separate XOR-arranged points in ℝ². But map them to ℝ³ with <Tex>φ(x) = [x₁, x₂, x₁x₂]</Tex>, and you can. The problem: for complex data (documents, sequences, images), the feature dimension can be <em>infinite</em>. RKHS theory lets you run algorithms in that space without paying the infinite-dimensional cost, as long as your algorithm only needs dot products — which most do.
      </p>

      <Callout type="warning">
        This is often called the "kernel trick," but it's more than a trick — it's a rigorous mathematical framework. The trick is a consequence of a deep theorem (Moore-Aronszajn): every positive definite function corresponds to a unique RKHS.
      </Callout>
    </div>
  ),

  kernels: (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", marginBottom: "16px" }}>What is a Kernel?</h2>

      <Callout type="def">
        A function <Tex>k : 𝒳 × 𝒳 → ℝ</Tex> is a <strong>kernel</strong> if there exists a Hilbert space ℋ and a map <Tex>φ : 𝒳 → ℋ</Tex> such that<br /><br />
        <Tex block>k(x, x') = ⟨φ(x), φ(x')⟩_ℋ</Tex>
        That is: k(x,x') computes the inner product between features of x and x', in some (possibly implicit) Hilbert space.
      </Callout>

      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        Crucially, <Tex>𝒳</Tex> doesn't even need to have an inner product itself. You can't take an inner product between two books — but you can map them to word histograms and take a dot product there. The kernel does this implicitly.
      </p>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "24px", marginBottom: "12px" }}>Building Blocks: Kernel Construction Rules</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Scaled kernel", math: "αk  (α > 0)", why: "Scales the feature space" },
          { label: "Sum of kernels", math: "k₁ + k₂", why: "Concatenate feature maps: φ = [φ₁; φ₂]" },
          { label: "Product of kernels", math: "k₁ · k₂", why: "Tensor (outer) product of feature maps" },
          { label: "Composed kernel", math: "k(A(x), A(x'))", why: "Preprocess inputs before comparing" },
        ].map(r => (
          <div key={r.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px" }}>
            <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "4px" }}>{r.label}</div>
            <div style={{ fontFamily: "Georgia, serif", color: "#7dd3fc", marginBottom: "6px" }}>{r.math}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.why}</div>
          </div>
        ))}
      </div>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Key Kernels</h3>

      {[
        {
          name: "Polynomial Kernel",
          formula: "k(x,x') = (⟨x,x'⟩ + c)ᵐ",
          detail: "Proved valid using the product/sum rules: expand (⟨x,x'⟩+c)ᵐ by the binomial theorem — each term ⟨x,x'⟩ⁿ is a kernel by repeated products, and the sum of kernels is a kernel.",
          features: "Captures all monomials of degree ≤ m. For x ∈ ℝᵈ, this is a finite-dimensional feature space of size C(d+m, m).",
        },
        {
          name: "Taylor Series Kernels",
          formula: "k(x,x') = f(⟨x,x'⟩) = Σ aₙ ⟨x,x'⟩ⁿ",
          detail: "If f has a convergent Taylor series with non-negative coefficients aₙ ≥ 0, then k is a valid kernel (it's a non-negative-weighted sum of kernels ⟨x,x'⟩ⁿ).",
          features: "This gives us the exponential kernel exp(⟨x,x'⟩), which has infinitely many features.",
        },
        {
          name: "Gaussian (RBF) Kernel",
          formula: "k(x,x') = exp(−γ⁻² ‖x − x'‖²)",
          detail: "Derived from the exponential kernel via: expand ‖x−x'‖² = ‖x‖²−2⟨x,x'⟩+‖x'‖², factor out the ‖x‖² terms (which become scalings), and use the product + mapping rules.",
          features: "Infinite-dimensional feature space (all Hermite polynomial features). Corresponds to points being 'similar' when they're close in input space.",
        },
      ].map(k => (
        <div key={k.name} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
          <div style={{ fontWeight: 700, color: "#7dd3fc", marginBottom: "6px" }}>{k.name}</div>
          <Tex block>{k.formula}</Tex>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "8px" }}><strong style={{ color: "#cbd5e1" }}>Why valid:</strong> {k.detail}</p>
          <p style={{ color: "#64748b", fontSize: "0.8rem", lineHeight: 1.6 }}><strong style={{ color: "#94a3b8" }}>Features:</strong> {k.features}</p>
        </div>
      ))}

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Interactive: The Gram Matrix</h3>
      <KernelMatrixViz />
    </div>
  ),

  pd: (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", marginBottom: "16px" }}>Positive Definiteness</h2>

      <Callout type="def">
        A symmetric function <Tex>k : 𝒳 × 𝒳 → ℝ</Tex> is <strong>positive definite (PD)</strong> if for all n ≥ 1, all <Tex>a₁,...,aₙ ∈ ℝ</Tex>, and all <Tex>x₁,...,xₙ ∈ 𝒳</Tex>:
        <Tex block>∑ᵢ ∑ⱼ aᵢaⱼ k(xᵢ,xⱼ) ≥ 0</Tex>
        Equivalently: for any finite set of points, the Gram matrix <Tex>K</Tex> with <Tex>K[i,j] = k(xᵢ,xⱼ)</Tex> is a positive semi-definite matrix.
      </Callout>

      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        This might look like a technical condition, but it's the right one. Let's see why every kernel must be PD, and why PD is sufficient to guarantee a kernel exists.
      </p>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Direction 1: Every Kernel is PD</h3>
      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
        This is the easy direction. Given <Tex>k(x,y) = ⟨φ(x), φ(y)⟩_ℋ</Tex>:
      </p>
      <Tex block>
        ∑ᵢ∑ⱼ aᵢaⱼ k(xᵢ,xⱼ) = ∑ᵢ∑ⱼ ⟨aᵢφ(xᵢ), aⱼφ(xⱼ)⟩_ℋ = ‖∑ᵢ aᵢ φ(xᵢ)‖²_ℋ ≥ 0
      </Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        It's a norm squared — always non-negative. The proof is just regrouping the inner product linearly.
      </p>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Direction 2: Every PD Function is a Kernel (Moore-Aronszajn)</h3>

      <Callout type="theorem">
        <strong>Moore-Aronszajn Theorem:</strong> For every positive definite function k, there exists a <em>unique</em> RKHS ℋ of functions on 𝒳 such that k is the reproducing kernel of ℋ.
      </Callout>

      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        This is profound: you don't need to specify the feature map φ explicitly. Just show k is PD, and you're guaranteed a feature space exists. The "canonical" feature map is <Tex>φ(x) = k(·, x)</Tex> — the kernel itself as a function of its first argument.
      </p>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Practical Consequences</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "8px", padding: "14px" }}>
          <div style={{ color: "#34d399", fontWeight: 700, fontSize: "0.85rem", marginBottom: "8px" }}>✓ Sum of PD kernels is PD</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6 }}>
            The double-sum splits linearly:<br />
            ∑∑ aᵢaⱼ(k₁+k₂) = [∑∑ aᵢaⱼk₁] + [∑∑ aᵢaⱼk₂] ≥ 0
          </div>
        </div>
        <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "8px", padding: "14px" }}>
          <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.85rem", marginBottom: "8px" }}>✗ Difference of kernels may not be PD</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6 }}>
            If k₁(x,x) − k₂(x,x) {"<"} 0, the diagonal entries are negative, violating PD. So "kernel subtraction" is not a free operation.
          </div>
        </div>
      </div>

      <div style={{ marginTop: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "14px" }}>
        <div style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "8px", fontSize: "0.9rem" }}>Why PD matrices have non-negative eigenvalues</div>
        <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.7 }}>
          If <Tex>K</Tex> is the Gram matrix, PD means <Tex>aᵀKa ≥ 0</Tex> for all vectors a. Choosing a = eigenvector eᵢ gives <Tex>eᵢᵀKeᵢ = λᵢ‖eᵢ‖² ≥ 0</Tex>, so all eigenvalues λᵢ ≥ 0. This is exactly positive semi-definiteness of the matrix. The Gram matrix diagonal visualized earlier always has all non-negative eigenvalues.
        </div>
      </div>
    </div>
  ),

  rkhs: (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", marginBottom: "16px" }}>The Reproducing Kernel Hilbert Space</h2>

      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "16px" }}>
        We've talked about kernels as inner products between feature maps. An RKHS is a Hilbert space of <em>functions</em> built out of those features — where functions can be represented as elements of the space, and evaluating a function at a point is itself a continuous linear operation.
      </p>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "16px", marginBottom: "12px" }}>From Features to Functions</h3>

      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
        In the finite-dimensional XOR example with <Tex>φ(x) = [x₁, x₂, x₁x₂]</Tex>, a function of x can be written as:
      </p>
      <Tex block>f(x) = ax₁ + bx₂ + cx₁x₂ = ⟨[a,b,c], φ(x)⟩</Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        So f is represented by its weight vector <Tex>[a,b,c] ∈ ℝ³</Tex>. The space of all such functions is the RKHS ℋ. In the infinite-dimensional case (e.g. Gaussian kernel), a function is:
      </p>
      <Tex block>f(x) = Σ_&#123;ℓ=1&#125;^∞ fₗ φₗ(x)</Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        where <Tex>{`{fₗ}∞ₗ₌₁ ∈ ℓ²`}</Tex> (square summable). The Cauchy-Schwarz inequality ensures f(x) is finite.
      </p>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>The Canonical Feature Map: φ(x) = k(·, x)</h3>

      <Callout type="insight">
        Here's the magic. Instead of defining φ(x) as some explicit vector, use the kernel itself: <Tex>φ(x) := k(·,x)</Tex> — this is a <em>function</em> of the free variable, parameterized by x. Then:<br /><br />
        <Tex block>k(x,y) = ⟨k(·,x), k(·,y)⟩_ℋ = ⟨φ(x), φ(y)⟩_ℋ</Tex>
        This is self-consistent: the kernel of the canonical map is k itself. The RKHS ℋ is the closure of the span of all such functions <Tex>{`{k(·,x) : x ∈ 𝒳}`}</Tex>.
      </Callout>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Formal Definition</h3>

      <Callout type="def">
        A Hilbert space ℋ of ℝ-valued functions on 𝒳 is a <strong>Reproducing Kernel Hilbert Space</strong> with kernel k if:<br /><br />
        1. <strong>Membership:</strong> ∀x ∈ 𝒳, the function k(·, x) ∈ ℋ<br /><br />
        2. <strong>Reproducing property:</strong> ∀x ∈ 𝒳, ∀f ∈ ℋ:<br />
        <Tex block>⟨f, k(·, x)⟩_ℋ = f(x)</Tex>
        The kernel "reproduces" point evaluation via an inner product.
      </Callout>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Equivalent Definition: Bounded Evaluation</h3>

      <Callout type="def">
        ℋ is an RKHS iff for all x ∈ 𝒳, the <strong>evaluation functional</strong> δₓ : f ↦ f(x) is <em>bounded</em>: there exists λₓ ≥ 0 such that:
        <Tex block>|f(x)| = |δₓf| ≤ λₓ ‖f‖_ℋ   ∀f ∈ ℋ</Tex>
      </Callout>

      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        This is a powerful regularity condition. In L² (the space of square-integrable functions), evaluation is <em>not</em> bounded — two functions can be equal in L² norm but differ wildly at individual points. In an RKHS, if two functions are close in norm, they're close <em>pointwise everywhere</em>.
      </p>

      <Tex block>|f(x) − g(x)| ≤ λₓ ‖f − g‖_ℋ   ∀f,g ∈ ℋ</Tex>

      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        Why does this follow? With the reproducing property: <Tex>|f(x)| = |⟨f, k(·,x)⟩| ≤ ‖f‖_ℋ · ‖k(·,x)‖_ℋ = ‖f‖_ℋ · k(x,x)^&#123;1/2&#125;</Tex> (Cauchy-Schwarz), so <Tex>λₓ = k(x,x)^&#123;1/2&#125;</Tex>.
      </p>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>The RKHS Norm and Smoothness</h3>

      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
        In the Fourier example on [−π,π], the RKHS inner product is:
      </p>
      <Tex block>⟨f,g⟩_ℋ = Σₗ f̂ₗ ĝₗ / k̂ₗ</Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        So the norm is:
      </p>
      <Tex block>‖f‖²_ℋ = Σₗ |f̂ₗ|² / k̂ₗ</Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        If <Tex>k̂ₗ</Tex> decays fast with frequency ℓ (like the Gaussian kernel), then <Tex>|f̂ₗ|²</Tex> must decay even faster for ‖f‖²_ℋ to be finite. This penalizes high-frequency (non-smooth) components. The RKHS is a space of smooth functions, and the norm measures roughness.
      </p>

      <Callout type="insight">
        RKHS functions in the Gaussian case are representable as finite sums of kernels at data points:<br />
        <Tex block>f(x) = Σᵢ αᵢ k(xᵢ, x)</Tex>
        This is not just a parametrization trick — it's forced by the Representer Theorem. You never need to write down the infinite eigenbasis explicitly.
      </Callout>
    </div>
  ),

  repr: (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", marginBottom: "16px" }}>The Reproducing Property — Deep Dive</h2>

      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "16px" }}>
        This is the heart of RKHS theory. The statement <Tex>⟨f, k(·,x)⟩_ℋ = f(x)</Tex> looks simple, but let's fully unpack why it holds, what it means geometrically, and why it's so useful.
      </p>

      <ReproducingViz />

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "24px", marginBottom: "12px" }}>Verification in the Fourier Case</h3>

      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
        For functions on [−π,π] with Fourier coefficients, we defined:
      </p>
      <Tex block>k(x,y) = Σₗ k̂ₗ exp(iℓ(x−y))  →  k̂ₗ(z) = k̂ₗ exp(−iℓz)</Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>Applying the ℋ inner product:</p>
      <Tex block>⟨f(·), k(·,z)⟩_ℋ = Σₗ [f̂ₗ · (k̂ₗ exp(−iℓz))] / k̂ₗ = Σₗ f̂ₗ exp(iℓz) = f(z) ✓</Tex>

      <Callout type="insight">
        Notice how the k̂ₗ factors cancel out perfectly — this is why the roughness-penalized inner product (dividing by k̂ₗ) is the right definition. It's engineered so that the reproducing property holds.
      </Callout>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Verification in the Eigenexpansion Case (Gaussian Kernel on ℝ)</h3>

      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
        The Gaussian kernel has an eigenexpansion with eigenfunctions eₗ (Hermite polynomials, weighted by Gaussian measure) and eigenvalues λₗ:
      </p>
      <Tex block>k(x,x') = Σₗ λₗ eₗ(x) eₗ(x')   →   φₗ(x) = √λₗ eₗ(x)</Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "8px" }}>The RKHS inner product:</p>
      <Tex block>⟨f,g⟩_ℋ = Σₗ f̂ₗ ĝₗ / λₗ</Tex>
      <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "8px" }}>Checking the reproducing property, with g(x) = k(x−z):</p>
      <Tex block>⟨f(·), k(·,z)⟩_ℋ = Σₗ f̂ₗ (λₗ eₗ(z)) / λₗ = Σₗ f̂ₗ eₗ(z) = f(z) ✓</Tex>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Why "Reproducing"?</h3>

      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        The name comes from the following: taking the inner product with <Tex>k(·,x)</Tex> "reproduces" the evaluation of f at x. In functional analysis, the evaluation map <Tex>δₓ : f ↦ f(x)</Tex> is a linear functional. By the Riesz representation theorem, every bounded linear functional on a Hilbert space is representable as an inner product with some fixed element. In the RKHS, that element is <Tex>k(·,x)</Tex>.
      </p>

      <div style={{ marginTop: "16px", background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "8px", padding: "14px" }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.85rem", marginBottom: "8px" }}>Connection to the Riesz Representation Theorem</div>
        <div style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.7 }}>
          If ℋ is a Hilbert space and T : ℋ → ℝ is a bounded linear functional, then there exists a unique g ∈ ℋ such that T(f) = ⟨f, g⟩_ℋ for all f ∈ ℋ. In an RKHS, δₓ is bounded, so its representer is k(·,x). This gives the reproducing property — it's not an additional axiom, it's a consequence of Riesz.
        </div>
      </div>

      <h3 style={{ color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, marginTop: "20px", marginBottom: "12px" }}>Why is ℋ Larger than {`{φ(x): x ∈ 𝒳}`}?</h3>

      <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
        In the XOR example, <Tex>φ(x) = [x₁, x₂, x₁x₂]</Tex>. The vector <Tex>[1, 1, -1]</Tex> is in ℋ (it's a valid weight vector), but no input x produces this as a feature map. The RKHS is the span (and limit points) of all <Tex>k(·,xᵢ)</Tex>, which is strictly larger than the image of φ. Think of ℋ as all functions you can write as linear combinations of kernels, plus their limit points.
      </p>

      <Callout type="warning">
        This distinction matters for algorithms. When you optimize over f ∈ ℋ in kernel methods, you're allowed to consider functions not corresponding to any single training point. The Representer Theorem then shows the optimal f is always in the span of the training-point kernels anyway — a beautiful convergence of necessity and sufficiency.
      </Callout>
    </div>
  ),

  apps: (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", marginBottom: "16px" }}>Applications of RKHS Theory</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {["MMD", "Kernel PCA", "Ridge Regression"].map(t => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      {/* App 1: MMD */}
      <div style={{ border: "1px solid rgba(125,211,252,0.15)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ fontWeight: 800, color: "#7dd3fc", fontSize: "1.05rem", marginBottom: "10px" }}>① Maximum Mean Discrepancy (MMD)</div>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          Given samples <Tex>{`{xᵢ}ᵐ`}</Tex> from p and <Tex>{`{yⱼ}ⁿ`}</Tex> from q, the squared distance between their feature-space means is:
        </p>
        <Tex block>
          ‖μ_p − μ_q‖²_ℋ = (1/m²)∑ᵢ∑ⱼ k(xᵢ,xⱼ) + (1/n²)∑ᵢ∑ⱼ k(yᵢ,yⱼ) − (2/mn)∑ᵢ∑ⱼ k(xᵢ,yⱼ)
        </Tex>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          This is computed entirely via kernel evaluations — never the feature map φ. The result follows by expanding the squared RKHS norm and applying the reproducing property.
        </p>
        <Callout type="insight">
          Why is this useful? For a rich enough kernel (e.g. Gaussian), MMD = 0 iff p = q. It's a principled distance between probability distributions. This is the foundation of kernel two-sample tests and generative model evaluation (the FID score for GANs is conceptually related).
        </Callout>
        <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.7 }}>
          <strong style={{ color: "#94a3b8" }}>Power of the feature space:</strong> With φ(x) = x, you distinguish distributions by mean. With φ(x) = [x, x²], you distinguish by mean and variance. With the Gaussian kernel (infinite features), you can distinguish any two distributions with different moments — arbitrarily complex statistical structure is captured.
        </div>
      </div>

      {/* App 2: Kernel PCA */}
      <div style={{ border: "1px solid rgba(167,139,250,0.15)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ fontWeight: 800, color: "#a78bfa", fontSize: "1.05rem", marginBottom: "10px" }}>② Kernel PCA</div>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          Classical PCA finds the eigenvectors of the sample covariance matrix C. In feature space:
        </p>
        <Tex block>C = (1/n) Σᵢ φ̃(xᵢ) ⊗ φ̃(xᵢ)</Tex>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          where φ̃(x) = φ(x) − (1/n)Σφ(xᵢ) is the centered feature map. The principal directions f satisfy <Tex>λf = Cf</Tex>, where f ∈ ℋ. Because ℋ can be infinite-dimensional, this seems intractable — but the Representer Theorem says:
        </p>
        <Tex block>fₗ = Σᵢ αₗᵢ φ̃(xᵢ)</Tex>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          Projecting the eigenvalue equation onto each <Tex>φ̃(x_q)</Tex> and using the reproducing property, the infinite-dimensional problem reduces to:
        </p>
        <Tex block>nλₗ αₗ = K̃ αₗ   where K̃ = HKH</Tex>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          Here <Tex>K[i,j] = k(xᵢ,xⱼ)</Tex>, and <Tex>H = I − (1/n)𝟙𝟙ᵀ</Tex> is the centering matrix. So you just solve the eigenproblem of an n×n matrix — never touching the feature space at all.
        </p>
        <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "6px", padding: "12px" }}>
          <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.8rem", marginBottom: "6px" }}>Normalization and projection</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.7 }}>
            To get unit-norm eigenfunctions: replace α ← α/√(nλ). To project a new point x*:<br />
            ⟨φ(x*), fₗ⟩_ℋ = Σⱼ αⱼ [k(x*,xⱼ) − (1/n)Σₖ k(x*,xₖ)]
          </div>
        </div>
        <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "#64748b", lineHeight: 1.7 }}>
          <strong style={{ color: "#94a3b8" }}>Application:</strong> Image denoising (USPS digit dataset). Linear PCA projects onto a hyperplane; kernel PCA projects onto a nonlinear manifold in input space, recovering cleaner images.
        </div>
      </div>

      {/* App 3: Ridge Regression */}
      <div style={{ border: "1px solid rgba(52,211,153,0.15)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ fontWeight: 800, color: "#34d399", fontSize: "1.05rem", marginBottom: "10px" }}>③ Kernel Ridge Regression</div>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          Ridge regression minimizes:
        </p>
        <Tex block>min_&#123;f∈ℋ&#125; Σᵢ (yᵢ − ⟨f, φ(xᵢ)⟩_ℋ)² + λ‖f‖²_ℋ</Tex>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          The RKHS norm ‖f‖²_ℋ acts as a smoothness penalty. By the Representer Theorem, the optimal solution is:
        </p>
        <Tex block>f*(x) = Σᵢ αᵢ* k(xᵢ, x)   where   α* = (K + λI)⁻¹ y</Tex>
        <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "10px" }}>
          To derive this: substitute the representer form for f and expand — the objective becomes <Tex>‖y − Kα‖² + λαᵀKα</Tex>. Differentiating with respect to α and setting to zero gives <Tex>(K² + λK)α = Ky</Tex>, which simplifies to <Tex>(K + λI)α = y</Tex>.
        </p>

        <RidgeViz />

        <div style={{ marginTop: "14px" }}>
          <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.9rem", marginBottom: "8px" }}>Connection to Bayesian inference</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.7 }}>
            Ridge regression has a Bayesian interpretation as MAP estimation under a Gaussian process prior with covariance function k. The λ parameter controls the prior strength. Full Bayesian treatment (GP regression) also gives uncertainty estimates alongside predictions.
          </div>
        </div>
      </div>

      <Callout type="insight">
        All three applications share the same pattern: (1) Lift to feature space via φ, (2) Compute using only inner products ⟨φ(x), φ(x')⟩ = k(x,x'), (3) The final algorithm only touches the n×n kernel matrix K — no explicit feature computation needed, regardless of feature dimension.
      </Callout>
    </div>
  ),
};

function RKHSExplainer() {
  const [active, setActive] = useState("intro");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060d1a 0%, #0c1a2e 50%, #0a1628 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "18px 28px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "rgba(0,0,0,0.2)",
      }}>
        <div style={{
          fontFamily: "Georgia, serif",
          fontSize: "1.3rem",
          color: "#7dd3fc",
          fontStyle: "italic",
        }}>ℋ</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.02em" }}>RKHS — Interactive Deep Dive</div>
          <div style={{ fontSize: "0.72rem", color: "#475569", letterSpacing: "0.06em" }}>Based on Gretton (2019) · Full Technical Depth</div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: "220px",
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "20px 12px",
          background: "rgba(0,0,0,0.15)",
          overflowY: "auto",
        }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              marginBottom: "4px",
              background: active === s.id ? "rgba(125,211,252,0.1)" : "transparent",
              borderLeft: active === s.id ? "2px solid #7dd3fc" : "2px solid transparent",
              color: active === s.id ? "#f8fafc" : "#64748b",
              fontSize: "0.82rem",
              fontWeight: active === s.id ? 700 : 400,
              lineHeight: 1.4,
              transition: "all 0.15s",
            }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: active === s.id ? "#7dd3fc" : "#334155", marginBottom: "2px" }}>{s.icon}</div>
              {s.label}
            </button>
          ))}

          <div style={{ marginTop: "24px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.65rem", color: "#334155", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Key Symbols</div>
            {[["ℋ", "RKHS (Hilbert space)"], ["φ(x)", "Feature map"], ["k(·,x)", "Kernel at x"], ["⟨·,·⟩_ℋ", "ℋ inner product"], ["δₓ", "Evaluation functional"], ["‖·‖_ℋ", "RKHS norm"]].map(([s, d]) => (
              <div key={s} style={{ marginBottom: "6px" }}>
                <span style={{ fontFamily: "Georgia, serif", color: "#7dd3fc", fontSize: "0.78rem" }}>{s}</span>
                <div style={{ color: "#475569", fontSize: "0.7rem" }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {CONTENT[active]}
        </div>
      </div>
    </div>
  );
}

window.RKHSExplainer = RKHSExplainer;
