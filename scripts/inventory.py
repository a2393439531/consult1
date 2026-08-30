from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

from pypdf import PdfReader

try:
    from .models import SourceDocument
except ImportError:  # pragma: no cover - supports direct script invocation
    from models import SourceDocument


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def make_source_id(relative_path: str) -> str:
    return hashlib.sha1(relative_path.encode("utf-8")).hexdigest()[:12]


def page_count(path: Path) -> int:
    try:
        return len(PdfReader(str(path)).pages)
    except Exception:  # noqa: BLE001 - encrypted PDFs are handled by pdfinfo
        result = subprocess.run(["pdfinfo", str(path)], capture_output=True, text=True, encoding="utf-8", errors="replace")
        match = re.search(r"^Pages:\s*(\d+)", result.stdout, flags=re.MULTILINE)
        if not match:
            raise RuntimeError(f"unable to determine page count for {path}: {result.stderr.strip()}")
        return int(match.group(1))


def inventory(root: Path) -> list[SourceDocument]:
    if not root.is_dir():
        raise FileNotFoundError(f"source root does not exist: {root}")
    records: list[SourceDocument] = []
    for path in sorted(root.rglob("*"), key=lambda item: item.as_posix().lower()):
        if path.suffix.lower() != ".pdf" or not path.is_file():
            continue
        relative = path.relative_to(root).as_posix()
        records.append(
            SourceDocument(
                id=make_source_id(relative),
                relative_path=relative,
                sha256=sha256_file(path),
                pages=page_count(path),
                size_bytes=path.stat().st_size,
            )
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description="Inventory authorized PDF sources")
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    records = inventory(args.source_root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps([record.model_dump(mode="json") for record in records], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"{len(records)} PDFs / {sum(record.pages for record in records)} pages")


if __name__ == "__main__":
    main()
