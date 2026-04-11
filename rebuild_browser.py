from pathlib import Path
src = Path('rkhs_explainer.jsx').read_text(encoding='utf-8')
# Convert module imports/exports for browser usage.
src = src.replace('import { useState } from "react";\n\n', 'const { useState } = React;\n\n', 1)
src = src.replace('export default function RKHSExplainer()', 'function RKHSExplainer()', 1)
if 'window.RKHSExplainer' not in src:
    src = src.rstrip() + '\n\nwindow.RKHSExplainer = RKHSExplainer;\n'
Path('rkhs_explainer.browser.jsx').write_text(src, encoding='utf-8')
