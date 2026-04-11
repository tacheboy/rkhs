from pathlib import Path
import unicodedata

path = Path('rkhs_explainer.browser.jsx')
data = path.read_text(encoding='utf-8')
# Normalize to ASCII to avoid Babel parse errors from Unicode symbols.
# This is a lossy fallback for the browser-only build.
normalized = unicodedata.normalize('NFKD', data).encode('ascii', 'ignore').decode('ascii')
path.write_text(normalized, encoding='utf-8')
