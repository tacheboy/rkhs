from pathlib import Path

def fix_tex(file_path: str) -> None:
    text = Path(file_path).read_text(encoding='utf-8')
    out = []
    i = 0
    while True:
        start = text.find('<Tex', i)
        if start == -1:
            out.append(text[i:])
            break
        out.append(text[i:start])
        tag_end = text.find('>', start)
        if tag_end == -1:
            out.append(text[start:])
            break
        open_tag = text[start:tag_end+1]
        close_tag = '</Tex>'
        close = text.find(close_tag, tag_end+1)
        if close == -1:
            out.append(text[start:])
            break
        inner = text[tag_end+1:close]
        inner_stripped = inner.strip()
        # Only escape braces for plain-text math; leave explicit JSX expressions alone.
        if not (inner_stripped.startswith('{') and inner_stripped.endswith('}')):
            inner = inner.replace('{', '&#123;').replace('}', '&#125;')
        out.append(open_tag + inner + close_tag)
        i = close + len(close_tag)
    Path(file_path).write_text(''.join(out), encoding='utf-8')

for f in ['rkhs_explainer.jsx', 'rkhs_explainer.browser.jsx']:
    fix_tex(f)
