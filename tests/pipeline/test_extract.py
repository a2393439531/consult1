from pathlib import Path

from scripts.extract import extract_document
from scripts.models import SourceDocument


def test_markitdown_runs_first_and_fallback_is_conditional(monkeypatch, tmp_path: Path):
    source_root = tmp_path / "source"
    source_root.mkdir()
    pdf = source_root / "lesson.pdf"
    pdf.write_bytes(b"pdf")
    raw_dir = tmp_path / "raw"
    source = SourceDocument(id="abc123", relative_path="lesson.pdf", sha256="0" * 64, pages=1, size_bytes=3)
    calls: list[list[str]] = []

    class Result:
        returncode = 0
        stderr = ""

    def fake_run(command: list[str]):
        calls.append(command)
        Path(command[-1]).parent.mkdir(parents=True, exist_ok=True)
        Path(command[-1]).write_text("第一章 现代工程咨询方法\n【问题】1. 说明方法。\n" * 8 if command[0] == "markitdown" else "", encoding="utf-8")
        return Result()

    monkeypatch.setattr("scripts.extract.run_command", fake_run)
    result = extract_document(source_root, source, raw_dir)

    assert calls[0][0] == "markitdown"
    assert len(calls) == 1
    assert result.extractor == "markitdown"
    assert "source_id: abc123" in (raw_dir / "abc123.md").read_text(encoding="utf-8")


def test_extract_uses_layout_fallback_when_density_is_too_low(monkeypatch, tmp_path: Path):
    source_root = tmp_path / "source"
    source_root.mkdir()
    (source_root / "scan.pdf").write_bytes(b"pdf")
    source = SourceDocument(id="scan01", relative_path="scan.pdf", sha256="0" * 64, pages=2, size_bytes=3)
    calls: list[list[str]] = []

    class Result:
        returncode = 0
        stderr = ""

    def fake_run(command: list[str]):
        calls.append(command)
        output = Path(command[-1])
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("短" if command[0] == "markitdown" else "第一章 " * 50, encoding="utf-8")
        return Result()

    monkeypatch.setattr("scripts.extract.run_command", fake_run)
    result = extract_document(source_root, source, tmp_path / "raw")

    assert [call[0] for call in calls] == ["markitdown", "pdftotext"]
    assert result.extractor == "pdftotext"
    assert "fallback" in result.warnings[0]
