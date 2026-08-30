from scripts.models import SourceDocument
from scripts.parse import parse_document


def test_parse_case_with_multiple_questions_and_answers():
    source = SourceDocument(id="source01", relative_path="01/第一章.pdf", sha256="0" * 64, pages=3, size_bytes=10)
    text = """【例题·案例题】逻辑框架法
    某项目背景材料和投资额 1000 万元。
    【问题】1. 列出目标层次。
    【参考答案】投入/活动：政府资金投入。
    【问题】2. 说明垂直逻辑。
    【参考答案】目标、目的、产出、投入四个层次。
    【解析】按因果关系逐层检查。
    """
    cases = parse_document(source, text)
    assert len(cases) == 1
    assert len(cases[0].subquestions) == 2
    assert "政府资金" in cases[0].subquestions[0].answer.reference
    assert cases[0].sources[0].pages == [1]


def test_parse_falls_back_to_whole_document_when_markers_are_missing():
    source = SourceDocument(id="source02", relative_path="mock.pdf", sha256="0" * 64, pages=2, size_bytes=10)
    cases = parse_document(source, "某综合题背景。\n答案：采用收益法。")
    assert len(cases) == 1
    assert cases[0].subquestions[0].answer.reference
