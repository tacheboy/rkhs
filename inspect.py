from pathlib import Path
import sys
sys.stdout.reconfigure(encoding='utf-8')
s = Path('rkhs_explainer.jsx').read_text(encoding='utf-8')
idx = s.find('min_{')
print(idx, s[idx:idx+30])
for ch in s[idx:idx+15]:
    print(ch, hex(ord(ch)))
