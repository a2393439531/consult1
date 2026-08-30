from __future__ import annotations

import re
import unicodedata


AD_PATTERNS = [
    re.compile(r"(?:加群|加微|加微信|联系(?:老师|我)|押题|密训|内部资料|QQ|微信)", re.I),
    re.compile(r"(?:版权所有|未经许可|盗版|转载|复制|学员专用|请勿外泄)", re.I),
]
SPACE_RE = re.compile(r"[ \t\u3000]+")


def clean_text(text: str) -> str:
    """Remove non-content noise while keeping page breaks, tables, and formulas."""
    text = unicodedata.normalize("NFKC", text).replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\f", "\n__PAGE_BREAK__\n")
    text = re.sub(r"【[^】\n]{0,20}?问[^】\n]{0,20}?题[^】\n]{0,20}?】", "【问题】", text)
    text = re.sub(r"【[^】\n]{0,20}?参[^】\n]{0,20}?考[^】\n]{0,20}?答[^】\n]{0,20}?案[^】\n]{0,20}?】", "【参考答案】", text)
    text = re.sub(r"【[^】\n]{0,20}?解[^】\n]{0,20}?析[^】\n]{0,20}?】", "【解析】", text)
    text = re.sub(r"\|\s*【(问题|参考答案|解析)】\s*\|", r"\n【\1】\n", text)
    text = re.sub(r"<!--.*?-->\s*", "", text, flags=re.S)
    kept: list[str] = []
    for raw_line in text.split("\n"):
        line = SPACE_RE.sub(" ", raw_line).strip()
        if line == "__PAGE_BREAK__":
            kept.append("\f")
            continue
        previous_nonempty = next((item for item in reversed(kept) if item not in ("", "\f")), None)
        if line == "题" and previous_nonempty == "【问题】":
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
    result = "\n".join(kept)
    return re.sub(r"(【(?:问题|参考答案|解析)】)\n{2,}", r"\1\n", result)
