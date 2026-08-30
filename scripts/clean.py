from __future__ import annotations

import re
import unicodedata


AD_PATTERNS = [
    re.compile(r"(?:加群|加微|加微信|联系(?:老师|我)|押题|密训|内部资料|QQ|微信)", re.I),
    re.compile(r"(?:版权所有|未经许可|盗版|转载|复制)", re.I),
]
SPACE_RE = re.compile(r"[ \t\u3000]+")


def clean_text(text: str) -> str:
    """Remove non-content noise while keeping page breaks, tables, and formulas."""
    text = unicodedata.normalize("NFKC", text).replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\f", "\n__PAGE_BREAK__\n")
    text = re.sub(r"<!--.*?-->\s*", "", text, flags=re.S)
    kept: list[str] = []
    for raw_line in text.split("\n"):
        line = SPACE_RE.sub(" ", raw_line).strip()
        if line == "__PAGE_BREAK__":
            kept.append("\f")
            continue
        if not line:
            if kept and kept[-1] != "":
                kept.append("")
            continue
        if any(pattern.search(line) for pattern in AD_PATTERNS):
            continue
        kept.append(line)
    while kept and kept[-1] == "":
        kept.pop()
    return "\n".join(kept)
