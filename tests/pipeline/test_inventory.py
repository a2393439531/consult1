from pathlib import Path

from scripts import inventory as inventory_module


def test_inventory_only_collects_pdfs_and_sorts(monkeypatch, tmp_path: Path):
    (tmp_path / "b.pdf").write_bytes(b"b")
    (tmp_path / "a.PDF").write_bytes(b"a")
    (tmp_path / "ignore.mp4").write_bytes(b"video")

    class FakeReader:
        def __init__(self, _path: str):
            self.pages = [object(), object()]

    monkeypatch.setattr(inventory_module, "PdfReader", FakeReader)
    records = inventory_module.inventory(tmp_path)

    assert [record.relative_path for record in records] == ["a.PDF", "b.pdf"]
    assert all(len(record.sha256) == 64 for record in records)
    assert all(record.pages == 2 for record in records)
