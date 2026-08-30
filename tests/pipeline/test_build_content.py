import json
from pathlib import Path

from scripts.build_content import build_content
from scripts.inventory import make_source_id


def test_build_content_merges_duplicate_and_writes_chapter_and_exam_shards(tmp_path: Path):
    root = tmp_path / "source"
    raw_dir = tmp_path / "raw"
    output = tmp_path / "public" / "data"
    root.mkdir()
    raw_dir.mkdir()
    sources = [
        {"id": make_source_id("精题必练第九章.pdf"), "relative_path": "精题必练第九章.pdf", "sha256": "a" * 64, "pages": 1, "size_bytes": 10},
        {"id": make_source_id("融资模考.pdf"), "relative_path": "融资模考.pdf", "sha256": "b" * 64, "pages": 1, "size_bytes": 10},
    ]
    (tmp_path / "manifest.json").write_text(json.dumps(sources, ensure_ascii=False), encoding="utf-8")
    for source, answer in zip(sources, ["债务融资需要还本付息。", "债务融资需要按时还本付息并关注资产负债率。"]):
        (raw_dir / f"{source['id']}.md").write_text(
            f"【例题·案例题】融资案例\n甲公司拟采用银行贷款。\n【问题】1. 融资方式的风险？\n【参考答案】{answer}\n",
            encoding="utf-8",
        )
    manifest = build_content(tmp_path / "manifest.json", raw_dir, output)
    assert manifest["totals"]["published_case_count"] == 1
    assert manifest["totals"]["duplicate_group_count"] == 1
    assert manifest["exams"]
    assert (output / "chapters" / "chapter-09.json").exists()
    assert json.loads((output / "exams" / f"exam-{sources[1]['id']}.json").read_text(encoding="utf-8"))["question_ids"]
